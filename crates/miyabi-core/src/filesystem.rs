use std::path::{Path, PathBuf};

use anyhow::{Context, Result};
use walkdir::WalkDir;

/// プロジェクトのディレクトリパス管理の唯一の真実の源 (Single Source of Truth)
///
/// # 責務
/// - プロジェクトルートからの全パスの定義
/// - ディレクトリの作成と適切なパーミッション設定
/// - パスの存在確認とバリデーション
///
/// # 設計原則
/// - Immutable: 一度生成したらパスは変更しない
/// - Self-contained: 必要な操作は全てこの構造体内で完結
#[derive(Debug, Clone)]
pub struct ProjectPaths {
    /// プロジェクトルートディレクトリ
    pub root: PathBuf,

    /// .miyabi ディレクトリ（設定・ログ・レポートの親ディレクトリ）
    pub config: PathBuf,

    /// .miyabi/logs ディレクトリ（アクションログ格納）
    pub logs: PathBuf,

    /// .miyabi/reports ディレクトリ（実行レポート格納）
    pub reports: PathBuf,
}

impl ProjectPaths {
    /// プロジェクトルートから ProjectPaths を構築
    ///
    /// # 引数
    /// - `root`: プロジェクトルートディレクトリ
    ///
    /// # 戻り値
    /// - パス構造体（ディレクトリは作成しない）
    ///
    /// # 例
    /// ```
    /// use std::env;
    /// use miyabi_core::ProjectPaths;
    ///
    /// let cwd = env::current_dir().unwrap();
    /// let paths = ProjectPaths::new(cwd);
    /// assert!(paths.config.ends_with(".miyabi"));
    /// ```
    pub fn new(root: impl Into<PathBuf>) -> Self {
        let root: PathBuf = root.into();
        let config = root.join(".miyabi");
        let logs = config.join("logs");
        let reports = config.join("reports");

        Self {
            root,
            config,
            logs,
            reports,
        }
    }

    /// config.toml ファイルのパスを取得
    ///
    /// # 戻り値
    /// - `.miyabi/config.toml` の完全パス
    pub fn config_file(&self) -> PathBuf {
        self.config.join("config.toml")
    }

    /// actions.log ファイルのパスを取得
    ///
    /// # 戻り値
    /// - `.miyabi/logs/actions.log` の完全パス
    pub fn actions_log(&self) -> PathBuf {
        self.logs.join("actions.log")
    }

    /// 全ディレクトリを作成し、適切なパーミッションを設定
    ///
    /// # 処理内容
    /// 1. .miyabi ディレクトリ作成 (0o700)
    /// 2. .miyabi/logs ディレクトリ作成 (0o700)
    /// 3. .miyabi/reports ディレクトリ作成 (0o700)
    ///
    /// # エラー
    /// - ディレクトリ作成に失敗
    /// - パーミッション設定に失敗（Unix系のみ）
    ///
    /// # 例
    /// ```no_run
    /// use miyabi_core::ProjectPaths;
    /// use std::env;
    ///
    /// let paths = ProjectPaths::new(env::current_dir().unwrap());
    /// paths.ensure_structure()?;
    /// # Ok::<(), anyhow::Error>(())
    /// ```
    pub fn ensure_structure(&self) -> Result<()> {
        ensure_dir_with_permissions(&self.config, 0o700)?;
        ensure_dir_with_permissions(&self.logs, 0o700)?;
        ensure_dir_with_permissions(&self.reports, 0o700)?;
        Ok(())
    }

    /// プロジェクト構造が既に存在するか確認
    ///
    /// # 戻り値
    /// - `.miyabi` ディレクトリが存在すれば `true`
    pub fn exists(&self) -> bool {
        self.config.exists()
    }

    /// プロジェクト構造の検証
    ///
    /// # 検証項目
    /// - .miyabi ディレクトリが存在するか
    /// - .miyabi/config.toml が存在するか
    /// - logs, reports ディレクトリが存在するか
    ///
    /// # 戻り値
    /// - 全て存在すれば `Ok(())`
    /// - 不足があれば詳細なエラーメッセージ
    pub fn validate(&self) -> Result<()> {
        if !self.config.exists() {
            anyhow::bail!(".miyabi directory not found at {:?}", self.config);
        }

        let config_file = self.config_file();
        if !config_file.exists() {
            anyhow::bail!("config.toml not found at {:?}", config_file);
        }

        if !self.logs.exists() {
            anyhow::bail!("logs directory not found at {:?}", self.logs);
        }

        if !self.reports.exists() {
            anyhow::bail!("reports directory not found at {:?}", self.reports);
        }

        Ok(())
    }
}

