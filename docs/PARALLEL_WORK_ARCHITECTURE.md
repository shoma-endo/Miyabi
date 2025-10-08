# Parallel Work Architecture

**Version:** 1.0.0
**Status:** Design Document
**Issue:** #6
**Created:** 2025-10-08

---

## 🎯 Executive Summary

This document defines the architecture for **parallel work** in the Autonomous-Operations project, enabling **multiple human workers** and **multiple AI agents** to coexist and work simultaneously without conflicts.

**Core Principle:**
> "必ず必ず必ず必ず、クロードコードのタスクツールを使ってタスクとして実行していきます。"
> **All work MUST use Claude Code's Task tool for execution.**

---

## 📋 Requirements

### Functional Requirements
1. **Multi-Worker Support**: 3+ workers (human + AI) working simultaneously
2. **Conflict Avoidance**: Zero Git merge conflicts from parallel work
3. **Task Tool Integration**: All tasks executed via Claude Code Task tool
4. **Real-time Visibility**: Dashboard showing who is working on what
5. **Traceability**: Complete audit trail of all activities
6. **Coordination**: Clear task allocation and handoff protocols

### Non-Functional Requirements
- **Performance**: Task assignment latency < 5 seconds
- **Reliability**: 99.9% uptime for coordination system
- **Scalability**: Support up to 10 concurrent workers
- **Security**: Guardian-level approval for critical tasks

---

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    GitHub Issues (Task Source)               │
│              Issue #4, #5, #6... → Task Queue                │
└──────────────────────────────┬──────────────────────────────┘
                               │
                               ↓
┌─────────────────────────────────────────────────────────────┐
│              Task Orchestrator (Central Coordinator)         │
│  • Task Queue Management                                     │
│  • Worker Registry                                           │
│  • Conflict Detection                                        │
│  • Claude Code Task Tool Wrapper                            │
└───────┬──────────────────────────────────────────┬──────────┘
        │                                          │
        ↓                                          ↓
┌──────────────────┐                    ┌──────────────────┐
│  Human Workers   │                    │   AI Agents      │
│  (Claude Code    │                    │  (Claude Code    │
│   Task Tool)     │                    │   Task Tool)     │
└────────┬─────────┘                    └────────┬─────────┘
         │                                       │
         └───────────────┬───────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────────┐
│              Git Worktree Strategy (Isolation)               │
│  • Branch per Worker:  worker/human-1/issue-4               │
│                        worker/agent-codegen/issue-5          │
│  • Dedicated Worktrees: /worktrees/worker-name/             │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           ↓
┌─────────────────────────────────────────────────────────────┐
│                 GitHub Projects V2 (Visibility)              │
│  • Kanban Board: Backlog → Claimed → In Progress → Done    │
│  • Worker Assignment Fields                                  │
│  • Real-time Status Updates                                  │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔧 Core Components

### 1. Task Orchestrator

**Location:** `agents/coordination/TaskOrchestrator.ts`

**Responsibilities:**
- Maintain task queue from GitHub Issues
- Track worker availability and capacity
- Assign tasks to workers (human or agent)
- Detect and prevent work conflicts
- Wrap all task execution with Claude Code Task tool

**Key Methods:**
```typescript
class TaskOrchestrator {
  // Task Queue Management
  async loadTasksFromIssues(): Promise<Task[]>
  async claimTask(workerId: string, taskId: string): Promise<ClaimResult>
  async releaseTask(taskId: string): Promise<void>

  // Worker Coordination
  async registerWorker(worker: Worker): Promise<void>
  async getAvailableWorkers(): Promise<Worker[]>
  async assignTaskToWorker(task: Task, worker: Worker): Promise<void>

  // Claude Code Task Tool Integration
  async executeTaskWithTaskTool(task: Task, worker: Worker): Promise<TaskResult>
  async monitorTaskProgress(taskId: string): Promise<TaskStatus>

  // Conflict Detection
  async checkFileConflicts(task: Task): Promise<ConflictReport>
  async reserveFiles(taskId: string, filePaths: string[]): Promise<void>
}
```

**Task Model:**
```typescript
interface Task {
  id: string;                    // "issue-4", "issue-5", etc.
  issueNumber: number;           // 4, 5, 6
  title: string;
  description: string;
  estimatedDuration: number;     // minutes
  priority: 'critical' | 'high' | 'medium' | 'low';
  requiredSkills: string[];      // ['typescript', 'cli-design', 'github-actions']
  status: 'backlog' | 'claimed' | 'in_progress' | 'review' | 'done';
  assignedWorker?: string;       // worker-id
  claimedAt?: Date;
  startedAt?: Date;
  completedAt?: Date;
  affectedFiles: string[];       // Files this task will modify
  dependencies: string[];        // Other task IDs this depends on
}
```

