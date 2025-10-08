# Claude Code Task Tool Integration Guide

## 🎯 概要

**すべてのタスク実行は Claude Code の Task tool を使用する必要があります。**

このガイドでは、Claude Code Task tool の統合方法、ベストプラクティス、使用パターンを説明します。

### なぜ Task Tool が必須なのか？

1. **並列実行の管理**: 複数のタスクを安全に並列実行
2. **進捗の可視化**: タスクの状態をリアルタイムで追跡
3. **エラーハンドリング**: 失敗したタスクの自動リトライと回復
4. **監査ログ**: すべてのタスク実行の完全な記録
5. **リソース管理**: メモリとCPUの効率的な利用

---

## 📚 Claude Code Task Tool とは

Claude Code の Task tool は、**自律的なサブタスクを実行するための専用インターフェース**です。

### 特徴

- **非同期実行**: 長時間タスクをバックグラウンドで実行
- **状態管理**: pending → running → completed/failed
- **結果の取得**: タスク完了後に結果を取得
- **タイムアウト**: 長時間実行タスクの自動タイムアウト
- **ログ出力**: 詳細な実行ログ

---

## 🔧 基本的な使用方法

### 1. タスクの作成と実行

#### シンプルな例
```typescript
// Task tool を使用してタスクを実行
const task = await claude.tasks.create({
  prompt: `
    Task: Fix authentication bug in src/auth/login.ts

    Steps:
    1. Read the file src/auth/login.ts
    2. Identify the bug causing login failure
    3. Fix the bug
    4. Add unit tests
    5. Run tests to verify
  `,
  type: 'code-fix',
  timeout: 300000, // 5 minutes
});

// タスクの監視
const result = await claude.tasks.wait(task.id);

if (result.status === 'completed') {
  console.log('Task completed successfully');
  console.log(result.output);
} else {
  console.error('Task failed:', result.error);
}
```

### 2. 並列タスクの実行

```typescript
// 複数のタスクを並列実行
const tasks = [
  { prompt: 'Fix bug in auth module', files: ['src/auth/login.ts'] },
  { prompt: 'Add OAuth support', files: ['src/auth/oauth.ts'] },
  { prompt: 'Update documentation', files: ['docs/AUTH.md'] },
];

// すべてのタスクを並列で開始
const taskIds = await Promise.all(
  tasks.map(task => claude.tasks.create({
    prompt: task.prompt,
    type: 'parallel-work',
  }))
);

// すべてのタスクの完了を待つ
const results = await Promise.all(
  taskIds.map(id => claude.tasks.wait(id))
);

console.log(`Completed: ${results.filter(r => r.status === 'completed').length}/${results.length}`);
```

---

## 🏗️ TaskToolWrapper の実装

### 標準化されたラッパークラス

```typescript
// agents/coordination/TaskToolWrapper.ts
import { logger } from '../ui/index.js';

export interface TaskConfig {
  id: string;
  type: 'fix' | 'feat' | 'refactor' | 'test' | 'docs';
  prompt: string;
  timeout?: number;
  retries?: number;
  files?: string[];
  metadata?: Record<string, any>;
}

export interface TaskResult {
  taskId: string;
  status: 'completed' | 'failed' | 'timeout';
  output?: string;
  error?: Error;
  duration: number;
  timestamp: Date;
}

export class TaskToolWrapper {
  private activeTasks: Map<string, any> = new Map();

  /**
   * Execute a task using Claude Code Task tool
   * @mandatory All tasks MUST use this method
   */
  async executeTask(config: TaskConfig): Promise<TaskResult> {
    const startTime = Date.now();

    logger.info(`Starting task: ${config.id} (${config.type})`);
    logger.muted(`Prompt: ${config.prompt.substring(0, 100)}...`);

    try {
      // Create Claude Code task
      const task = await this.createClaudeTask(config);
      this.activeTasks.set(config.id, task);

      // Monitor task execution
      const result = await this.monitorTask(task, config);

      // Log execution
      await this.logTaskExecution(config, result);

      const duration = Date.now() - startTime;
      logger.success(`Task completed: ${config.id} (${duration}ms)`);

      return {
        taskId: config.id,
        status: 'completed',
        output: result,
        duration,
        timestamp: new Date(),
      };
    } catch (error) {
      const duration = Date.now() - startTime;
      logger.error(`Task failed: ${config.id}`, error as Error);

      // Retry logic
      if (config.retries && config.retries > 0) {
        logger.warning(`Retrying task: ${config.id} (${config.retries} retries left)`);
        return await this.executeTask({
          ...config,
          retries: config.retries - 1,
        });
      }

      return {
        taskId: config.id,
        status: 'failed',
        error: error as Error,
        duration,
        timestamp: new Date(),
      };
    } finally {
      this.activeTasks.delete(config.id);
    }
  }

  /**
   * Create Claude Code task with proper configuration
   */
  private async createClaudeTask(config: TaskConfig): Promise<any> {
    // Note: This is a placeholder for the actual Claude Code Task API
    // The real implementation will use Claude Code's Task tool

    const taskPrompt = this.buildTaskPrompt(config);

    // Simulate Claude Code Task creation
    // In real implementation, this would call:
    // await claude.tasks.create({ prompt: taskPrompt, ... });

    return {
      id: config.id,
      prompt: taskPrompt,
      timeout: config.timeout || 300000,
      status: 'pending',
    };
  }

  /**
   * Build comprehensive task prompt
   */
  private buildTaskPrompt(config: TaskConfig): string {
    return `
