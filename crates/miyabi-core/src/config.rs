use std::{fs, path::PathBuf};

use anyhow::{Context, Result};
use directories::ProjectDirs;
use miyabi_types::ProjectMetadata;
use serde::{Deserialize, Serialize};
use chrono::{DateTime, Utc};

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

pub struct MiyabiConfigManager {
    config_dir: PathBuf,
    config_file: PathBuf,
}

impl MiyabiConfigManager {
    pub fn new<P: Into<PathBuf>>(root: P) -> Result<Self> {
        let root: PathBuf = root.into();
        let config_dir = root.join(".miyabi");
        let config_file = config_dir.join("config.toml");
        Ok(Self {
            config_dir,
            config_file,
        })
    }

    pub fn load_or_init(&self) -> Result<MiyabiConfig> {
        if self.config_file.exists() {
            let raw = fs::read_to_string(&self.config_file)
                .with_context(|| format!("failed to read {:?}", self.config_file))?;
            let cfg = toml::from_str(&raw)
                .with_context(|| format!("failed to parse {:?}", self.config_file))?;
            Ok(cfg)
        } else {
            self.init_with_defaults()
        }
    }

    pub fn init_with_defaults(&self) -> Result<MiyabiConfig> {
        fs::create_dir_all(&self.config_dir)
            .with_context(|| format!("failed to create {:?}", self.config_dir))?;
        let config = MiyabiConfig::default();
        let raw = toml::to_string_pretty(&config)?;
        fs::write(&self.config_file, raw)
            .with_context(|| format!("failed to write {:?}", self.config_file))?;
        Ok(config)
    }

    pub fn save(&self, config: &MiyabiConfig) -> Result<()> {
        fs::create_dir_all(&self.config_dir)
            .with_context(|| format!("failed to create {:?}", self.config_dir))?;
        let raw = toml::to_string_pretty(config)?;
        fs::write(&self.config_file, raw)
            .with_context(|| format!("failed to write {:?}", self.config_file))?;
        Ok(())
    }

    pub fn config_dir(&self) -> &PathBuf {
        &self.config_dir
    }

    pub fn logs_dir(&self) -> Result<PathBuf> {
        let mut dir = self.config_dir.clone();
        dir.push("logs");
        fs::create_dir_all(&dir)?;
        Ok(dir)
    }

    pub fn reports_dir(&self) -> Result<PathBuf> {
        let mut dir = self.config_dir.clone();
        dir.push("reports");
        fs::create_dir_all(&dir)?;
        Ok(dir)
    }

    pub fn global_dirs() -> Result<ProjectDirs> {
        ProjectDirs::from("dev", "Miyabi", "miyabi")
            .context("failed to determine project directories")
    }
}