---

### 2. Worker Registry

**Location:** `agents/coordination/WorkerRegistry.ts`

**Responsibilities:**
- Register and track all workers (human + agents)
- Monitor worker availability and current tasks
- Track worker capabilities and expertise
- Maintain worker heartbeats

**Worker Model:**
```typescript
interface Worker {
  id: string;                    // "human-shunsuke", "agent-codegen-1"
  type: 'human' | 'agent';
  name: string;
  status: 'available' | 'busy' | 'offline';
  capabilities: string[];        // ['typescript', 'documentation', 'testing']
  currentTask?: string;          // task-id
  taskHistory: TaskHistory[];
  registeredAt: Date;
  lastHeartbeat: Date;
}

interface TaskHistory {
  taskId: string;
  startedAt: Date;
  completedAt: Date;
  result: 'success' | 'failed' | 'abandoned';
}
```

**Key Methods:**
```typescript
class WorkerRegistry {
  async registerWorker(worker: Worker): Promise<void>
  async updateWorkerStatus(workerId: string, status: WorkerStatus): Promise<void>
  async getAvailableWorkers(requiredCapabilities?: string[]): Promise<Worker[]>
  async assignTask(workerId: string, taskId: string): Promise<void>
  async heartbeat(workerId: string): Promise<void>
  async getAllWorkers(): Promise<Worker[]>
}
```

---

### 3. Claude Code Task Tool Wrapper

**Location:** `agents/coordination/TaskToolWrapper.ts`

**Purpose:** Standardize all task execution through Claude Code's Task tool

**Core Principle:**
Every single task execution must go through this wrapper. No direct implementation without Task tool usage.

**Key Methods:**
```typescript
class TaskToolWrapper {
  /**
   * Execute a task using Claude Code's Task tool
   * This is the ONLY way to execute tasks in this system
   */
  async executeTask(
    task: Task,
    worker: Worker,
    subagentType: 'general-purpose' | 'statusline-setup' | 'output-style-setup'
  ): Promise<TaskResult> {
    // 1. Validate task and worker
    // 2. Reserve affected files
    // 3. Create worktree/branch
    // 4. Call Claude Code Task tool
    // 5. Monitor progress
    // 6. Collect results
    // 7. Release resources
    // 8. Update GitHub Projects V2
    // 9. Log to .ai/logs/
  }

  /**
   * Monitor running task via AgentOutputTool
   */
  async monitorTask(taskId: string): Promise<TaskStatus>

  /**
   * Cancel a running task
   */
  async cancelTask(taskId: string): Promise<void>
}
```

**Task Execution Flow:**
```typescript
// Example: Execute Issue #4 Phase 2
const task: Task = {
  id: 'issue-4-phase-2',
  issueNumber: 4,
  title: 'Implement CLI formatters (table, box, progress, tree)',
  estimatedDuration: 45,
  priority: 'high',
  affectedFiles: [
    'agents/ui/table.ts',
    'agents/ui/box.ts',
    'agents/ui/progress.ts',
    'agents/ui/tree.ts',
  ],
};

const worker: Worker = {
  id: 'agent-codegen-1',
  type: 'agent',
  name: 'CodeGenAgent-1',
  status: 'available',
  capabilities: ['typescript', 'cli-design'],
};

// Execute via Task tool (MANDATORY)
const result = await taskToolWrapper.executeTask(
  task,
  worker,
  'general-purpose'
);
```

---

### 4. Git Worktree Strategy

**Purpose:** Isolate each worker's changes to prevent conflicts

**Branch Naming Convention:**
```
worker/{worker-type}-{worker-name}/issue-{issue-number}

Examples:
- worker/human-shunsuke/issue-4
- worker/agent-codegen-1/issue-5
- worker/agent-review-1/issue-6
```

**Worktree Directory Structure:**
```
/Users/shunsuke/Dev/Autonomous-Operations/     # Main repo
/Users/shunsuke/Dev/Autonomous-Operations/.worktrees/
  ├── human-shunsuke/                           # Human worker worktree
  │   ├── issue-4/                              # Issue #4 work
  │   └── issue-7/                              # Issue #7 work
  ├── agent-codegen-1/                          # Agent worktree
  │   └── issue-5/                              # Issue #5 work
  └── agent-review-1/
      └── issue-6/
```

