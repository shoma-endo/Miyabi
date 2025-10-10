---
description: プロジェクトステータスを確認
---

# Miyabi プロジェクトステータス確認

現在のプロジェクト状態、Issue進捗、Agent稼働状況をリアルタイムで確認します。

## コマンド

```bash
npx miyabi status [options]
```

## 表示内容

### 1. プロジェクト概要
```
📊 Project: owner/repository
🌸 Miyabi Version: 0.8.1
📅 Last Updated: 2025-10-10 18:30:45
```

### 2. Issue統計
```
📥 Issues Summary
  Total: 54
  Open: 12
  Closed: 42

  By State:
    📥 Pending: 3
    🔍 Analyzing: 2
    🏗️ Implementing: 4
    👀 Reviewing: 2
    ✅ Done: 1
    🔴 Blocked: 0
```

### 3. 優先度別
```
⚡ By Priority
  🔥 P0-Critical: 1
  ⚠️ P1-High: 3
  📊 P2-Medium: 5
  📝 P3-Low: 3
```

### 4. Agent稼働状況
```
🤖 Agents Status
  🤖 CoordinatorAgent: Active (2 tasks)
  🤖 CodeGenAgent: Idle
  🤖 ReviewAgent: Active (1 task)
  🤖 IssueAgent: Idle
  🤖 PRAgent: Idle
  🤖 DeploymentAgent: Idle
  🤖 TestAgent: Active (3 tasks)
```

### 5. 最近のアクティビティ
```
📌 Recent Activity (Last 24h)
  ✅ Issue #52: Discord community plan - Closed
  🏗️ Issue #54: Claude Code Plugin integration - In Progress
  👀 PR #51: Fix unit tests - Under Review
  🚀 Deploy: Production v0.8.1 - Success
```

### 6. 品質メトリクス
```
⭐ Quality Metrics
  Code Quality Score: 85/100 ✅
  Test Coverage: 82% ✅
  Security Score: 92/100 ✅
  Documentation: 78% ⚠️
```

## オプション

### Watch モード
```bash
# 5秒ごとにリアルタイム更新
npx miyabi status --watch

# 更新間隔を指定（秒）
npx miyabi status --watch --interval 10
```

### 詳細表示
```bash
# 全Issue一覧を表示
npx miyabi status --verbose

# 特定の状態のみ表示
npx miyabi status --state implementing

# 特定の優先度のみ表示
npx miyabi status --priority P0,P1
```

### フィルタリング
```bash
# Agent別にフィルタ
npx miyabi status --agent codegen

# ラベル別にフィルタ
npx miyabi status --label type:bug

# 担当者別にフィルタ
npx miyabi status --assignee @me
```

### 出力形式
```bash
# JSON形式で出力
npx miyabi status --format json

# マークダウン形式で出力（レポート生成用）
npx miyabi status --format markdown > status-report.md

# CSV形式で出力（スプレッドシート用）
npx miyabi status --format csv > status.csv
```

## MCPツール

### `miyabi__status`
Claude Code内からステータス確認

**パラメータ**:
- `watch`: Watch モード（デフォルト: false）
- `interval`: 更新間隔（秒）（デフォルト: 5）
- `format`: 出力形式（json/markdown/text）

**使用例**:
```
プロジェクトステータス確認:
miyabi__status({})

Watch モードで監視:
miyabi__status({ watch: true, interval: 10 })

JSON形式で取得:
miyabi__status({ format: "json" })
```

## 表示例

### 通常モード
```
🌸 Miyabi Project Status

📊 Project: ShunsukeHayashi/Miyabi
🌸 Version: 0.8.1
📅 2025-10-10 18:30:45

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📥 Issues Summary
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Total: 54 issues
  📥 Open: 12
  ✅ Closed: 42

By State:
  📥 Pending       : 3
  🔍 Analyzing     : 2
  🏗️ Implementing  : 4
  👀 Reviewing     : 2
  ✅ Done          : 1
  🔴 Blocked       : 0

By Priority:
  🔥 P0-Critical  : 1
  ⚠️ P1-High      : 3
  📊 P2-Medium    : 5
  📝 P3-Low       : 3

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🤖 Agents Status
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🤖 CoordinatorAgent  : ✅ Active (2 tasks)
🤖 CodeGenAgent      : 💤 Idle
🤖 ReviewAgent       : ✅ Active (1 task)
🤖 IssueAgent        : 💤 Idle
🤖 PRAgent           : 💤 Idle
🤖 DeploymentAgent   : 💤 Idle
🤖 TestAgent         : ✅ Active (3 tasks)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📌 Recent Activity (Last 24h)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✅ #52 Discord community plan
   State: done → Created: 2h ago

🏗️ #54 Claude Code Plugin integration
   State: implementing → Created: 30m ago

👀 #51 Fix unit tests (PR)
   State: reviewing → Created: 3h ago

🚀 Production Deploy: v0.8.1
   Status: Success → 5h ago

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
⭐ Quality Metrics
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Code Quality  : 85/100 ✅ Good
Test Coverage : 82%    ✅ Good
Security      : 92/100 ✅ Excellent
Documentation : 78%    ⚠️  Needs Improvement

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

💡 Recommendations:
  1. P0 Issue #45 requires immediate attention
  2. 3 Issues blocked - review dependencies
  3. Documentation coverage below 80% target
```

