# Parallel Work Architecture

## 🎯 概要

Autonomous Operations における**複数のワーカー（人間 + AI エージェント）による並列作業システム**の完全なアーキテクチャ設計。

### 設計原則

1. **Claude Code Task Tool 必須**: すべてのタスクは Claude Code の Task tool を使用して実行
2. **衝突回避**: Git マージコンフリクトと作業の重複を防止
3. **透明性**: すべてのワーカーの活動状況をリアルタイムで可視化
4. **スケーラビリティ**: 3人以上のワーカーが同時作業可能
5. **監査可能性**: すべての並列作業活動を記録

---

## 🏗️ システムアーキテクチャ

### レイヤー構成

```
┌─────────────────────────────────────────────────────────┐
│              Worker Interface Layer                      │
│  (Human Developers + AI Agents)                         │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│         Task Orchestration Layer                         │
│  • Task Queue Management                                 │
│  • Worker Registration & Tracking                        │
│  • Claude Code Task Tool Wrapper                         │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│         Coordination Layer                               │
│  • Task Claim/Release Protocol                           │
│  • Conflict Detection & Prevention                       │
│  • Progress Monitoring                                   │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│         Git Workflow Layer                               │
│  • Worktree Management                                   │
│  • Branch Isolation                                      │
│  • Merge Coordination                                    │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│         Storage & State Layer                            │
│  • GitHub Projects V2 (Task Board)                       │
│  • GitHub Repository (Code)                              │
│  • Lock Files (.task-locks/)                             │
└─────────────────────────────────────────────────────────┘
```

---

## 📋 コンポーネント詳細

### 1. Task Orchestration Layer

#### 1.1 Task Queue Manager

**責務:**
- タスクキューの管理（FIFO、優先度付き）
- タスクのライフサイクル管理
- 依存関係の解決

**実装:**
```typescript
// agents/coordination/TaskOrchestrator.ts
class TaskOrchestrator {
  private queue: PriorityQueue<Task>;
  private activeWorkers: Map<WorkerId, WorkerState>;

  async enqueueTask(task: Task): Promise<void>;
  async assignTask(workerId: WorkerId): Promise<Task | null>;
  async getAvailableTasks(workerId: WorkerId): Promise<Task[]>;
}
```

**タスク構造:**
```typescript
interface Task {
  id: string;
  type: 'issue' | 'pr' | 'refactor' | 'test' | 'doc';
  priority: 1 | 2 | 3 | 4 | 5; // 1 = highest
  dependencies: string[]; // task IDs
  estimatedDuration: number; // minutes
  requiredSkills: string[];
  assignedTo?: WorkerId;
  status: 'pending' | 'claimed' | 'in_progress' | 'completed' | 'failed';
  metadata: {
    issueNumber?: number;
    branchName?: string;
    files: string[]; // Files this task will modify
  };
}
```

#### 1.2 Worker Registry

**責務:**
- ワーカーの登録・認証
- アクティブワーカーの追跡
- ワーカー能力の管理

**実装:**
```typescript
// agents/coordination/WorkerRegistry.ts
class WorkerRegistry {
  private workers: Map<WorkerId, Worker>;

  async registerWorker(worker: Worker): Promise<WorkerId>;
  async unregisterWorker(workerId: WorkerId): Promise<void>;
  async getActiveWorkers(): Promise<Worker[]>;
  async updateWorkerStatus(workerId: WorkerId, status: WorkerStatus): Promise<void>;
}
```

**ワーカー構造:**
```typescript
interface Worker {
  id: WorkerId;
  type: 'human' | 'ai_agent';
  name: string;
  skills: string[];
  maxConcurrentTasks: number;
  currentTasks: string[]; // task IDs
  status: 'idle' | 'working' | 'offline';
  lastActivity: Date;
  metadata: {
    githubUsername?: string;
    agentType?: 'coordinator' | 'codegen' | 'review';
  };
}
```

#### 1.3 Claude Code Task Tool Wrapper

**責務:**
- Claude Code Task tool の標準化されたラッパー
- タスク実行の監視とログ
- エラーハンドリングとリトライ

