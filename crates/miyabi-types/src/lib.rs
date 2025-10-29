use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use uuid::Uuid;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ProjectMetadata {
    pub name: String,
    pub repository: Option<String>,
    pub created_at: DateTime<Utc>,
    pub device_identifier: String,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
pub enum AgentKind {
    Coordinator,
    CodeGen,
    Review,
    Test,
    Deploy,
    Issue,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AgentTask {
    pub id: Uuid,
    pub title: String,
    pub description: String,
    pub agent: AgentKind,
    pub priority: TaskPriority,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AgentOutcome {
    pub task_id: Uuid,
    pub success: bool,
    pub summary: String,
    pub artifacts: Vec<Artifact>,
    pub created_at: DateTime<Utc>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Artifact {
    pub name: String,
    pub path: Option<String>,
    pub description: Option<String>,
}

#[derive(Debug, Clone, Copy, Serialize, Deserialize, PartialEq, Eq)]
pub enum TaskPriority {
    Critical,
    High,
    Medium,
    Low,
}

impl Default for TaskPriority {
    fn default() -> Self {
        TaskPriority::Medium
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct WorkItem {
    pub issue_number: Option<u64>,
    pub title: String,
    pub description: String,
    pub status: WorkItemStatus,
    pub tasks: Vec<AgentTask>,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
pub enum WorkItemStatus {
    Pending,
    InProgress,
    Completed,
    Failed,
}

impl AgentTask {
    pub fn new<T: Into<String>>(title: T, description: T, agent: AgentKind) -> Self {
        Self {
            id: Uuid::new_v4(),
            title: title.into(),
            description: description.into(),
            agent,
            priority: TaskPriority::default(),
        }
    }
}
