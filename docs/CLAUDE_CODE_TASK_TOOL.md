# Claude Code Task Tool Integration Guide

**Version:** 1.0.0
**Status:** Implementation Guide
**Issue:** #6
**Created:** 2025-10-08

---

## 🎯 Mandate

> **"必ず必ず必ず必ず、クロードコードのタスクツールを使ってタスクとして実行していきます。"**
>
> **ALL work in the Autonomous-Operations project MUST be executed using Claude Code's Task tool.**
> **No exceptions. No direct implementation. Task tool is MANDATORY.**

---

## 📋 What is the Task Tool?

The Task tool in Claude Code allows launching **specialized sub-agents** to handle complex, multi-step tasks autonomously. This enables:

- **Parallel execution**: Multiple agents working simultaneously
- **Specialized skills**: Different agent types for different tasks
- **Isolation**: Each task runs independently
- **Traceability**: Clear audit trail of all agent actions
- **Scalability**: Easy to add more agents for more work

---

## 🤖 Available Agent Types

### 1. `general-purpose`
**Use Case:** Most common agent for development work

**Capabilities:**
- Research complex questions
- Search for code across codebase
- Execute multi-step tasks
- Read/Write/Edit files
- Run bash commands
- Make API calls

**Example Tasks:**
- "Implement the TaskOrchestrator class with full TypeScript types"
- "Research best practices for Git worktree management"
- "Refactor the logger module to use the new theme system"

### 2. `statusline-setup`
**Use Case:** Configure user's Claude Code status line

**Capabilities:**
- Read existing status line config
- Edit status line settings

**Example Tasks:**
- "Configure status line to show current worker and task"

### 3. `output-style-setup`
**Use Case:** Create Claude Code output styles

**Capabilities:**
- Read style files
- Write new styles
- Edit existing styles
- Glob pattern matching
- Grep searches

**Example Tasks:**
- "Create an output style for Agentic OS agent messages"

---

## 🔧 Task Tool API

### Basic Syntax

```typescript
// This is how Claude Code internally represents task launches
Task({
  description: "Short 3-5 word description",
  prompt: "Detailed task description for the agent to perform autonomously",
  subagent_type: "general-purpose" | "statusline-setup" | "output-style-setup"
})
```

### Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `description` | string | ✅ | Short (3-5 word) description of the task |
| `prompt` | string | ✅ | Detailed autonomous task instructions |
| `subagent_type` | string | ✅ | Agent type to use |

### Example: Simple Task

```typescript
Task({
  description: "Implement TaskOrchestrator class",
  prompt: `
    Create the TaskOrchestrator class in agents/coordination/TaskOrchestrator.ts

    Requirements:
    - Implement all methods from the PARALLEL_WORK_ARCHITECTURE.md design
    - Use TypeScript strict mode
    - Add comprehensive JSDoc comments
    - Include error handling
    - Write unit tests in agents/coordination/__tests__/TaskOrchestrator.test.ts

    Return a summary of what was implemented and any issues encountered.
  `,
  subagent_type: "general-purpose"
})
```

---

## 🚀 Usage Patterns

### Pattern 1: Single Task Execution

**Use Case:** Execute one well-defined task

```typescript
// Task: Implement a single class
Task({
  description: "Implement WorkerRegistry class",
  prompt: `
    Implement the WorkerRegistry class as specified in docs/PARALLEL_WORK_ARCHITECTURE.md

    Location: agents/coordination/WorkerRegistry.ts

    Requirements:
    1. Implement all public methods
    2. Add private helper methods as needed
    3. Use Map/Set for efficient lookups
    4. Add input validation
    5. Write JSDoc for all public APIs
    6. Create unit tests

    Return:
    - Summary of implementation
    - Any design decisions made
    - Test coverage percentage
  `,
  subagent_type: "general-purpose"
})
```

### Pattern 2: Parallel Task Execution

**Use Case:** Multiple independent tasks that can run simultaneously

**Important:** Launch multiple tasks in a **single message** with multiple Task tool calls

