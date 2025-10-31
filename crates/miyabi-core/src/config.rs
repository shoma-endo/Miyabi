use std::{fs, path::PathBuf};

use anyhow::{Context, Result};
use directories::ProjectDirs;
use miyabi_types::ProjectMetadata;
use serde::{Deserialize, Serialize};
use chrono::{DateTime, Utc};

use crate::filesystem::{ProjectPaths, ensure_dir_with_permissions, ensure_file_with_permissions};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MiyabiConfig {
    pub project: ProjectMetadata,
    pub github_token: Option<String>,
}

impl Default for MiyabiConfig {
    fn default() -> Self {
        let now: DateTime<Utc> = Utc::now();
        Self {
            project: ProjectMetadata {
                name: "miyabi-project".into(),
                repository: None,
                created_at: now,
                device_identifier: hostname::get()
                    .map(|h| h.to_string_lossy().to_string())
                    .unwrap_or_else(|_| "unknown-device".into()),
            },
            github_token: None,
        }
    }
}

/// Miyabi設定ファイル管理の責務を持つマネージャー
///
/// # 責務
/// - config.toml の読み書き
/// - デフォルト設定の初期化
/// - 設定のバリデーション
///
/// # 設計原則
/// - **Composition over Inheritance**: ProjectPaths を所有し、パス管理を委譲
/// - **Single Responsibility**: 設定ファイルの管理のみに集中
/// - ディレクトリパス管理は ProjectPaths に完全委譲
///
/// # 例
/// ```no_run
/// use miyabi_core::MiyabiConfigManager;
/// use std::env;
///
/// let manager = MiyabiConfigManager::new(env::current_dir().unwrap())?;
/// let config = manager.load_or_init()?;
/// # Ok::<(), anyhow::Error>(())
/// ```
pub struct MiyabiConfigManager {
    /// プロジェクトパス構造（委譲先）
    paths: ProjectPaths,
}

impl MiyabiConfigManager {
    /// プロジェクトルートから MiyabiConfigManager を構築
    ///
    /// # 引数
    /// - `root`: プロジェクトルートディレクトリ
    ///
    /// # 戻り値
    /// - 設定マネージャーインスタンス
    ///
    /// # 例
    /// ```no_run
    /// use miyabi_core::MiyabiConfigManager;
    /// use std::env;
    ///
    /// let manager = MiyabiConfigManager::new(env::current_dir().unwrap())?;
    /// # Ok::<(), anyhow::Error>(())
    /// ```
    pub fn new<P: Into<PathBuf>>(root: P) -> Result<Self> {
        let paths = ProjectPaths::new(root);
        Ok(Self { paths })
    }

    /// ProjectPaths から直接 MiyabiConfigManager を構築
    ///
    /// # 引数
    /// - `paths`: 既存の ProjectPaths インスタンス
    ///
    /// # 戻り値
    /// - 設定マネージャーインスタンス
    ///
    /// # 例
    /// ```no_run
    /// use miyabi_core::{MiyabiConfigManager, ProjectPaths};
    /// use std::env;
    ///
    /// let paths = ProjectPaths::new(env::current_dir().unwrap());
    /// let manager = MiyabiConfigManager::from_paths(paths);
    /// ```
    pub fn from_paths(paths: ProjectPaths) -> Self {
        Self { paths }
    }

    /// 内部の ProjectPaths への参照を取得
    ///
    /// # 戻り値
    /// - ProjectPaths への不変参照
    ///
    /// # 例
    /// ```no_run
    /// use miyabi_core::MiyabiConfigManager;
    /// use std::env;
    ///
    /// let manager = MiyabiConfigManager::new(env::current_dir().unwrap())?;
    /// let logs_path = &manager.paths().logs;
    /// # Ok::<(), anyhow::Error>(())
    /// ```
    pub fn paths(&self) -> &ProjectPaths {
        &self.paths
    }

    /// 設定ファイルを読み込むか、なければデフォルトで初期化
    ///
    /// # 戻り値
    /// - 読み込まれた、または新規作成された MiyabiConfig
    ///
    /// # エラー
    /// - ファイル読み込み失敗
    /// - TOML パース失敗
    /// - 初期化失敗
    pub fn load_or_init(&self) -> Result<MiyabiConfig> {
        let config_file = self.paths.config_file();
        if config_file.exists() {
            let raw = fs::read_to_string(&config_file)
                .with_context(|| format!("failed to read {:?}", config_file))?;
            let cfg = toml::from_str(&raw)
                .with_context(|| format!("failed to parse {:?}", config_file))?;
            Ok(cfg)
        } else {
            self.init_with_defaults()
        }
    }

