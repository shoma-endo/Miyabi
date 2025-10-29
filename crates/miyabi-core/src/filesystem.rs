use std::path::{Path, PathBuf};

use anyhow::{Context, Result};
use walkdir::WalkDir;

#[derive(Debug, Clone)]
pub struct ProjectPaths {
    pub root: PathBuf,
    pub config: PathBuf,
    pub logs: PathBuf,
    pub reports: PathBuf,
}

impl ProjectPaths {
    pub fn new(root: PathBuf) -> Self {
        let config = root.join(".miyabi");
        Self {
            logs: config.join("logs"),
            reports: config.join("reports"),
            config,
            root,
        }
    }
}

pub struct WorkspaceDetector;

impl WorkspaceDetector {
    pub fn detect(start: &Path) -> Option<PathBuf> {
        for ancestor in start.ancestors() {
            if ancestor.join(".miyabi").exists() {
                return Some(ancestor.to_path_buf());
            }
        }
        None
    }

    pub fn ensure_structure(paths: &ProjectPaths) -> Result<()> {
        std::fs::create_dir_all(&paths.config)
            .with_context(|| format!("failed to create {:?}", paths.config))?;
        std::fs::create_dir_all(&paths.logs)
            .with_context(|| format!("failed to create {:?}", paths.logs))?;
        std::fs::create_dir_all(&paths.reports)
            .with_context(|| format!("failed to create {:?}", paths.reports))?;
        Ok(())
    }
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