**Worktree Management:**
```bash
# Create worktree for new task
git worktree add .worktrees/agent-codegen-1/issue-5 \
  -b worker/agent-codegen-1/issue-5

# Work in isolation
cd .worktrees/agent-codegen-1/issue-5
# Make changes, commit

# When done, push to remote
git push -u origin worker/agent-codegen-1/issue-5

# Clean up after merge
git worktree remove .worktrees/agent-codegen-1/issue-5
```

**Conflict Prevention:**
- Each worker has dedicated worktree directory
- No shared file modifications (enforced by TaskOrchestrator)
- Lock mechanism for critical shared files (package.json, configs)

---

### 5. File Lock Mechanism

**Location:** `.task-locks/` directory (Git-tracked)

**Purpose:** Prevent concurrent modification of shared/critical files

**Lock File Format:**
```json
// .task-locks/package.json.lock
{
  "file": "package.json",
  "lockedBy": "agent-codegen-1",
  "taskId": "issue-5-phase-a",
  "lockedAt": "2025-10-08T10:30:00Z",
  "expiresAt": "2025-10-08T12:30:00Z"
}
```

**Critical Files That Require Locks:**
- `package.json` (dependency changes)
- `tsconfig.json` (compiler config)
- `.github/workflows/*.yml` (workflow definitions)
- `AGENTS.md` (constitutional changes)
- `BUDGET.yml` (economic governance)

**Lock API:**
```typescript
class FileLockManager {
  async acquireLock(filePath: string, workerId: string, taskId: string): Promise<boolean>
  async releaseLock(filePath: string): Promise<void>
  async isLocked(filePath: string): Promise<boolean>
  async getLockInfo(filePath: string): Promise<LockInfo | null>
  async cleanExpiredLocks(): Promise<void>
}
```

---

## 📊 GitHub Projects V2 Integration

**Project URL:** https://github.com/users/ShunsukeHayashi/projects/1

**Board Columns:**
1. **Backlog**: Unclaimed Issues
2. **Claimed**: Worker has claimed but not started
3. **In Progress**: Active work
4. **Review**: PR created, awaiting review
5. **Done**: Merged to main

**Custom Fields:**
- **Assigned Worker** (Text): `human-shunsuke`, `agent-codegen-1`
- **Worker Type** (Single Select): `Human`, `Agent`
- **Task Duration** (Number): Estimated minutes
- **Files Modified** (Number): Count of affected files
- **Branch** (Text): `worker/agent-codegen-1/issue-5`

**Auto-Update Workflow:**
`.github/workflows/project-sync-parallel.yml`

```yaml
name: Project Sync - Parallel Work

on:
  issues:
    types: [opened, labeled, assigned, closed]
  pull_request:
    types: [opened, ready_for_review, closed]

jobs:
  sync-to-project:
    runs-on: ubuntu-latest
    steps:
      - name: Add to Project
        uses: actions/add-to-project@v0.5.0
        with:
          project-url: https://github.com/users/ShunsukeHayashi/projects/1
          github-token: ${{ secrets.GITHUB_TOKEN }}

      - name: Update Custom Fields
        run: |
          # Extract worker info from labels/branch name
          # Update "Assigned Worker" field
          # Update "Worker Type" field
```

---

## 🚀 Workflow: Worker Claims and Executes Task

### Step-by-Step Process

#### 1. Worker Registration
```bash
# Human registers
npx tsx scripts/register-worker.ts --type human --name shunsuke

# Agent registers (auto on startup)
npx tsx scripts/register-worker.ts --type agent --name codegen-1
```

#### 2. Task Discovery
```bash
# List available tasks
npx tsx scripts/list-tasks.ts

# Output:
# 📋 Available Tasks (3)
#
# 🔴 #4 [CRITICAL] Rich CLI Output - Phase 2
#    Estimated: 45 min | Files: 4 | Skills: typescript, cli-design
#    Status: backlog
#
# 🟡 #5 [HIGH] GitHub OS Integration - Phase A
#    Estimated: 180 min | Files: 8 | Skills: github-actions, graphql
#    Status: backlog
```

