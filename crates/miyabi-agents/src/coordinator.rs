use anyhow::Result;
use miyabi_types::{AgentKind, AgentOutcome, AgentTask, TaskPriority, WorkItem};

use crate::{execution::success_outcome, AgentContext, AgentExecutor, ExecutionReport};

pub struct CoordinatorAgent;

impl AgentExecutor for CoordinatorAgent {
    fn kind(&self) -> AgentKind {
        AgentKind::Coordinator
    }

    fn name(&self) -> &'static str {
        "CoordinatorAgent"
    }

    fn run(&self, task: &AgentTask, _ctx: &AgentContext) -> Result<AgentOutcome> {
        Ok(success_outcome(
            task,
            "Task queued for specialist agents (simulated)",
        ))
    }
}

impl CoordinatorAgent {
    pub fn build_plan(&self, work_item: &WorkItem) -> Vec<AgentTask> {
        let mut tasks = Vec::new();

        tasks.push(AgentTask {
            agent: AgentKind::Issue,
            title: "Analyze issue context".into(),
            description: format!(
                "Review the problem statement for '{}'",
                work_item.title
            ),
            priority: TaskPriority::High,
            ..AgentTask::new("analyze", "analyze", AgentKind::Issue)
        });

        tasks.push(AgentTask {
            agent: AgentKind::CodeGen,
            title: "Implement solution".into(),
            description: "Generate code changes to satisfy the requirements".into(),
            priority: TaskPriority::High,
            ..AgentTask::new("codegen", "codegen", AgentKind::CodeGen)
        });

        tasks.push(AgentTask {
            agent: AgentKind::Test,
            title: "Run verification suite".into(),
            description: "Execute unit and integration tests".into(),
            priority: TaskPriority::Medium,
            ..AgentTask::new("test", "test", AgentKind::Test)
        });

        tasks.push(AgentTask {
            agent: AgentKind::Review,
            title: "Review code changes".into(),
            description: "Perform automated review of generated code".into(),
            priority: TaskPriority::Medium,
            ..AgentTask::new("review", "review", AgentKind::Review)
        });

        tasks
    }

    pub fn orchestrate(
        &self,
        work_item: &WorkItem,
        ctx: &AgentContext,
    ) -> Result<Vec<ExecutionReport>> {
        let plan = self.build_plan(work_item);
        let mut reports = Vec::new();
        for task in plan {
            let outcome = self.run(&task, ctx)?;
            reports.push(ExecutionReport { task, outcome });
        }
        Ok(reports)
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use miyabi_types::WorkItemStatus;

    #[test]
    fn coordinator_builds_execution_plan() {
        let coordinator = CoordinatorAgent;
        let work_item = WorkItem {
            issue_number: Some(42),
            title: "Test feature".into(),
            description: "Implement test feature".into(),
            status: WorkItemStatus::Pending,
            tasks: Vec::new(),
        };
        let ctx = AgentContext::default();
        let reports = coordinator.orchestrate(&work_item, &ctx).unwrap();
        assert_eq!(reports.len(), 4);
        assert!(reports.iter().all(|report| report.outcome.success));
    }
}