```typescript
// Launch 3 agents in parallel to work on different components
// Send ONE message with THREE Task tool calls:

// Task 1: TaskOrchestrator
Task({
  description: "Implement TaskOrchestrator class",
  prompt: "Implement agents/coordination/TaskOrchestrator.ts per PARALLEL_WORK_ARCHITECTURE.md...",
  subagent_type: "general-purpose"
})

// Task 2: WorkerRegistry
Task({
  description: "Implement WorkerRegistry class",
  prompt: "Implement agents/coordination/WorkerRegistry.ts per PARALLEL_WORK_ARCHITECTURE.md...",
  subagent_type: "general-purpose"
})

// Task 3: FileLockManager
Task({
  description: "Implement FileLockManager class",
  prompt: "Implement agents/coordination/FileLockManager.ts per PARALLEL_WORK_ARCHITECTURE.md...",
  subagent_type: "general-purpose"
})
```

### Pattern 3: Sequential Task Execution

**Use Case:** Tasks that depend on previous tasks completing

```typescript
// Step 1: Research (wait for completion)
Task({
  description: "Research Git worktree patterns",
  prompt: `
    Research best practices for Git worktree management in CI/CD and multi-worker environments.

    Focus on:
    - Worktree lifecycle (create, use, cleanup)
    - Common pitfalls and solutions
    - Performance considerations
    - Integration with GitHub Actions

    Return a detailed report with code examples.
  `,
  subagent_type: "general-purpose"
})

// Wait for Task 1 to complete, then:

// Step 2: Implementation (uses research results)
Task({
  description: "Implement worktree automation",
  prompt: `
    Based on the research report from the previous task, implement worktree automation scripts.

    Create:
    - scripts/worktree-create.ts
    - scripts/worktree-cleanup.ts
    - tests for both

    Apply best practices from the research.
  `,
  subagent_type: "general-purpose"
})
```

### Pattern 4: Task Monitoring

**Use Case:** Check progress of long-running tasks

```typescript
// Launch task
Task({
  description: "Implement GitHub Projects V2 sync",
  prompt: "Implement full GitHub Projects V2 synchronization per GITHUB_OS_INTEGRATION_PLAN.md Phase A...",
  subagent_type: "general-purpose"
})

// Monitor progress (use AgentOutputTool)
// This is done automatically by Claude Code
// You can check task status in the UI or logs
```

---

## 📝 Writing Effective Task Prompts

### Best Practices

#### ✅ DO:
- **Be specific**: Include exact file paths, class names, function signatures
- **Reference docs**: Point to design documents and specifications
- **Define success**: Clearly state what "done" looks like
- **Request feedback**: Ask agent to return summary and issues
- **Include tests**: Always request unit tests
- **Set context**: Explain why the task matters

#### ❌ DON'T:
- **Be vague**: "Fix the bugs" → "Fix TypeError in TaskOrchestrator.claimTask() line 45"
- **Assume context**: Always provide full context in the prompt
- **Skip validation**: Always request error handling and input validation
- **Forget tests**: Tests are mandatory
- **Ignore style**: Request adherence to project style guides

### Prompt Template

```typescript
Task({
  description: "[Action] [Component]",  // e.g., "Implement TaskOrchestrator class"
  prompt: `
    ## Context
    [Why this task exists and what problem it solves]

    ## Objective
    [What needs to be built/researched/fixed]

    ## Requirements
    1. [Specific requirement 1]
    2. [Specific requirement 2]
    3. [Specific requirement 3]

    ## Location
    - File: [exact/path/to/file.ts]
    - Tests: [exact/path/to/file.test.ts]

    ## Acceptance Criteria
    - [ ] [Criterion 1]
    - [ ] [Criterion 2]
    - [ ] [Criterion 3]

    ## References
    - [Link to design doc]
    - [Link to related code]

    ## Return Format
    Return a JSON object with:
    - summary: Brief description of what was done
    - filesModified: List of files changed
    - testsCoverage: Percentage
    - issues: Any problems encountered
    - nextSteps: Recommended follow-up tasks
  `,
  subagent_type: "general-purpose"
})
```

---

## 🏗️ Integration with Parallel Work Architecture

### How Task Tool Fits In

