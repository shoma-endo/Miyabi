use anyhow::Result;
use chrono::Utc;
use miyabi_types::{AgentKind, AgentOutcome, AgentTask};
use std::collections::HashMap;

#[derive(Debug, Clone, Default)]
pub struct AgentContext {
    pub environment: HashMap<String, String>,
}

pub trait AgentExecutor {
    fn kind(&self) -> AgentKind;
    fn name(&self) -> &'static str;
    fn run(&self, task: &AgentTask, ctx: &AgentContext) -> Result<AgentOutcome>;
}

#[derive(Debug, Clone)]
pub struct ExecutionReport {
    pub task: AgentTask,
    pub outcome: AgentOutcome,
}

pub fn success_outcome(task: &AgentTask, summary: impl Into<String>) -> AgentOutcome {
    AgentOutcome {
        task_id: task.id,
        success: true,
        summary: summary.into(),
        artifacts: Vec::new(),
        created_at: Utc::now(),
    }
}

pub fn failure_outcome(task: &AgentTask, summary: impl Into<String>) -> AgentOutcome {
    AgentOutcome {
        task_id: task.id,
        success: false,
        summary: summary.into(),
        artifacts: Vec::new(),
        created_at: Utc::now(),
    }
}