**実装:**
```typescript
// agents/coordination/TaskToolWrapper.ts
class TaskToolWrapper {
  /**
   * Execute a task using Claude Code Task tool
   * @mandatory All tasks MUST use this method
   */
  async executeTask(task: Task, prompt: string): Promise<TaskResult> {
    const taskId = await this.createClaudeTask(prompt);
    const result = await this.monitorTask(taskId);
    await this.logTaskExecution(task, result);
    return result;
  }

  private async createClaudeTask(prompt: string): Promise<string>;
  private async monitorTask(taskId: string): Promise<TaskResult>;
  private async logTaskExecution(task: Task, result: TaskResult): Promise<void>;
}
```

**使用例:**
```typescript
const wrapper = new TaskToolWrapper();
const task = await orchestrator.assignTask(workerId);

const result = await wrapper.executeTask(task, `
  Task: ${task.type}
  Description: Fix bug in authentication module
  Files to modify: ${task.metadata.files.join(', ')}

  Requirements:
  1. Fix the bug
  2. Add unit tests
  3. Update documentation
`);
```

---

### 2. Coordination Layer

#### 2.1 Task Claim Protocol

**フロー:**
```
1. Worker requests available tasks
   ↓
2. Orchestrator checks file conflicts
   ↓
3. If no conflicts: Create lock file
   ↓
4. Assign task to worker
   ↓
5. Worker claims task (sets status = 'claimed')
   ↓
6. Worker starts work (status = 'in_progress')
   ↓
7. Worker completes/fails (status = 'completed'/'failed')
   ↓
8. Release lock file
```

**Lock File 構造:**
```json
// .task-locks/task-123.lock
{
  "taskId": "task-123",
  "workerId": "worker-alice",
  "workerType": "human",
  "claimedAt": "2025-10-08T03:00:00Z",
  "lockedFiles": [
    "src/auth/login.ts",
    "tests/auth/login.test.ts"
  ],
  "branchName": "fix/issue-456-auth-bug",
  "expiresAt": "2025-10-08T04:00:00Z"
}
```

#### 2.2 Conflict Detection

**戦略:**

1. **ファイルレベルの衝突検出:**
   ```typescript
   function detectFileConflicts(task: Task, activeTasks: Task[]): boolean {
     const taskFiles = new Set(task.metadata.files);

     for (const activeTask of activeTasks) {
       const activeFiles = new Set(activeTask.metadata.files);
       const overlap = intersection(taskFiles, activeFiles);

       if (overlap.size > 0) {
         return true; // Conflict detected
       }
     }

     return false;
   }
   ```

2. **ディレクトリレベルの分離:**
   - タスクを異なるディレクトリに分離
   - 共有ファイル（`package.json`、`tsconfig.json`）は専用のロック

3. **時間ベースのロック:**
   - ロックファイルは60分で自動期限切れ
   - ワーカーは定期的にロックを更新（heartbeat）

#### 2.3 Progress Monitoring

**実装:**
```typescript
// agents/coordination/ProgressMonitor.ts
class ProgressMonitor {
  async getWorkerProgress(workerId: WorkerId): Promise<Progress>;
  async getAllProgress(): Promise<Map<WorkerId, Progress>>;
  async notifyProgressUpdate(workerId: WorkerId, progress: Progress): Promise<void>;
}

interface Progress {
  taskId: string;
  currentStep: string;
  stepsCompleted: number;
  totalSteps: number;
  percentComplete: number;
  estimatedTimeRemaining: number; // minutes
  lastUpdated: Date;
}
```

---

### 3. Git Workflow Layer

#### 3.1 Worktree Management

**戦略:**
各ワーカーは独自の Git worktree を使用して完全な分離を実現。

**自動化スクリプト:**
```bash
# scripts/claim-task.ts の内部処理
async function setupWorktree(task: Task): Promise<string> {
  const worktreePath = `.worktrees/${task.id}`;
  const branchName = `${task.type}/${task.metadata.issueNumber}-${task.id}`;

  // Create worktree
  await exec(`git worktree add ${worktreePath} -b ${branchName}`);

  // Set up worktree-specific config
  await exec(`cd ${worktreePath} && git config user.name "${worker.name}"`);

  return worktreePath;
}
```

**ディレクトリ構造:**
```
Autonomous-Operations/
├── .git/                    # Main Git directory
├── .worktrees/              # Worktree root
│   ├── task-001/            # Worker 1's worktree
│   │   └── [full repo]
│   ├── task-002/            # Worker 2's worktree
│   │   └── [full repo]
│   └── task-003/            # Worker 3's worktree
│       └── [full repo]
├── src/                     # Main working directory
└── [other files]
```

#### 3.2 Branch Naming Convention

