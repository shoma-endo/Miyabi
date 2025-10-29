use std::env;

use anyhow::{Context, Result};
use clap::{Parser, Subcommand, ValueEnum};
use colored::Colorize;
use indicatif::{ProgressBar, ProgressStyle};
use miyabi_agents::{AgentContext, AgentRegistry};
use miyabi_core::{log_action, info, MiyabiConfig, MiyabiConfigManager, ProjectPaths, WorkspaceDetector};
use miyabi_types::{AgentKind, AgentTask, TaskPriority, WorkItem, WorkItemStatus};
use uuid::Uuid;

fn main() -> Result<()> {
    let cli = Cli::parse();
    match cli.command {
        Commands::Init { name, repository, device } => cmd_init(name, repository, device),
        Commands::Status => cmd_status(),
        Commands::WorkOn { issue, title, description } => cmd_work_on(issue, title, description),
        Commands::Agent { command } => cmd_agent(command),
    }
}

#[derive(Parser, Debug)]
#[command(name = "miyabi", version, about = "Miyabi Autonomous Development CLI")]
struct Cli {
    #[command(subcommand)]
    command: Commands,
}

#[derive(Subcommand, Debug)]
enum Commands {
    /// 初期セットアップを行います
    Init {
        #[arg(long, help = "プロジェクト名")]
        name: String,
        #[arg(long, help = "GitHubリポジトリ (owner/repo)", required = false)]
        repository: Option<String>,
        #[arg(long, help = "デバイス識別子", required = false)]
        device: Option<String>,
    },
    /// 現在のステータスを表示します
    Status,
    /// Issueを処理します（エージェントを自動実行）
    WorkOn {
        #[arg(long, help = "Issue番号")]
        issue: Option<u64>,
        #[arg(long, help = "タスクのタイトル")]
        title: String,
        #[arg(long, help = "詳細説明")]
        description: String,
    },
    /// 個別エージェントを実行します
    Agent {
        #[command(subcommand)]
        command: AgentCommands,
    },
}

#[derive(Subcommand, Debug)]
enum AgentCommands {
    /// 指定したエージェントを実行
    Run {
        #[arg(value_enum)]
        agent: AgentType,
        #[arg(long)]
        title: String,
        #[arg(long)]
        description: String,
    },
}

#[derive(Clone, Debug, ValueEnum)]
enum AgentType {
    Coordinator,
}

fn cmd_init(name: String, repository: Option<String>, device: Option<String>) -> Result<()> {
    let cwd = env::current_dir().context("failed to determine current directory")?;
    let paths = ProjectPaths::new(cwd.clone());
    WorkspaceDetector::ensure_structure(&paths)?;

    let manager = MiyabiConfigManager::new(&cwd)?;
    let mut config = MiyabiConfig::default();
    config.project.name = name;
    config.project.repository = repository;
    if let Some(device) = device {
        config.project.device_identifier = device;
    }

    manager.save(&config)?;
    let logs_dir = manager.logs_dir()?;
    log_action(
        logs_dir,
        info("init", Some(format!("Initialized project at {}", cwd.display()))),
    )?;

    println!("{}", "🎉 初期化が完了しました！".green());
    println!(
        "{} {}",
        "プロジェクトルート:".bold(),
        cwd.display()
    );
    println!(
        "{} {}",
        "設定ファイル:".bold(),
        manager.config_dir().join("config.toml").display()
    );
    Ok(())
}

fn cmd_status() -> Result<()> {
    let cwd = env::current_dir()?;
    let root = WorkspaceDetector::detect(&cwd).unwrap_or(cwd.clone());
    let manager = MiyabiConfigManager::new(&root)?;
    let config = manager.load_or_init()?;
    let paths = ProjectPaths::new(root.clone());

    println!("{}", "📊 Miyabi ステータス".bold().cyan());
    println!("{} {}", "プロジェクト名:".bold(), config.project.name);
    if let Some(repo) = config.project.repository {
        println!("{} {}", "リポジトリ:".bold(), repo);
    }
    println!(
        "{} {}",
        "作成日:".bold(),
        config.project.created_at.to_rfc3339()
    );
    println!(
        "{} {}",
        "デバイス:".bold(),
        config.project.device_identifier
    );
    println!();

    println!("{}", "ディレクトリ構成".bold());
    println!(" - {}", paths.config.display());
    println!(" - {}", paths.logs.display());
    println!(" - {}", paths.reports.display());
    println!();

    let reports = miyabi_core::filesystem::list_recent_reports(&paths.reports)?;
    if reports.is_empty() {
        println!("{}", "レポート: なし".yellow());
    } else {
        println!("{}", "最新レポート:".bold());
        for entry in reports.iter().take(5) {
            println!(" - {}", entry.display());
        }
    }
    Ok(())
}