### Watch モード
```
🌸 Miyabi Status Watch Mode (Update every 5s)
Press Ctrl+C to exit

[18:30:45] 📊 12 open / 🏗️ 4 implementing / 🤖 3 agents active
[18:30:50] 📊 12 open / 🏗️ 4 implementing / 🤖 3 agents active
[18:30:55] 📊 11 open / 🏗️ 5 implementing / 🤖 4 agents active ⬆️
           ✅ Issue #53 moved to implementing
[18:31:00] 📊 11 open / 🏗️ 5 implementing / 🤖 4 agents active
```

### JSON形式
```json
{
  "project": {
    "owner": "ShunsukeHayashi",
    "repo": "Miyabi",
    "version": "0.8.1",
    "timestamp": "2025-10-10T18:30:45Z"
  },
  "issues": {
    "total": 54,
    "open": 12,
    "closed": 42,
    "by_state": {
      "pending": 3,
      "analyzing": 2,
      "implementing": 4,
      "reviewing": 2,
      "done": 1,
      "blocked": 0
    },
    "by_priority": {
      "P0": 1,
      "P1": 3,
      "P2": 5,
      "P3": 3
    }
  },
  "agents": {
    "coordinator": { "status": "active", "tasks": 2 },
    "codegen": { "status": "idle", "tasks": 0 },
    "review": { "status": "active", "tasks": 1 }
  },
  "metrics": {
    "code_quality": 85,
    "test_coverage": 82,
    "security_score": 92,
    "documentation": 78
  }
}
```

## 環境変数

```bash
GITHUB_TOKEN=ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
REPOSITORY=owner/repo
```

## 使用例

### 例1: 基本的なステータス確認
```
あなた: "プロジェクトの状態を教えて"

Claude: [miyabi__status({}) を実行]

📊 Project Status

12件のIssueがオープン中です:
- 🏗️ 実装中: 4件
- 👀 レビュー中: 2件
- 🔥 緊急対応必要: 1件

🤖 現在3つのAgentが稼働中:
- CoordinatorAgent (2タスク)
- ReviewAgent (1タスク)
- TestAgent (3タスク)

⚠️ 推奨アクション:
Issue #45 (P0-Critical) の対応が必要です
```

### 例2: Watch モードで監視
```
あなた: "リアルタイムでステータスを監視して"

Claude: [miyabi__status({ watch: true, interval: 5 }) を実行]

Watch モード開始（5秒ごと更新）

[18:30] 📊 12 open, 4 implementing
[18:35] 📊 11 open, 5 implementing ⬆️
        Issue #53が実装フェーズに移行しました

Ctrl+C で停止できます
```

## トラブルシューティング

### API認証エラー
```
❌ Error: GitHub API authentication failed

解決策:
1. GITHUB_TOKEN が設定されているか確認
2. トークンが有効か確認（gh auth status）
3. repo 権限があるか確認
```

### Issue取得エラー
```
❌ Error: Failed to fetch issues

解決策:
1. REPOSITORY 環境変数が正しいか確認
2. リポジトリへの読み取り権限があるか確認
3. ネットワーク接続を確認
```

## ベストプラクティス

### 🎯 定期的なステータス確認
```bash
# 毎朝のスタンドアップ前に確認
npx miyabi status

# 夕方の進捗確認
npx miyabi status --priority P0,P1

# 週次レポート生成
npx miyabi status --format markdown > weekly-status.md
```

### ⚠️ 注意事項
- Watch モードはAPI制限に注意（更新間隔は5秒以上推奨）
- 大規模プロジェクトでは --verbose オプションは重い
- JSON/CSV出力は CI/CD での自動レポート生成に最適

---

💡 **ヒント**: Watch モードで継続監視することで、Issue状態の変化をリアルタイムでキャッチできます。