Task ID: ${config.id}
Type: ${config.type}
${config.files ? `Files to modify: ${config.files.join(', ')}` : ''}

Task Description:
${config.prompt}

Requirements:
1. Follow the project's coding standards
2. Add appropriate tests
3. Update documentation if needed
4. Ensure all tests pass
5. Commit with descriptive message

${config.metadata ? `\nMetadata:\n${JSON.stringify(config.metadata, null, 2)}` : ''}
    `.trim();
  }

  /**
   * Monitor task execution with progress updates
   */
  private async monitorTask(task: any, config: TaskConfig): Promise<string> {
    const timeout = config.timeout || 300000;
    const startTime = Date.now();

    return new Promise((resolve, reject) => {
      const checkInterval = setInterval(async () => {
        // Check timeout
        if (Date.now() - startTime > timeout) {
          clearInterval(checkInterval);
          reject(new Error(`Task timeout after ${timeout}ms`));
          return;
        }

        // In real implementation, check task status via Claude Code API
        // const status = await claude.tasks.get(task.id);

        // Simulate task completion (placeholder)
        if (Math.random() > 0.7) { // Simulate completion
          clearInterval(checkInterval);
          resolve('Task completed successfully');
        }
      }, 1000);
    });
  }

  /**
   * Log task execution to GitHub Projects V2
   */
  private async logTaskExecution(config: TaskConfig, result: any): Promise<void> {
    const logEntry = {
      taskId: config.id,
      type: config.type,
      timestamp: new Date().toISOString(),
      duration: Date.now(),
      status: 'completed',
      files: config.files || [],
    };

    // Log to file system
    logger.muted(`Task log: ${JSON.stringify(logEntry)}`);

    // TODO: Log to GitHub Projects V2
    // await projectsAPI.addComment(issueNumber, `Task ${config.id} completed`);
  }

  /**
   * Get all active tasks
   */
  getActiveTasks(): Map<string, any> {
    return this.activeTasks;
  }

  /**
   * Cancel a running task
   */
  async cancelTask(taskId: string): Promise<void> {
    const task = this.activeTasks.get(taskId);
    if (task) {
      // In real implementation: await claude.tasks.cancel(task.id);
      this.activeTasks.delete(taskId);
      logger.warning(`Task cancelled: ${taskId}`);
    }
  }
}

// Singleton instance
export const taskToolWrapper = new TaskToolWrapper();
```

---

## 📋 使用パターン

### パターン 1: 単一タスクの実行