```
┌─────────────────────────────────────────────────────────────┐
│                    GitHub Issue (Task Source)                │
│                    Issue #6: Parallel Work                   │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           ↓
┌─────────────────────────────────────────────────────────────┐
│              TaskOrchestrator (Coordination)                 │
│  • Breaks Issue into subtasks                                │
│  • Assigns subtasks to workers                               │
│  • Each subtask = Claude Code Task tool invocation          │
└───────┬──────────────────────────────────────────┬──────────┘
        │                                          │
        ↓                                          ↓
┌──────────────────┐                    ┌──────────────────┐
│  Task Tool Call  │                    │  Task Tool Call  │
│  (Agent 1)       │                    │  (Agent 2)       │
│                  │                    │                  │
│  Subtask:        │                    │  Subtask:        │
│  TaskOrchestrator│                    │  WorkerRegistry  │
└────────┬─────────┘                    └────────┬─────────┘
         │                                       │
         └───────────────┬───────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────────┐
│              Git Worktree (Isolated Work)                    │
│  • Each agent works in dedicated worktree                    │
│  • No conflicts between agents                               │
└─────────────────────────────────────────────────────────────┘
```

### Wrapper Implementation

**Location:** `agents/coordination/TaskToolWrapper.ts`

```typescript
import { Task } from '@anthropic-ai/claude-code';

export class TaskToolWrapper {
  /**
   * Execute a task using Claude Code's Task tool
   * This is the ONLY approved way to execute work
   */
  async executeTask(
    task: Task,
    worker: Worker,
    subagentType: SubagentType
  ): Promise<TaskResult> {
    // 1. Pre-execution setup
    await this.prepareWorktree(worker, task);
    await this.reserveFiles(task.affectedFiles);
    await this.logTaskStart(task, worker);

    // 2. Launch Claude Code Task tool
    const agentPrompt = this.buildAgentPrompt(task);

    console.log(`🚀 Launching ${subagentType} agent for ${task.id}`);

    // This is the actual Task tool invocation
    // In practice, this is done via the Claude Code CLI/API
    const result = await Task({
      description: task.title.substring(0, 50),
      prompt: agentPrompt,
      subagent_type: subagentType,
    });

    // 3. Post-execution cleanup
    await this.releaseFiles(task.affectedFiles);
    await this.logTaskComplete(task, worker, result);
    await this.updateGitHubProject(task, result);

    return result;
  }

  /**
   * Build comprehensive prompt for agent
   */
  private buildAgentPrompt(task: Task): string {
    return `
## Task: ${task.title}

## Context
This task is part of Issue #${task.issueNumber} in the Autonomous-Operations project.
You are working in an isolated Git worktree to prevent conflicts.

## Objective
${task.description}

## Requirements
${task.requirements.map((r, i) => `${i + 1}. ${r}`).join('\n')}

## Affected Files
${task.affectedFiles.map(f => `- ${f}`).join('\n')}

## Acceptance Criteria
${task.acceptanceCriteria.map(c => `- [ ] ${c}`).join('\n')}

## References
${task.references.map(r => `- ${r}`).join('\n')}

## Important Notes
- Follow TypeScript strict mode
- Add comprehensive error handling
- Write JSDoc comments for all public APIs
- Create unit tests with >80% coverage
- Follow the project's coding style (see .eslintrc)
- Log all actions to .ai/logs/

## Return Format
Return a JSON object:
{
  "success": true/false,
  "summary": "Brief description",
  "filesModified": ["path1", "path2"],
  "testsCoverage": 85,
  "issues": ["issue1", "issue2"],
  "nextSteps": ["step1", "step2"]
}
`;
  }
}
```

---

## 🔍 Monitoring & Observability

### Task Execution Logs

**Location:** `.ai/logs/task-tool-executions/`

```
.ai/logs/task-tool-executions/
  ├── 2025-10-08.json              # Daily log
  └── tasks/
      ├── issue-6-task-orchestrator.json
      └── issue-6-worker-registry.json
```

