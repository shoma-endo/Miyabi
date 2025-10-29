use std::collections::HashMap;

use anyhow::{bail, Result};
use miyabi_types::AgentKind;

use crate::{AgentContext, AgentExecutor, CoordinatorAgent, ExecutionReport};

pub enum BuiltInAgent {
    Coordinator(CoordinatorAgent),
}

impl BuiltInAgent {
    pub fn executor(&self) -> &dyn AgentExecutor {
        match self {
            BuiltInAgent::Coordinator(agent) => agent,
        }
    }
}

pub struct AgentRegistry {
    agents: HashMap<AgentKind, BuiltInAgent>,
}

impl Default for AgentRegistry {
    fn default() -> Self {
        Self::new()
    }
}

impl AgentRegistry {
    pub fn new() -> Self {
        let mut agents = HashMap::new();
        agents.insert(AgentKind::Coordinator, BuiltInAgent::Coordinator(CoordinatorAgent));
        Self { agents }
    }

    pub fn run_coordinator(
        &self,
        ctx: &AgentContext,
        work_item: &miyabi_types::WorkItem,
    ) -> Result<Vec<ExecutionReport>> {
        let agent = self
            .agents
            .get(&AgentKind::Coordinator)
            .ok_or_else(|| anyhow::anyhow!("Coordinator agent not registered"))?;

        if let BuiltInAgent::Coordinator(coordinator) = agent {
            coordinator.orchestrate(work_item, ctx)
        } else {
            bail!("Coordinator agent not available")
        }
    }
}
