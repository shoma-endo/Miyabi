# Worker Coordination Protocol

## 🎯 概要

複数のワーカー（人間 + AI エージェント）が衝突なく並列作業するための**協調プロトコル**。

---

## 📋 ワーカー登録プロトコル

### 1. ワーカー登録

```bash
# ワーカーとして登録
npm run worker:register --name="Alice" --type="human"

# AI エージェント登録
npm run worker:register --name="CodeGenBot" --type="ai_agent" --skills="typescript,testing"
```

**登録時の情報:**
- Worker ID (自動生成)
- 名前
- タイプ (human / ai_agent)
- スキルセット
- 最大同時タスク数

### 2. ワーカー状態

```typescript
enum WorkerStatus {
  IDLE = 'idle',         // 待機中
  WORKING = 'working',   // 作業中
  OFFLINE = 'offline',   // オフライン
}
```

---

## 🔄 タスク割り当てプロトコル

### ステップ1: 利用可能タスクの取得

```bash
npm run task:available
```

**出力例:**
```
Available Tasks:
1. [fix] Issue #456 - Auth bug (5 min, files: src/auth/login.ts)
2. [feat] Issue #789 - Add OAuth (10 min, files: src/auth/oauth.ts)
3. [docs] Issue #101 - Update docs (2 min, files: docs/AUTH.md)
```

### ステップ2: タスククレーム

```bash
npm run task:claim --task-id="task-001"
```

**クレームプロセス:**
1. ファイル衝突チェック
2. ロックファイル作成
3. タスク状態を `claimed` に更新
4. Git worktree セットアップ
5. ワーカーにタスク割り当て

### ステップ3: タスク開始

```bash
cd .worktrees/task-001
npm run task:start
```

**自動実行:**
- ブランチ作成
- タスク状態を `in_progress` に更新
- Claude Code Task tool で実行開始
- 進捗ログ開始

### ステップ4: タスク完了

```bash
npm run task:complete --task-id="task-001"
```

**完了プロセス:**
1. テスト実行
2. main ブランチを rebase
3. PR 作成
4. ロック解除
5. Worktree クリーンアップ

---

## 🛡️ 衝突回避ルール

### ルール1: ファイルロック

**同じファイルを変更するタスクは同時実行不可**

```typescript
// 衝突検出例
Task A: files: ['src/auth/login.ts']
Task B: files: ['src/auth/login.ts']
→ 衝突! Task B は待機
```

### ルール2: 共有ファイルの保護

**Critical Files (排他ロック必須):**
- `package.json`
- `package-lock.json`
- `tsconfig.json`
- `.github/workflows/*.yml`

**戦略:**
これらのファイルを変更するタスクは1つずつ順次実行

### ルール3: ロックタイムアウト

**ロックは60分で自動期限切れ**

```json
{
  "expiresAt": "2025-10-08T04:00:00Z"
}
```

ワーカーは5分ごとにロックを更新（heartbeat）

---

## 📊 進捗報告プロトコル

### Heartbeat (5分ごと)

```bash
npm run worker:heartbeat --task-id="task-001"
```

**送信情報:**
- タスクID
- 進捗率 (0-100%)
- 現在のステップ
- 推定残り時間

### 進捗更新

```typescript
await progressMonitor.update({
  taskId: 'task-001',
  percentComplete: 45,
  currentStep: 'Writing unit tests',
  estimatedTimeRemaining: 3, // minutes
});
```

### ステータスダッシュボード

```bash
npm run worker:status
```

**リアルタイム表示:**
```
🤖 Active Workers: 3

Alice      [Human]      fix/456    ████░░ 70%  (ETA: 2 min)
Bob        [AI Agent]   feat/789   ██████ 100% (Done)
Charlie    [AI Agent]   docs/101   ████░░ 80%  (ETA: 1 min)
```

---

## 🚨 エラーハンドリング

### エラータイプ

```typescript
enum TaskError {
  TIMEOUT = 'timeout',              // タスクタイムアウト
  FILE_CONFLICT = 'file_conflict',  // ファイル衝突
  TEST_FAILURE = 'test_failure',    // テスト失敗
  MERGE_CONFLICT = 'merge_conflict',// マージコンフリクト
}
```

### エラー処理フロー