**Log Format:**
```json
{
  "taskId": "issue-6-task-orchestrator",
  "workerId": "agent-codegen-1",
  "subagentType": "general-purpose",
  "startedAt": "2025-10-08T10:30:00Z",
  "completedAt": "2025-10-08T11:15:00Z",
  "duration": 2700,
  "prompt": "Implement TaskOrchestrator class...",
  "result": {
    "success": true,
    "summary": "Implemented TaskOrchestrator with all methods",
    "filesModified": [
      "agents/coordination/TaskOrchestrator.ts",
      "agents/coordination/__tests__/TaskOrchestrator.test.ts"
    ],
    "testsCoverage": 87,
    "issues": [],
    "nextSteps": ["Integrate with WorkerRegistry", "Add GitHub Projects sync"]
  }
}
```

### Real-time Monitoring

```bash
# Watch active Task tool executions
npx tsx scripts/monitor-task-tool.ts

# Output:
# 🔍 Active Task Tool Executions (2)
#
# 🤖 agent-codegen-1 (general-purpose)
#    Task: issue-6-task-orchestrator
#    Duration: 12m 30s
#    Status: Writing tests
#
# 🤖 agent-codegen-2 (general-purpose)
#    Task: issue-6-worker-registry
#    Duration: 8m 15s
#    Status: Implementing core logic
```

---

## ⚠️ Error Handling

### Common Errors

#### 1. Task Tool Not Available
```typescript
try {
  await Task({...});
} catch (error) {
  if (error.message.includes('Task tool not available')) {
    console.error('❌ Claude Code Task tool is not accessible');
    console.error('   Ensure you are running within Claude Code environment');
    process.exit(1);
  }
}
```

#### 2. Agent Timeout
```typescript
// Set timeout for long-running tasks
const TASK_TIMEOUT = 30 * 60 * 1000; // 30 minutes

const timeoutPromise = new Promise((_, reject) => {
  setTimeout(() => reject(new Error('Task timeout')), TASK_TIMEOUT);
});

const result = await Promise.race([
  Task({...}),
  timeoutPromise
]);
```

#### 3. Agent Failure
```typescript
const result = await Task({...});

if (!result.success) {
  console.error(`❌ Task failed: ${result.error}`);

  // Log failure
  await logTaskFailure(task, result.error);

  // Retry logic (optional)
  if (task.retries < 3) {
    console.log('🔄 Retrying task...');
    await retryTask(task);
  } else {
    console.log('❌ Max retries reached. Escalating to Guardian.');
    await escalateToGuardian(task, result.error);
  }
}
```

---

## 📊 Performance Considerations

### Task Granularity

**Too Large (❌):**
```typescript
Task({
  description: "Implement entire parallel work system",
  prompt: "Implement everything in PARALLEL_WORK_ARCHITECTURE.md",
  subagent_type: "general-purpose"
})
// Problem: Too broad, hard to monitor, likely to fail
```

**Too Small (⚠️):**
```typescript
Task({
  description: "Add JSDoc to one function",
  prompt: "Add JSDoc comment to TaskOrchestrator.claimTask()",
  subagent_type: "general-purpose"
})
// Problem: Overhead not worth it for trivial task
```

**Just Right (✅):**
```typescript
Task({
  description: "Implement TaskOrchestrator class",
  prompt: "Implement agents/coordination/TaskOrchestrator.ts with all methods, tests, and docs",
  subagent_type: "general-purpose"
})
// Perfect: Well-defined scope, measurable, valuable
```

### Parallel Execution Limits

**Recommended:** 3-5 parallel Task tool calls
**Maximum:** 10 parallel Task tool calls

```typescript
// Good: 3 parallel tasks
Task({...}); // Task 1
Task({...}); // Task 2
Task({...}); // Task 3

// Risky: 10 parallel tasks (may strain resources)
for (let i = 0; i < 10; i++) {
  Task({...});
}
```

---

## 🎯 Success Criteria

A Task tool integration is successful when:

- ✅ **100% adoption**: All work goes through Task tool (no direct implementation)
- ✅ **Clear prompts**: Every task has comprehensive, unambiguous prompt
- ✅ **Complete logging**: Every task execution logged to `.ai/logs/`
- ✅ **High success rate**: >95% of tasks complete successfully on first try
- ✅ **Fast execution**: Average task duration within 20% of estimate
- ✅ **Guardian visibility**: Guardian can monitor all task executions
- ✅ **Traceable results**: Every task returns structured result object