#### 3. Claim Task
```bash
# Worker claims task
npx tsx scripts/claim-task.ts --worker agent-codegen-1 --task issue-4-phase-2

# System checks:
# ✅ Worker is available
# ✅ No file conflicts
# ✅ Dependencies satisfied
# ✅ Worker has required skills
#
# 🎉 Task claimed!
# Branch: worker/agent-codegen-1/issue-4-phase-2
# Worktree: .worktrees/agent-codegen-1/issue-4-phase-2
```

#### 4. Execute Task (Via Claude Code Task Tool)
```typescript
// agents/coordination/executeTask.ts

import { TaskToolWrapper } from './TaskToolWrapper.js';
import { TaskOrchestrator } from './TaskOrchestrator.js';

async function main() {
  const orchestrator = new TaskOrchestrator();
  const taskTool = new TaskToolWrapper();

  // Load task
  const task = await orchestrator.getTask('issue-4-phase-2');
  const worker = await orchestrator.getWorker('agent-codegen-1');

  // Execute via Task tool (MANDATORY)
  console.log('🚀 Starting task execution via Claude Code Task tool...');

  const result = await taskTool.executeTask(
    task,
    worker,
    'general-purpose'  // subagent_type
  );

  if (result.success) {
    console.log('✅ Task completed successfully');
    await orchestrator.completeTask(task.id, result);
  } else {
    console.log('❌ Task failed');
    await orchestrator.failTask(task.id, result.error);
  }
}
```

#### 5. Monitoring
```bash
# Real-time task monitoring
npx tsx scripts/monitor-tasks.ts

# Output:
# 📊 Active Tasks (2)
#
# 🤖 agent-codegen-1 → Issue #4 Phase 2
#    Status: In Progress (12 min elapsed / 45 min est)
#    Progress: 27%
#    Branch: worker/agent-codegen-1/issue-4-phase-2
#
# 👤 human-shunsuke → Issue #5 Phase A
#    Status: In Progress (45 min elapsed / 180 min est)
#    Progress: 25%
#    Branch: worker/human-shunsuke/issue-5-phase-a
```

#### 6. Completion & Cleanup
```bash
# Task completes, PR created automatically
# Worktree cleaned up after merge
git worktree remove .worktrees/agent-codegen-1/issue-4-phase-2

# Task moves to "Done" in GitHub Projects V2
```

---

## 🔒 Conflict Detection & Prevention

### Detection Strategies

#### 1. File-Level Conflict Detection
```typescript
async function detectFileConflicts(task: Task): Promise<string[]> {
  const conflicts: string[] = [];

  for (const file of task.affectedFiles) {
    // Check if file is locked by another worker
    const lock = await fileLockManager.getLockInfo(file);
    if (lock && lock.taskId !== task.id) {
      conflicts.push(`${file} locked by ${lock.lockedBy}`);
    }

    // Check if file is being modified in another active task
    const activeTasks = await orchestrator.getActiveTasks();
    for (const activeTask of activeTasks) {
      if (activeTask.id !== task.id && activeTask.affectedFiles.includes(file)) {
        conflicts.push(`${file} being modified by ${activeTask.id}`);
      }
    }
  }

  return conflicts;
}
```

#### 2. Dependency-Based Sequencing
```typescript
// Task dependencies prevent parallel work on dependent tasks
const task4Phase2: Task = {
  id: 'issue-4-phase-2',
  dependencies: ['issue-4-phase-1'],  // Must complete Phase 1 first
  // ...
};

// System prevents claiming Phase 2 until Phase 1 is done
```

#### 3. Critical Path Analysis
```typescript
// System identifies critical shared files and serializes work
const criticalFiles = [
  'package.json',
  'tsconfig.json',
  'AGENTS.md',
];

// Only one task can modify critical files at a time
```

---

## 📝 Logging & Audit Trail

### Log Directory Structure
```
.ai/logs/parallel-work/
  ├── 2025-10-08.md                 # Daily summary
  ├── tasks/
  │   ├── issue-4-phase-2.md        # Per-task log
  │   ├── issue-5-phase-a.md
  │   └── issue-6-research.md
  └── workers/
      ├── human-shunsuke.md         # Per-worker log
      ├── agent-codegen-1.md
      └── agent-review-1.md
```

