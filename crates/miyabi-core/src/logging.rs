use std::{
    fs::{self, OpenOptions},
    io::Write,
    path::Path,
};

use anyhow::{Context, Result};
use chrono::Utc;
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct LogAction {
    pub timestamp: String,
    pub action: String,
    pub detail: Option<String>,
}

pub fn log_action<P: AsRef<Path>>(logs_dir: P, entry: LogAction) -> Result<()> {
    fs::create_dir_all(&logs_dir)?;
    let file = logs_dir.as_ref().join("actions.log");
    let mut handle = OpenOptions::new()
        .create(true)
        .append(true)
        .open(&file)
        .with_context(|| format!("failed to open log file {:?}", file))?;
    let payload = serde_json::to_string(&entry)?;
    writeln!(handle, "{}", payload)?;
    Ok(())
}

pub fn info(action: &str, detail: Option<String>) -> LogAction {
    LogAction {
        timestamp: Utc::now().to_rfc3339(),
        action: action.to_string().to_uppercase(),
        detail,
    }
}
