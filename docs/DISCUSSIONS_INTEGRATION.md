# GitHub Discussions Integration

## 🎯 概要

GitHub Discussions を**メッセージキュー / フォーラム**として活用し、非同期コミュニケーションと週次 KPI レポートの自動投稿を実現します。

**OS Mapping**: `GitHub Discussions → Message Queue / Forum`

---

## 📋 セットアップ手順

### 1. GitHub Discussions を有効化

```bash
# GitHub UI で有効化
# Repository → Settings → General → Features → Discussions をチェック
# https://github.com/YOUR_USERNAME/Autonomous-Operations/settings
```

### 2. カテゴリの設定

以下のカテゴリを作成してください:

| カテゴリ名 | 用途 | 説明 |
|-----------|------|------|
| **Announcements** | 通知 | 週次 KPI レポート、重要なお知らせ |
| **Q&A** | 質問 | Agent への質問、技術的な疑問 |
| **Ideas** | 提案 | 機能要望、改善案 |
| **Show and tell** | 成果報告 | Agent の成功事例、実装報告 |

#### カテゴリ作成手順

1. Repository → Discussions タブを開く
2. 右上の歯車アイコン → "Categories" をクリック
3. 各カテゴリを作成:
   - **Announcements**: Format = Announcement
   - **Q&A**: Format = Question / Answer
   - **Ideas**: Format = Open-ended discussion
   - **Show and tell**: Format = Open-ended discussion

### 3. GitHub Token の設定

Discussions API には既存の `GH_PROJECT_TOKEN` が使用できます。

必要なスコープ:
- `repo` (読み書き)
- `read:discussion`
- `write:discussion`

`.env` に設定済みであれば追加設定は不要です。

---

## 🚀 使い方

### 自動投稿（GitHub Actions）

#### 週次 KPI レポート

毎週月曜日 9:00 AM UTC に自動的に KPI レポートが Announcements に投稿されます。

**Workflow**: `.github/workflows/weekly-kpi-report.yml`

```yaml
on:
  schedule:
    - cron: '0 9 * * 1'  # Every Monday at 9:00 AM UTC
  workflow_dispatch:  # Manual trigger
```

**投稿内容:**
- 総 Issue 数、完了率
- 平均実行時間
- 総コスト、ROI
- 平均品質スコア
- 週次達成事項

#### 手動トリガー

```bash
# GitHub Actions から手動実行
gh workflow run weekly-kpi-report.yml
```

---

### プログラムから使用

#### 基本的な使い方

```typescript
import { DiscussionsClient } from './agents/github/discussions.js';

const client = new DiscussionsClient(token, {
  owner: 'YOUR_USERNAME',
  repo: 'Autonomous-Operations',
});

await client.initialize();
```

#### Discussion を作成

```typescript
// Q&A カテゴリに質問を投稿
const categoryId = client.getCategoryId('Q&A');

const discussion = await client.createDiscussion({
  categoryId,
  title: 'How to configure custom Agent?',
  body: 'I want to create a custom Agent for my specific use case...',
});

console.log(`Discussion created: ${discussion.url}`);
```

#### コメントを追加

```typescript
await client.addComment(discussion.id, 'Here is the answer...');
```

#### カテゴリ別に取得

```typescript
// Announcements の最新 10 件を取得
const announcements = await client.getDiscussionsByCategory('Announcements', 10);

for (const disc of announcements) {
  console.log(`${disc.number}: ${disc.title}`);
  console.log(`  URL: ${disc.url}`);
  console.log(`  Created: ${disc.createdAt}`);
}
```

#### 週次 KPI レポートを投稿

```typescript
import { ProjectsV2Client } from './agents/github/projects-v2.js';
import { DiscussionsClient } from './agents/github/discussions.js';

// KPI データを取得
const projectsClient = new ProjectsV2Client(token, config);
await projectsClient.initialize();
const kpiData = await projectsClient.generateKPIReport();

// Discussions に投稿
const discussionsClient = new DiscussionsClient(token, config);
await discussionsClient.initialize();
const discussion = await discussionsClient.postWeeklyKPIReport(kpiData);

console.log(`Posted: ${discussion.url}`);
```