**フォーマット:**
```
<type>/<issue-number>-<task-id>-<description>

例:
- fix/456-task-001-auth-bug
- feat/789-task-002-add-oauth
- refactor/101-task-003-cleanup-utils
```

**type の種類:**
- `fix` - バグ修正
- `feat` - 新機能
- `refactor` - リファクタリング
- `test` - テスト追加
- `docs` - ドキュメント
- `chore` - その他

#### 3.3 Merge Coordination

**マージ戦略:**
1. **順次マージ**: タスク完了順に main へマージ
2. **Rebase 優先**: マージ前に main を rebase
3. **Conflict Resolution**: 自動検出 → 人間介入
4. **Post-Merge Cleanup**: worktree 削除、lock 解除

**自動化フロー:**
```typescript
async function completeTask(task: Task): Promise<void> {
  // 1. Fetch latest main
  await exec('git fetch origin main');

  // 2. Rebase on main
  await exec('git rebase origin/main');

  // 3. Run tests
  await exec('npm test');

  // 4. Create PR
  const pr = await createPullRequest(task);

  // 5. Auto-merge if checks pass
  if (await allChecksPass(pr)) {
    await mergePR(pr);
  }

  // 6. Cleanup
  await cleanupWorktree(task);
  await releaseLock(task);
}
```

---

### 4. Storage & State Layer

#### 4.1 GitHub Projects V2 Integration

**タスクボード構成:**
```
GitHub Project: "Parallel Work Dashboard"

Views:
1. By Worker (グループ化: Assignee)
2. By Status (グループ化: Status)
3. By Priority (ソート: Priority)
4. Timeline (ガントチャート風)

Custom Fields:
- Worker Type (Single Select: Human, AI Agent)
- Estimated Duration (Number: minutes)
- Files Modified (Text: comma-separated)
- Lock Status (Single Select: Locked, Unlocked)
- Worktree Path (Text)
```

**自動同期:**
```typescript
// Sync task status to GitHub Projects V2
async function syncTaskToProjects(task: Task): Promise<void> {
  const projectItem = await projectsAPI.findItem(task.id);

  await projectsAPI.updateItem(projectItem.id, {
    status: task.status,
    assignee: task.assignedTo,
    customFields: {
      workerType: worker.type,
      estimatedDuration: task.estimatedDuration,
      filesModified: task.metadata.files.join(', '),
      lockStatus: hasLock(task) ? 'Locked' : 'Unlocked',
    },
  });
}
```

#### 4.2 Lock Files (.task-locks/)

**ディレクトリ構造:**
```
.task-locks/
├── task-001.lock          # Task-specific lock
├── task-002.lock
├── shared/
│   ├── package.json.lock  # Shared file locks
│   └── tsconfig.json.lock
└── cleanup.sh             # Expired lock cleanup script
```

**ロック管理:**
```typescript
class LockManager {
  async acquireLock(task: Task, worker: Worker): Promise<boolean>;
  async releaseLock(task: Task): Promise<void>;
  async renewLock(task: Task): Promise<void>; // Heartbeat
  async cleanupExpiredLocks(): Promise<void>; // Cron job
  async isLocked(files: string[]): Promise<boolean>;
}
```

---

## 🔄 ワークフロー例

### シナリオ: 3人のワーカーが並列作業

**ワーカー:**
- Alice (Human Developer)
- Bob (AI Agent - CodeGen)
- Charlie (AI Agent - Review)

**タスク:**
- Task 1: Fix auth bug (files: `src/auth/login.ts`)
- Task 2: Add OAuth (files: `src/auth/oauth.ts`)
- Task 3: Update docs (files: `docs/AUTH.md`)

**フロー:**

```
T=0:
Alice:   claim-task → Task 1 assigned → Setup worktree → Lock files
Bob:     claim-task → Task 2 assigned → Setup worktree → Lock files
Charlie: claim-task → Task 3 assigned → Setup worktree → Lock files

T=5min:
Alice:   [Working] fix/456-task-001 (Progress: 40%)
Bob:     [Working] feat/789-task-002 (Progress: 60%)
Charlie: [Working] docs/101-task-003 (Progress: 80%)

T=10min:
Alice:   [Working] fix/456-task-001 (Progress: 70%)
Bob:     [Completed] feat/789-task-002 → Create PR → Auto-merge
Charlie: [Completed] docs/101-task-003 → Create PR → Auto-merge

T=15min:
Alice:   [Completed] fix/456-task-001 → Rebase main → Create PR
Bob:     [Idle] Ready for next task
Charlie: [Idle] Ready for next task

T=20min:
Alice:   [PR Merged] → Cleanup worktree → Release lock
Bob:     claim-task → Task 4 assigned
Charlie: claim-task → Task 5 assigned
```