### Daily Summary Format
```markdown
# Parallel Work Summary — 2025-10-08

## Active Workers (3)
- 👤 human-shunsuke: Issue #5 Phase A (180 min, 45% complete)
- 🤖 agent-codegen-1: Issue #4 Phase 2 (45 min, 80% complete)
- 🤖 agent-review-1: Issue #6 Research (30 min, 20% complete)

## Completed Today (2)
- ✅ Issue #4 Phase 1 (agent-codegen-1) — 60 min
- ✅ Issue #3 Merge (human-shunsuke) — 15 min

## Conflicts Detected (0)

## File Locks (2)
- package.json → agent-codegen-1 (issue-5-phase-a) expires 12:30
- .github/workflows/project-sync.yml → human-shunsuke (issue-5-phase-a) expires 14:00

## System Health
- Task Queue: 3 pending
- Worker Registry: 3 active, 0 offline
- Average Task Duration: 47 min
- Conflict Rate: 0%
```

---

## 🎯 Success Metrics

### Key Performance Indicators (KPIs)

| Metric | Target | Measurement |
|--------|--------|-------------|
| Concurrent Workers | 3+ | Real-time from WorkerRegistry |
| Merge Conflict Rate | 0% | Git log analysis |
| Task Assignment Latency | < 5 sec | Orchestrator metrics |
| Worker Utilization | > 70% | Active time / Total time |
| Task Completion Rate | > 95% | Completed / Total claimed |
| Average Task Duration | Within 20% of estimate | Actual vs estimated |

### Health Checks
```bash
# Daily health report
npx tsx scripts/parallel-work-health.ts

# Output:
# ✅ Worker Registry: 3 active, 0 stale
# ✅ Task Queue: 5 backlog, 3 in progress, 2 review
# ✅ File Locks: 2 active, 0 expired
# ✅ Conflict Rate: 0% (0 conflicts / 15 tasks)
# ⚠️  Worker Utilization: 65% (below 70% target)
```

---

## 🚧 Implementation Phases

### Phase 1: Foundation (4-6 hours)
- [ ] Implement TaskOrchestrator.ts
- [ ] Implement WorkerRegistry.ts
- [ ] Implement FileLockManager.ts
- [ ] Create `.task-locks/` directory structure
- [ ] Update `.gitignore` for worktrees

### Phase 2: Task Tool Integration (3-4 hours)
- [ ] Implement TaskToolWrapper.ts
- [ ] Create task execution templates
- [ ] Add Task tool monitoring
- [ ] Add error handling and retries

### Phase 3: Git Worktree Automation (2-3 hours)
- [ ] Implement worktree creation scripts
- [ ] Implement branch naming automation
- [ ] Add cleanup scripts
- [ ] Test isolation

### Phase 4: CLI Tools (2-3 hours)
- [ ] `scripts/register-worker.ts`
- [ ] `scripts/list-tasks.ts`
- [ ] `scripts/claim-task.ts`
- [ ] `scripts/monitor-tasks.ts`
- [ ] `scripts/parallel-work-health.ts`

### Phase 5: GitHub Integration (3-4 hours)
- [ ] Update `.github/workflows/project-sync-parallel.yml`
- [ ] Configure GitHub Projects V2 custom fields
- [ ] Add worker assignment automation
- [ ] Test real-time updates

### Phase 6: Testing & Documentation (2-3 hours)
- [ ] End-to-end test with 3 workers
- [ ] Conflict scenario testing
- [ ] Performance benchmarking
- [ ] Update WORKFLOW_RULES.md
- [ ] Create video demo

**Total Estimated Time:** 16-23 hours

---

## 📖 References

### Internal Documents
- `.github/WORKFLOW_RULES.md` — Issue-Driven Development mandate
- `AGENTS.md` — Agent governance and roles
- `GITHUB_OS_INTEGRATION_PLAN.md` — GitHub as OS vision

### External Resources
- [Git Worktree Documentation](https://git-scm.com/docs/git-worktree)
- [GitHub Projects V2 API](https://docs.github.com/en/graphql/reference/objects#projectv2)
- [Claude Code Task Tool](https://docs.claude.com/en/docs/claude-code/)

---

## 🔮 Future Enhancements

### Phase 2 Features (Post-MVP)
- **Agent Auto-Scaling**: Automatically spawn more agents based on task queue depth
- **Smart Task Assignment**: ML-based task-to-worker matching based on historical performance
- **Conflict Prediction**: AI predicts potential conflicts before task assignment
- **Cross-Repo Coordination**: Extend to multiple repositories
- **Slack/Discord Integration**: Real-time notifications and chat commands
- **Performance Analytics**: Detailed worker efficiency reports
- **Cost Tracking**: Track Claude API costs per worker/task

---

**Document Status:** ✅ Complete
**Next Steps:** Guardian review and approval before implementation
**Issue:** #6