#### Agent の質問を投稿

```typescript
const discussion = await client.createAgentQuestion(
  'How to handle rate limits?',
  'I encountered a rate limit error when calling GitHub API...'
);
```

#### 成功事例を共有

```typescript
const discussion = await client.shareSuccessStory(
  '🎉 Successfully automated Issue #123',
  'This issue was complex but Agent completed it in 8 minutes with high quality.',
  {
    duration: 8,
    cost: 0.12,
    qualityScore: 95,
  }
);
```

---

## 📊 データフロー

```
┌──────────────────────────────────────────────────────────┐
│                  GitHub Discussions                       │
│                  (Message Queue / Forum)                  │
├──────────────────────────────────────────────────────────┤
│                                                           │
│  ┌────────────────┐      ┌──────────────────┐           │
│  │  Announcements │      │      Q&A         │           │
│  │  (KPI reports) │      │  (Agent support) │           │
│  └────────────────┘      └──────────────────┘           │
│           │                       │                       │
│           │                       │                       │
│           ▼                       ▼                       │
│  ┌────────────────┐      ┌──────────────────┐           │
│  │ Show and tell  │      │      Ideas       │           │
│  │ (Success logs) │      │  (Feature reqs)  │           │
│  └────────────────┘      └──────────────────┘           │
│                                                           │
└──────────────────────────────────────────────────────────┘
         ▲                                   │
         │ Weekly reports                    │ Community feedback
         │ Agent notifications               │ Feature requests
         │                                   ▼
┌──────────────────────────────────────────────────────────┐
│                  Autonomous Operations                    │
│  Projects V2, Agents, TaskOrchestrator                   │
└──────────────────────────────────────────────────────────┘
```

---

## 🔧 API リファレンス

### DiscussionsClient

#### Constructor

```typescript
const client = new DiscussionsClient(token: string, config: DiscussionsConfig);
```

**Parameters:**
- `token`: GitHub Personal Access Token
- `config.owner`: Repository owner
- `config.repo`: Repository name

#### Methods

##### `initialize(): Promise<void>`

Repository に接続し、利用可能なカテゴリを取得します。

##### `getCategoryId(categoryName: string): string`

カテゴリ名から ID を取得します。

**Throws**: カテゴリが見つからない場合

##### `createDiscussion(input: CreateDiscussionInput): Promise<Discussion>`

新しい Discussion を作成します。

**Parameters:**
```typescript
{
  categoryId: string;
  title: string;
  body: string;
}
```

**Returns**: `Discussion` オブジェクト

##### `addComment(discussionId: string, body: string): Promise<Comment>`

Discussion にコメントを追加します。

##### `searchDiscussions(query: string, first?: number): Promise<Discussion[]>`

Discussion を検索します（最新順）。

##### `getDiscussionsByCategory(categoryName: string, first?: number): Promise<Discussion[]>`

特定カテゴリの Discussion を取得します（最新順）。

##### `postWeeklyKPIReport(kpiData: KPIData): Promise<Discussion>`

週次 KPI レポートを Announcements に投稿します。

**Parameters:**
```typescript
{
  totalIssues: number;
  completedIssues: number;
  avgDuration: number;
  totalCost: number;
  avgQualityScore: number;
}
```

##### `createAgentQuestion(title: string, question: string): Promise<Discussion>`

Agent からの質問を Q&A カテゴリに投稿します。

##### `shareSuccessStory(title: string, story: string, metrics?: Metrics): Promise<Discussion>`

成功事例を Show and tell カテゴリに投稿します。

---

## 🎨 使用パターン

### Pattern 1: 週次レポート自動投稿

```typescript
// GitHub Actions で毎週月曜日に実行
import { ProjectsV2Client } from './agents/github/projects-v2.js';
import { DiscussionsClient } from './agents/github/discussions.js';

async function weeklyReport() {
  // KPI データ取得
  const projectsClient = new ProjectsV2Client(token, config);
  await projectsClient.initialize();
  const kpiData = await projectsClient.generateKPIReport();

  // Discussions に投稿
  const discussionsClient = new DiscussionsClient(token, config);
  await discussionsClient.initialize();
  await discussionsClient.postWeeklyKPIReport(kpiData);
}
```