fn cmd_work_on(issue: Option<u64>, title: String, description: String) -> Result<()> {
    let cwd = env::current_dir()?;
    let root = WorkspaceDetector::detect(&cwd).unwrap_or(cwd);
    let manager = MiyabiConfigManager::new(&root)?;
    let config = manager.load_or_init()?;

    let work_item = WorkItem {
        issue_number: issue,
        title: title.clone(),
        description: description.clone(),
        status: WorkItemStatus::InProgress,
        tasks: Vec::new(),
    };

    println!("{}", "🤖 エージェント実行を開始します".bold().green());
    println!("{} {}", "対象:".bold(), title);
    if let Some(issue) = issue {
        println!("{} #{}", "Issue:".bold(), issue);
    }
    println!();

    let bar = ProgressBar::new_spinner();
    bar.set_style(
        ProgressStyle::with_template("{spinner} {msg}")
            .unwrap()
            .tick_chars("/-\\| "),
    );
    bar.set_message("CoordinatorAgent 実行中…");
    bar.enable_steady_tick(std::time::Duration::from_millis(120));

    let registry = AgentRegistry::new();
    let ctx = AgentContext {
        environment: [
            ("project".to_string(), config.project.name.clone()),
            (
                "device".to_string(),
                config.project.device_identifier.clone(),
            ),
        ]
        .into_iter()
        .collect(),
    };

    let reports = registry.run_coordinator(&ctx, &work_item)?;
    bar.finish_with_message("CoordinatorAgent 完了");

    println!("{}", "✅ 実行結果".bold().cyan());
    for report in &reports {
        println!(
            " - [{}] {}",
            format!("{:?}", report.task.agent).yellow(),
            report.task.title
        );
        println!("   {}", report.outcome.summary);
    }

    let logs_dir = manager.logs_dir()?;
    log_action(
        logs_dir,
        info(
            "work_on",
            Some(format!(
                "Issue {:?} handled with {} tasks",
                issue,
                reports.len()
            )),
        ),
    )?;

    Ok(())
}

fn cmd_agent(command: AgentCommands) -> Result<()> {
    match command {
        AgentCommands::Run {
            agent,
            title,
            description,
        } => {
            let cwd = env::current_dir()?;
            let root = WorkspaceDetector::detect(&cwd).unwrap_or(cwd);
            let manager = MiyabiConfigManager::new(&root)?;
            let config = manager.load_or_init()?;
            let ctx = AgentContext {
                environment: [
                    ("project".to_string(), config.project.name.clone()),
                    (
                        "device".to_string(),
                        config.project.device_identifier.clone(),
                    ),
                ]
                .into_iter()
                .collect(),
            };
            let task = AgentTask {
                id: Uuid::new_v4(),
                title: title.clone(),
                description: description.clone(),
                agent: match agent {
                    AgentType::Coordinator => AgentKind::Coordinator,
                },
                priority: TaskPriority::Medium,
            };
            let registry = AgentRegistry::new();
            match agent {
                AgentType::Coordinator => {
                    let reports =
                        registry.run_coordinator(&ctx, &WorkItem {
                            issue_number: None,
                            title,
                            description,
                            status: WorkItemStatus::InProgress,
                            tasks: vec![task.clone()],
                        })?;
                    println!("{}", "🧠 CoordinatorAgent 実行結果".bold().cyan());
                    for report in reports {
                        println!(
                            " - [{}] {}",
                            format!("{:?}", report.task.agent).yellow(),
                            report.task.title
                        );
                        println!("   {}", report.outcome.summary);
                    }
                }
            }
        }
    }
    Ok(())
}