---

## 📖 Examples

### Example 1: Simple Implementation Task

```typescript
Task({
  description: "Implement FileLockManager class",
  prompt: `
Implement the FileLockManager class for parallel work coordination.

Location: agents/coordination/FileLockManager.ts

Requirements:
1. Implement all methods from PARALLEL_WORK_ARCHITECTURE.md:
   - acquireLock(filePath, workerId, taskId): Promise<boolean>
   - releaseLock(filePath): Promise<void>
   - isLocked(filePath): Promise<boolean>
   - getLockInfo(filePath): Promise<LockInfo | null>
   - cleanExpiredLocks(): Promise<void>

2. Lock storage:
   - Use .task-locks/ directory
   - One JSON file per locked file
   - Format: {file, lockedBy, taskId, lockedAt, expiresAt}

3. Error handling:
   - Validate all inputs
   - Handle file system errors gracefully
   - Log all lock operations

4. Tests:
   - Unit tests in agents/coordination/__tests__/FileLockManager.test.ts
   - Test all methods
   - Test lock expiration
   - Test concurrent lock attempts
   - Achieve >85% coverage

Return:
{
  "success": true,
  "summary": "Implemented FileLockManager with full test coverage",
  "filesModified": ["agents/coordination/FileLockManager.ts", ".../__tests__/FileLockManager.test.ts"],
  "testsCoverage": 92,
  "issues": [],
  "nextSteps": ["Integrate with TaskOrchestrator"]
}
  `,
  subagent_type: "general-purpose"
})
```

### Example 2: Research Task

```typescript
Task({
  description: "Research conflict detection patterns",
  prompt: `
Research best practices for detecting and preventing merge conflicts in multi-worker Git workflows.

Focus Areas:
1. File-level conflict detection strategies
2. Directory-based isolation techniques
3. Lock-free coordination patterns
4. Git worktree best practices
5. Real-world case studies from large projects

Deliverable:
Create a markdown report: docs/research/conflict-detection-patterns.md

Include:
- Executive summary
- Detailed findings for each focus area
- Code examples where applicable
- Recommendations for Agentic OS
- References to source materials

Return:
{
  "success": true,
  "summary": "Completed conflict detection research",
  "filesModified": ["docs/research/conflict-detection-patterns.md"],
  "keyFindings": ["finding1", "finding2", "finding3"],
  "recommendations": ["rec1", "rec2", "rec3"]
}
  `,
  subagent_type: "general-purpose"
})
```

### Example 3: Parallel Implementation

```typescript
// Launch 3 agents in parallel (SINGLE message with 3 Task calls)

// Agent 1: Core orchestration
Task({
  description: "Implement TaskOrchestrator",
  prompt: "Implement agents/coordination/TaskOrchestrator.ts per spec...",
  subagent_type: "general-purpose"
})

// Agent 2: Worker management
Task({
  description: "Implement WorkerRegistry",
  prompt: "Implement agents/coordination/WorkerRegistry.ts per spec...",
  subagent_type: "general-purpose"
})

// Agent 3: File locking
Task({
  description: "Implement FileLockManager",
  prompt: "Implement agents/coordination/FileLockManager.ts per spec...",
  subagent_type: "general-purpose"
})
```

---

## 🚀 Quick Start Checklist

For every new task:

- [ ] **Create GitHub Issue first** (WORKFLOW_RULES.md mandate)
- [ ] **Break down into subtasks** (each subtask = one Task tool call)
- [ ] **Write detailed prompts** (use prompt template above)
- [ ] **Choose correct subagent_type** (usually `general-purpose`)
- [ ] **Launch Task tool** (via Claude Code)
- [ ] **Monitor execution** (check logs, status)
- [ ] **Validate results** (review returned JSON)
- [ ] **Log completion** (update .ai/logs/)
- [ ] **Update GitHub Projects** (move to Done)

---

**Document Status:** ✅ Complete
**Next Steps:** Use this guide for all future task executions
**Issue:** #6