### Pattern 2: Agent からの質問

```typescript
// Agent が問題に遭遇した際に質問を投稿
async function askForHelp(issue: string) {
  const client = new DiscussionsClient(token, config);
  await client.initialize();

  await client.createAgentQuestion(
    `Help needed: ${issue}`,
    `Agent encountered an issue while processing...\n\nDetails: ${issue}`
  );
}
```

### Pattern 3: 成功事例の自動共有

```typescript
// タスク完了時に自動的に成功事例を投稿
async function shareSuccess(taskResult: TaskResult) {
  const client = new DiscussionsClient(token, config);
  await client.initialize();

  await client.shareSuccessStory(
    `✅ Successfully completed Issue #${taskResult.issueNumber}`,
    taskResult.summary,
    {
      duration: taskResult.duration,
      cost: taskResult.cost,
      qualityScore: taskResult.qualityScore,
    }
  );
}
```

### Pattern 4: コミュニティフィードバック収集

```typescript
// Ideas カテゴリから機能要望を取得
async function collectFeatureRequests() {
  const client = new DiscussionsClient(token, config);
  await client.initialize();

  const ideas = await client.getDiscussionsByCategory('Ideas', 20);

  for (const idea of ideas) {
    console.log(`Feature Request: ${idea.title}`);
    console.log(`  Votes: ${idea.upvoteCount}`);
    console.log(`  URL: ${idea.url}`);
  }
}
```

---

## 📈 統合シナリオ

### シナリオ 1: 完全自動 KPI トラッキング

```
1. Agent が Issue を処理
2. Projects V2 にデータ記録
3. 毎週月曜日に KPI レポート自動生成
4. Discussions (Announcements) に自動投稿
5. コミュニティが進捗を確認
```

### シナリオ 2: Agent サポートループ

```
1. Agent が問題に遭遇
2. Discussions (Q&A) に質問を自動投稿
3. 人間 Guardian がコメントで回答
4. Agent がコメントから学習・改善
```

### シナリオ 3: 成功事例のナレッジベース構築

```
1. Agent がタスク完了
2. Show and tell に自動投稿
3. コミュニティがベストプラクティスを学習
4. 他のプロジェクトが参考に
```

---

## 🎯 Phase C: 完了基準

- [x] `DiscussionsClient` 実装完了
- [x] カテゴリ管理機能
- [x] Discussion 作成/コメント追加
- [x] 週次 KPI レポート自動投稿
- [x] Agent 質問投稿機能
- [x] 成功事例共有機能
- [x] GitHub Actions ワークフロー
- [x] ドキュメント完成

---

## 🔗 関連ドキュメント

- [PROJECTS_V2_INTEGRATION.md](./PROJECTS_V2_INTEGRATION.md) - KPI データソース
- [Issue #5](https://github.com/YOUR_USERNAME/Autonomous-Operations/issues/5) - Full OS Integration
- [GitHub Discussions API](https://docs.github.com/en/graphql/guides/using-the-graphql-api-for-discussions)

---

## 🚨 トラブルシューティング

### Error: "Discussions are disabled"

**原因**: Repository で Discussions が有効化されていない

**解決策**:
1. Repository → Settings → General
2. Features セクションで "Discussions" をチェック
3. Save changes

### Error: "Category 'xxx' not found"

**原因**: 指定したカテゴリが存在しない

**解決策**:
1. Repository → Discussions → Categories
2. 必要なカテゴリを作成: `Announcements`, `Q&A`, `Ideas`, `Show and tell`
3. カテゴリ名が正確に一致するか確認（大文字小文字区別あり）

### Error: Token permissions

**原因**: Token に Discussions 権限がない

**解決策**:
Token に以下のスコープを追加:
- `read:discussion`
- `write:discussion`
- `repo` (full repository access)

---

## 📚 次のステップ

Phase C 完了後:
- **Phase B**: Webhooks 統合（イベント駆動 Agent 起動）
- **Phase E**: GitHub Pages ダッシュボード（KPI 可視化）

詳細: [Issue #5](https://github.com/YOUR_USERNAME/Autonomous-Operations/issues/5)