pub struct WorkspaceDetector;

impl WorkspaceDetector {
    /// カレントディレクトリから祖先を辿ってプロジェクトルートを検出
    ///
    /// # 検出ロジック
    /// - `.miyabi` ディレクトリが存在する最初の祖先を返す
    ///
    /// # 戻り値
    /// - プロジェクトルートが見つかれば `Some(PathBuf)`
    /// - 見つからなければ `None`
    pub fn detect(start: &Path) -> Option<PathBuf> {
        for ancestor in start.ancestors() {
            if ancestor.join(".miyabi").exists() {
                return Some(ancestor.to_path_buf());
            }
        }
        None
    }

    /// プロジェクト構造を作成（非推奨 - ProjectPaths::ensure_structure() を使用）
    ///
    /// # 非推奨理由
    /// - ProjectPaths::ensure_structure() に責務を移譲
    ///
    /// # 移行例
    /// ```rust
    /// // 旧: WorkspaceDetector::ensure_structure(&paths)?;
    /// // 新: paths.ensure_structure()?;
    /// ```
    #[deprecated(
        since = "0.2.0",
        note = "Use ProjectPaths::ensure_structure() instead"
    )]
    pub fn ensure_structure(paths: &ProjectPaths) -> Result<()> {
        paths.ensure_structure()
    }
}

/// ディレクトリを作成し、適切なパーミッションを設定する共通ヘルパー
///
/// # 引数
/// - `path`: 作成するディレクトリパス
/// - `mode`: パーミッション（Unix系のみ有効）
///
/// # Unix系での動作
/// - 0o700: 所有者のみ読み書き実行可能
/// - 0o755: 所有者は読み書き実行、その他は読み実行のみ
///
/// # Windows での動作
/// - パーミッション設定はスキップ（警告なし）
///
/// # エラー
/// - ディレクトリ作成失敗
/// - パーミッション設定失敗（Unix系のみ）
pub fn ensure_dir_with_permissions(path: &Path, mode: u32) -> Result<()> {
    std::fs::create_dir_all(path)
        .with_context(|| format!("Failed to create directory: {:?}", path))?;

    #[cfg(unix)]
    {
        use std::os::unix::fs::PermissionsExt;
        let perms = std::fs::Permissions::from_mode(mode);
        std::fs::set_permissions(path, perms)
            .with_context(|| format!("Failed to set permissions on {:?}", path))?;
    }

    Ok(())
}

/// ファイルを書き込み、適切なパーミッションを設定する共通ヘルパー
///
/// # 引数
/// - `path`: ファイルパス
/// - `content`: 書き込む内容
/// - `mode`: パーミッション（Unix系のみ有効）
///
/// # Unix系での動作
/// - 0o600: 所有者のみ読み書き可能
/// - 0o644: 所有者は読み書き、その他は読み取りのみ
///
/// # エラー
/// - ファイル書き込み失敗
/// - パーミッション設定失敗（Unix系のみ）
pub fn ensure_file_with_permissions(path: &Path, content: &str, mode: u32) -> Result<()> {
    std::fs::write(path, content)
        .with_context(|| format!("Failed to write file: {:?}", path))?;

    #[cfg(unix)]
    {
        use std::os::unix::fs::PermissionsExt;
        let perms = std::fs::Permissions::from_mode(mode);
        std::fs::set_permissions(path, perms)
            .with_context(|| format!("Failed to set permissions on {:?}", path))?;
    }

    Ok(())
}

pub fn list_recent_reports(reports_dir: &Path) -> Result<Vec<PathBuf>> {
    let mut entries = Vec::new();
    if !reports_dir.exists() {
        return Ok(entries);
    }

    for entry in WalkDir::new(reports_dir)
        .min_depth(1)
        .max_depth(1)
        .into_iter()
        .filter_map(|e| e.ok())
    {
        entries.push(entry.into_path());
    }

    entries.sort_by(|a, b| {
        let a_time = std::fs::metadata(a)
            .and_then(|m| m.modified())
            .ok()
            .and_then(|t| t.duration_since(std::time::UNIX_EPOCH).ok());
        let b_time = std::fs::metadata(b)
            .and_then(|m| m.modified())
            .ok()
            .and_then(|t| t.duration_since(std::time::UNIX_EPOCH).ok());
        b_time.cmp(&a_time)
    });

    Ok(entries)
}