---

## 🛡️ 衝突回避メカニズム

### 1. ファイルレベルの排他制御

```typescript
const conflictDetector = new ConflictDetector();

// Before assigning task
const hasConflict = await conflictDetector.check(task, activeWorkers);

if (hasConflict) {
  // Queue task for later
  await taskQueue.defer(task);
} else {
  // Safe to assign
  await assignTask(task, worker);
}
```

### 2. 共有リソースの保護

**Critical Files (require exclusive lock):**
- `package.json`
- `package-lock.json`
- `tsconfig.json`
- `.github/workflows/*.yml`

**戦略:**
- 共有ファイルを変更するタスクは1つずつ実行
- 他のタスクは共有ファイルが解放されるまで待機

### 3. Pre-commit Hooks

```bash
# .git/hooks/pre-commit
#!/bin/bash

# Check if files are locked by another worker
for file in $(git diff --cached --name-only); do
  if [ -f ".task-locks/shared/$file.lock" ]; then
    echo "Error: $file is locked by another worker"
    exit 1
  fi
done
```

---

## 📊 監視とダッシュボード

### Worker Status Dashboard

**CLI コマンド:**
```bash
npm run worker:status
```

**出力例:**
```
🤖 Parallel Work Dashboard
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Active Workers: 3

┌────────────┬─────────────┬──────────────┬─────────────┬──────────┐
│ Worker     │ Type        │ Task         │ Progress    │ ETA      │
├────────────┼─────────────┼──────────────┼─────────────┼──────────┤
│ Alice      │ Human       │ fix/456      │ ████░░ 70%  │ 5 min    │
│ Bob        │ AI (CodeGen)│ feat/789     │ ██████ 100% │ Done     │
│ Charlie    │ AI (Review) │ docs/101     │ ██████ 100% │ Done     │
└────────────┴─────────────┴──────────────┴─────────────┴──────────┘

Task Queue: 2 pending

⚠️  Warnings: None
✓  All workers operational
```

### Real-time Updates

**GitHub Actions Workflow:**
```yaml
# .github/workflows/parallel-work-monitor.yml
name: Parallel Work Monitor

on:
  schedule:
    - cron: '*/5 * * * *' # Every 5 minutes

jobs:
  monitor:
    runs-on: ubuntu-latest
    steps:
      - name: Check Worker Health
        run: npm run worker:health-check

      - name: Cleanup Expired Locks
        run: npm run lock:cleanup

      - name: Update Dashboard
        run: npm run dashboard:update
```

---

## 🚀 実装計画

### Phase 1: Core Infrastructure (Week 1)
- [ ] TaskOrchestrator 実装
- [ ] WorkerRegistry 実装
- [ ] LockManager 実装
- [ ] 基本的な CLI コマンド

### Phase 2: Git Workflow (Week 2)
- [ ] Worktree 自動化
- [ ] Branch 管理
- [ ] Merge coordination

### Phase 3: Claude Code Integration (Week 3)
- [ ] TaskToolWrapper 実装
- [ ] エラーハンドリング
- [ ] ログとトレーシング

### Phase 4: Monitoring & Dashboard (Week 4)
- [ ] Worker status dashboard
- [ ] GitHub Projects V2 sync
- [ ] Real-time notifications

---

## 📚 関連ドキュメント

- [Claude Code Task Tool Guide](./CLAUDE_CODE_TASK_TOOL.md)
- [Worker Coordination Protocol](./WORKER_COORDINATION_PROTOCOL.md)
- [Git Workflow Rules](../WORKFLOW_RULES.md)
- [Architecture Diagrams](./diagrams/)

---

## 🔗 参考リンク

- [Claude Code Documentation](https://docs.claude.com/claude-code)
- [GitHub Projects V2 API](https://docs.github.com/en/issues/planning-and-tracking-with-projects/automating-your-project/using-the-api-to-manage-projects)
- [Git Worktree](https://git-scm.com/docs/git-worktree)
- [Distributed Locking Patterns](https://martin.kleppmann.com/2016/02/08/how-to-do-distributed-locking.html)