    /// デフォルト設定で初期化
    ///
    /// # 処理内容
    /// 1. .miyabi ディレクトリ作成
    /// 2. config.toml にデフォルト設定を書き込み
    /// 3. 適切なパーミッション設定（Unix: 0o600）
    ///
    /// # 戻り値
    /// - 作成された MiyabiConfig
    ///
    /// # エラー
    /// - ディレクトリ作成失敗
    /// - ファイル書き込み失敗
    /// - パーミッション設定失敗
    pub fn init_with_defaults(&self) -> Result<MiyabiConfig> {
        // ディレクトリ構造を作成
        self.paths.ensure_structure()?;

        // デフォルト設定を生成
        let config = MiyabiConfig::default();
        let raw = toml::to_string_pretty(&config)?;

        // config.toml を書き込み（パーミッション 0o600）
        let config_file = self.paths.config_file();
        ensure_file_with_permissions(&config_file, &raw, 0o600)?;

        Ok(config)
    }

    /// 設定ファイルを保存
    ///
    /// # 引数
    /// - `config`: 保存する MiyabiConfig
    ///
    /// # 処理内容
    /// 1. ディレクトリ構造の確認・作成
    /// 2. TOML フォーマットにシリアライズ
    /// 3. config.toml に書き込み（パーミッション 0o600）
    ///
    /// # エラー
    /// - ディレクトリ作成失敗
    /// - シリアライズ失敗
    /// - ファイル書き込み失敗
    pub fn save(&self, config: &MiyabiConfig) -> Result<()> {
        // ディレクトリ構造を確認・作成
        self.paths.ensure_structure()?;

        // TOML フォーマットにシリアライズ
        let raw = toml::to_string_pretty(config)?;

        // config.toml に書き込み（パーミッション 0o600）
        let config_file = self.paths.config_file();
        ensure_file_with_permissions(&config_file, &raw, 0o600)?;

        Ok(())
    }

    /// config ディレクトリへの参照を取得（非推奨）
    ///
    /// # 非推奨理由
    /// - `self.paths().config` を直接参照すること
    ///
    /// # 移行例
    /// ```rust
    /// // 旧: let config_dir = manager.config_dir();
    /// // 新: let config_dir = &manager.paths().config;
    /// ```
    #[deprecated(since = "0.2.0", note = "Use `self.paths().config` instead")]
    pub fn config_dir(&self) -> &PathBuf {
        &self.paths.config
    }

    /// logs ディレクトリを取得し、存在を確認（非推奨）
    ///
    /// # 非推奨理由
    /// - `self.paths().logs` を直接参照し、必要に応じて `ensure_structure()` を呼ぶこと
    ///
    /// # 移行例
    /// ```no_run
    /// # use miyabi_core::MiyabiConfigManager;
    /// # use std::env;
    /// # let manager = MiyabiConfigManager::new(env::current_dir().unwrap())?;
    /// // 旧: let logs_dir = manager.logs_dir()?;
    /// // 新:
    /// manager.paths().ensure_structure()?;
    /// let logs_dir = &manager.paths().logs;
    /// # Ok::<(), anyhow::Error>(())
    /// ```
    #[deprecated(
        since = "0.2.0",
        note = "Use `self.paths().logs` directly and call `ensure_structure()` if needed"
    )]
    pub fn logs_dir(&self) -> Result<PathBuf> {
        ensure_dir_with_permissions(&self.paths.logs, 0o700)?;
        Ok(self.paths.logs.clone())
    }

    /// reports ディレクトリを取得し、存在を確認（非推奨）
    ///
    /// # 非推奨理由
    /// - `self.paths().reports` を直接参照し、必要に応じて `ensure_structure()` を呼ぶこと
    ///
    /// # 移行例
    /// ```no_run
    /// # use miyabi_core::MiyabiConfigManager;
    /// # use std::env;
    /// # let manager = MiyabiConfigManager::new(env::current_dir().unwrap())?;
    /// // 旧: let reports_dir = manager.reports_dir()?;
    /// // 新:
    /// manager.paths().ensure_structure()?;
    /// let reports_dir = &manager.paths().reports;
    /// # Ok::<(), anyhow::Error>(())
    /// ```
    #[deprecated(
        since = "0.2.0",
        note = "Use `self.paths().reports` directly and call `ensure_structure()` if needed"
    )]
    pub fn reports_dir(&self) -> Result<PathBuf> {
        ensure_dir_with_permissions(&self.paths.reports, 0o700)?;
        Ok(self.paths.reports.clone())
    }

    /// グローバル設定ディレクトリを取得（非推奨）
    ///
    /// # 非推奨理由
    /// - 現在未使用の機能
    ///
    /// # 注意
    /// - 将来的に削除予定
    #[deprecated(since = "0.2.0", note = "Unused functionality, will be removed")]
    pub fn global_dirs() -> Result<ProjectDirs> {
        ProjectDirs::from("dev", "Miyabi", "miyabi")
            .context("failed to determine project directories")
    }
}