```
エラー発生
  ↓
リトライ可能?
  Yes → 自動リトライ (最大3回)
  No  → ワーカーに通知
  ↓
Guardian に通知
  ↓
人間の介入待ち
```

---

## 🔄 ワークフロー完全例

### シナリオ: Alice が Issue #456 を修正

```bash
# 1. ワーカー登録 (初回のみ)
npm run worker:register --name="Alice" --type="human"

# 2. 利用可能タスクを確認
npm run task:available
# → Task task-001: Fix Issue #456 (files: src/auth/login.ts)

# 3. タスククレーム
npm run task:claim --task-id="task-001"
# → Worktree created: .worktrees/task-001
# → Lock acquired: .task-locks/task-001.lock
# → Branch created: fix/456-task-001-auth-bug

# 4. Worktree に移動して作業開始
cd .worktrees/task-001
npm run task:start
# → Claude Code Task tool 実行開始

# 5. 進捗確認 (別ターミナルで)
npm run worker:status
# → Alice: fix/456 ████░░ 70% (ETA: 2 min)

# 6. タスク完了
npm run task:complete --task-id="task-001"
# → Tests passed ✓
# → PR created: #1234
# → Lock released
# → Worktree cleaned up

# 7. 次のタスクへ
cd ../..  # プロジェクトルートに戻る
npm run task:available
```

---

## 📝 コミュニケーションプロトコル

### ワーカー間通信

**GitHub Projects V2 コメント:**
```typescript
await projectsAPI.addComment(taskId, {
  author: 'Alice',
  message: 'Task 70% complete, ETA 2 minutes',
  timestamp: new Date(),
});
```

### Guardian への通知

**重要イベント:**
- タスク失敗
- タイムアウト
- マージコンフリクト
- 異常な遅延

```typescript
await notifyGuardian({
  workerId: 'alice',
  taskId: 'task-001',
  event: 'task_failed',
  error: 'Test suite failed',
  requiresIntervention: true,
});
```

---

## 🎯 ベストプラクティス

### 1. タスクサイズ

- **小さいタスク**: 5-10分で完了
- **中程度**: 10-30分
- **大きいタスク**: 30分以上 → 分割を推奨

### 2. 定期的な Heartbeat

```typescript
setInterval(() => {
  workerRegistry.sendHeartbeat(workerId, {
    status: 'working',
    progress: currentProgress,
  });
}, 300000); // 5分ごと
```

### 3. タスク完了後のクリーンアップ

```bash
# 自動クリーンアップ
npm run task:complete --task-id="task-001" --cleanup=true
```

### 4. エラー時の即座報告

```typescript
try {
  await executeTask(task);
} catch (error) {
  await reportError(task, error);
  await notifyGuardian(task, error);
}
```

---

## 🔗 関連ドキュメント

- [Parallel Work Architecture](./PARALLEL_WORK_ARCHITECTURE.md)
- [Claude Code Task Tool Guide](./CLAUDE_CODE_TASK_TOOL.md)
- [Architecture Diagrams](./diagrams/)

---

## 📚 API リファレンス

### Worker Registry API

```typescript
// ワーカー登録
await workerRegistry.register({
  name: 'Alice',
  type: 'human',
  skills: ['typescript', 'react'],
});

// ワーカー状態更新
await workerRegistry.updateStatus(workerId, 'working');

// アクティブワーカー取得
const workers = await workerRegistry.getActiveWorkers();
```

### Task Queue API

```typescript
// 利用可能タスク取得
const tasks = await taskQueue.getAvailableTasks(workerId);

// タスククレーム
const task = await taskQueue.claimTask(taskId, workerId);

// タスク完了
await taskQueue.completeTask(taskId, result);
```

### Lock Manager API

```typescript
// ロック取得
const locked = await lockManager.acquireLock(task, worker);

// ロック解放
await lockManager.releaseLock(task);

// ロック更新 (heartbeat)
await lockManager.renewLock(task);
```

---

## 🚀 クイックスタート

### 新しいワーカーのオンボーディング

```bash
# 1. ワーカー登録
npm run worker:register

# 2. 最初のタスクをクレーム
npm run task:claim --interactive

# 3. ステータスを確認
npm run worker:status

# 4. タスク実行
npm run task:start

# 5. 完了
npm run task:complete
```

すべてのコマンドはインタラクティブモードをサポートしています。