```typescript
import { taskToolWrapper } from './agents/coordination/TaskToolWrapper.js';

async function fixBug(issueNumber: number) {
  const result = await taskToolWrapper.executeTask({
    id: `fix-bug-${issueNumber}`,
    type: 'fix',
    prompt: `Fix the bug described in Issue #${issueNumber}`,
    timeout: 600000, // 10 minutes
    retries: 2,
    files: ['src/auth/login.ts'],
  });

  if (result.status === 'completed') {
    console.log('Bug fixed successfully!');
  } else {
    console.error('Failed to fix bug:', result.error);
  }
}
```

### パターン 2: 依存関係のあるタスク

```typescript
async function addFeatureWithTests(featureName: string) {
  // Task 1: Generate feature code
  const codeResult = await taskToolWrapper.executeTask({
    id: `feat-${featureName}-code`,
    type: 'feat',
    prompt: `Implement ${featureName} feature`,
    files: [`src/features/${featureName}.ts`],
  });

  if (codeResult.status !== 'completed') {
    throw new Error('Feature implementation failed');
  }

  // Task 2: Generate tests (depends on Task 1)
  const testResult = await taskToolWrapper.executeTask({
    id: `feat-${featureName}-test`,
    type: 'test',
    prompt: `Write comprehensive tests for ${featureName} feature`,
    files: [`tests/features/${featureName}.test.ts`],
    metadata: {
      dependsOn: codeResult.taskId,
    },
  });

  return { codeResult, testResult };
}
```

### パターン 3: 並列タスクの実行

```typescript
async function refactorModule(moduleName: string) {
  const tasks = [
    {
      id: `refactor-${moduleName}-types`,
      type: 'refactor' as const,
      prompt: `Refactor types for ${moduleName}`,
      files: [`src/${moduleName}/types.ts`],
    },
    {
      id: `refactor-${moduleName}-utils`,
      type: 'refactor' as const,
      prompt: `Refactor utilities for ${moduleName}`,
      files: [`src/${moduleName}/utils.ts`],
    },
    {
      id: `refactor-${moduleName}-tests`,
      type: 'test' as const,
      prompt: `Update tests for ${moduleName}`,
      files: [`tests/${moduleName}/*.test.ts`],
    },
  ];

  // Execute all tasks in parallel
  const results = await Promise.all(
    tasks.map(task => taskToolWrapper.executeTask(task))
  );

  const allSuccess = results.every(r => r.status === 'completed');
  return { success: allSuccess, results };
}
```

---

## 🎯 ベストプラクティス

### 1. 明確なタスクプロンプト

**良い例:**
```typescript
prompt: `
  Fix authentication bug in src/auth/login.ts

  Problem: Users cannot login with correct credentials
  Root cause: Password hashing comparison is case-sensitive

  Steps:
  1. Read src/auth/login.ts
  2. Fix password comparison logic (line 42)
  3. Add test case for case-insensitive password
  4. Verify all auth tests pass
`
```

**悪い例:**
```typescript
prompt: 'Fix login bug' // Too vague
```

### 2. 適切なタイムアウト設定

```typescript
const timeouts = {
  fix: 300000,      // 5 min - Bug fixes
  feat: 600000,     // 10 min - New features
  refactor: 900000, // 15 min - Refactoring
  test: 180000,     // 3 min - Test writing
  docs: 120000,     // 2 min - Documentation
};

await taskToolWrapper.executeTask({
  id: 'task-001',
  type: 'feat',
  prompt: '...',
  timeout: timeouts.feat,
});
```

### 3. エラーハンドリングとリトライ

```typescript
async function robustTaskExecution(config: TaskConfig) {
  try {
    const result = await taskToolWrapper.executeTask({
      ...config,
      retries: 3, // Retry up to 3 times
    });

    if (result.status === 'failed') {
      // Notify guardian
      await notifyGuardian({
        taskId: config.id,
        error: result.error,
        action: 'manual_intervention_required',
      });
    }

    return result;
  } catch (error) {
    logger.error('Critical task failure', error as Error);
    throw error;
  }
}
```

### 4. 進捗の監視とログ

```typescript
class TaskMonitor {
  async executeWithMonitoring(config: TaskConfig) {
    const startTime = Date.now();

    // Log start
    logger.info(`[${config.id}] Starting task`);

    try {
      const result = await taskToolWrapper.executeTask(config);

      // Log completion
      const duration = Date.now() - startTime;
      logger.success(`[${config.id}] Completed in ${duration}ms`);

      // Update GitHub Projects
      await this.updateProjectStatus(config.id, 'completed');

      return result;
    } catch (error) {
      logger.error(`[${config.id}] Failed`, error as Error);
      await this.updateProjectStatus(config.id, 'failed');
      throw error;
    }
  }

  private async updateProjectStatus(taskId: string, status: string) {
    // Update GitHub Projects V2
    // await projectsAPI.updateItem(taskId, { status });
  }
}
```

---

## 🔍 デバッグとトラブルシューティング

### タスクがタイムアウトする場合

```typescript
// タイムアウトを延長
await taskToolWrapper.executeTask({
  id: 'slow-task',
  type: 'refactor',
  prompt: 'Large refactoring task',
  timeout: 1800000, // 30 minutes
});

// または、タスクを分割
const subtasks = splitLargeTask(largeTask);
for (const subtask of subtasks) {
  await taskToolWrapper.executeTask(subtask);
}
```

### タスクが失敗し続ける場合

```typescript
// デバッグモードで実行
const result = await taskToolWrapper.executeTask({
  id: 'debug-task',
  type: 'fix',
  prompt: 'Fix with detailed logging',
  metadata: {
    debug: true,
    logLevel: 'verbose',
  },
});

// ログを確認
console.log('Task logs:', result.output);
```

### 並列タスクの依存関係エラー

```typescript
// DAG (Directed Acyclic Graph) を使用
import { TaskDAG } from './agents/coordination/TaskDAG.js';

const dag = new TaskDAG();
dag.addTask('task-1', { type: 'feat', prompt: '...' });
dag.addTask('task-2', { type: 'test', prompt: '...', dependsOn: ['task-1'] });
dag.addTask('task-3', { type: 'docs', prompt: '...', dependsOn: ['task-1'] });

// 依存関係を解決して順次実行
const results = await dag.execute(taskToolWrapper);
```

---

## 📊 監視とメトリクス

### タスク実行の統計

```typescript
class TaskMetrics {
  private metrics = {
    total: 0,
    completed: 0,
    failed: 0,
    avgDuration: 0,
  };

  recordTask(result: TaskResult) {
    this.metrics.total++;

    if (result.status === 'completed') {
      this.metrics.completed++;
    } else {
      this.metrics.failed++;
    }

    // Update average duration
    this.metrics.avgDuration =
      (this.metrics.avgDuration * (this.metrics.total - 1) + result.duration) /
      this.metrics.total;
  }

  getStats() {
    return {
      ...this.metrics,
      successRate: (this.metrics.completed / this.metrics.total) * 100,
    };
  }
}

// Usage
const metrics = new TaskMetrics();
const result = await taskToolWrapper.executeTask(config);
metrics.recordTask(result);

console.log('Task Statistics:', metrics.getStats());
```

---

## 🔗 統合例

### Coordinator Agent との統合

```typescript
// agents/coordinator.ts
import { taskToolWrapper } from './coordination/TaskToolWrapper.js';

export class CoordinatorAgent {
  async decomposeAndExecute(issue: Issue) {
    // Issue を分解
    const tasks = await this.decomposeIssue(issue);

    // すべてのタスクを Task tool で実行
    const results = await Promise.all(
      tasks.map(task => taskToolWrapper.executeTask({
        id: task.id,
        type: task.type,
        prompt: task.description,
        files: task.files,
      }))
    );

    return results;
  }
}
```

---

## 📚 関連ドキュメント

- [Parallel Work Architecture](./PARALLEL_WORK_ARCHITECTURE.md)
- [Worker Coordination Protocol](./WORKER_COORDINATION_PROTOCOL.md)
- [Claude Code Documentation](https://docs.claude.com/claude-code)

---

## ⚠️ 重要な注意事項

1. **必ず Task tool を使用**: 直接コード実行ではなく、必ず TaskToolWrapper を経由
2. **適切なタイムアウト**: タスクの複雑さに応じたタイムアウトを設定
3. **エラーハンドリング**: すべてのタスクで適切なエラーハンドリング
4. **ログの記録**: デバッグとトレーシングのために詳細なログを記録
5. **Guardian への通知**: 重要なエラーは必ず Guardian に通知
