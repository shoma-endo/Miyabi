# Claude Code Plugin 統合計画

**Version**: 1.0
**Date**: 2025-10-10
**Status**: Planning Phase

---

## 🎯 概要

Claude Code の新しい **Plugin システム** (Public Beta) を活用し、Miyabi を Claude Code Plugin として配布する計画です。

### Plugin システムとは

Claude Code の拡張機能として、以下を配布できるようになりました:
1. **Slash Commands** - カスタムコマンド
2. **Agents (Subagents)** - 特殊なエージェント
3. **MCP Servers** - 外部ツール統合
4. **Hooks** - イベントハンドラ

---

## 📊 現状分析

### Miyabi の既存構成

Miyabi は既に以下を持っています:

#### ✅ 既にある構成要素

1. **.claude/** ディレクトリ
   - `agents/`: 7つのAgent定義（CoordinatorAgent, CodeGenAgent, etc.）
   - `commands/`: Slash Commands（setup-miyabi.md など）
   - `mcp-servers/`: MCP Server設定

2. **templates/claude-code/**
   - 新規プロジェクト用テンプレート
   - CLAUDE.md テンプレート

3. **packages/cli/**
   - `miyabi` CLI ツール

### Plugin 化するメリット

1. **簡単なインストール**
   ```bash
   /plugin marketplace add ShunsukeHayashi/Miyabi
   /plugin install miyabi
   ```

2. **即座に利用可能**
   - インストール後すぐに全機能が使える
   - チーム全体で統一された環境

3. **自動アップデート**
   - Plugin として配布すればバージョン管理が容易

4. **発見可能性**
   - Marketplace に登録することで、他の開発者が見つけやすい

---

## 🏗️ Plugin 構造設計

### ディレクトリ構造

```
Miyabi/
├── .claude-plugin/
│   ├── plugin.json              # Plugin メタデータ
│   └── marketplace.json         # Marketplace 定義（ルート）
│
├── commands/                    # Slash Commands
│   ├── miyabi-init.md          # /miyabi-init - 新規プロジェクト作成
│   ├── miyabi-status.md        # /miyabi-status - ステータス確認
│   ├── miyabi-auto.md          # /miyabi-auto - Water Spider モード
│   ├── miyabi-todos.md         # /miyabi-todos - TODO検出
│   ├── miyabi-agent.md         # /miyabi-agent - Agent実行
│   ├── miyabi-docs.md          # /miyabi-docs - ドキュメント生成
│   └── miyabi-deploy.md        # /miyabi-deploy - デプロイ
│
├── agents/                      # Subagents
│   ├── coordinator.md          # CoordinatorAgent
│   ├── codegen.md              # CodeGenAgent
│   ├── review.md               # ReviewAgent
│   ├── issue.md                # IssueAgent
│   ├── pr.md                   # PRAgent
│   ├── deployment.md           # DeploymentAgent
│   └── test.md                 # TestAgent
│
├── hooks/                       # Event Hooks
│   ├── pre-commit.sh           # コミット前チェック
│   ├── post-commit.sh          # コミット後処理
│   ├── pre-pr.sh               # PR作成前チェック
│   └── post-test.sh            # テスト後処理
│
├── mcp-servers/                 # MCP Server 統合
│   └── miyabi-integration.js   # Miyabi 統合サーバー
│
├── README.md                    # Plugin 説明
└── LICENSE                      # Apache 2.0
```

---

## 📄 plugin.json 設計

```json
{
  "name": "miyabi",
  "version": "0.8.1",
  "description": "完全自律型AI開発オペレーションプラットフォーム - GitHub as OS アーキテクチャに基づき、Issue作成からコード実装、PR作成、デプロイまでを完全自動化",
  "author": {
    "name": "Shunsuke Hayashi",
    "email": "supernovasyun@gmail.com",
    "url": "https://github.com/ShunsukeHayashi"
  },
  "homepage": "https://github.com/ShunsukeHayashi/Miyabi",
  "repository": {
    "type": "git",
    "url": "https://github.com/ShunsukeHayashi/Miyabi.git"
  },
  "license": "Apache-2.0",
  "keywords": [
    "ai",
    "agents",
    "autonomous",
    "github",
    "devops",
    "automation",
    "claude-code",
    "development"
  ],
  "engines": {
    "claudeCode": ">=2.0.0"
  },
  "dependencies": {
    "node": ">=18.0.0",
    "git": "*",
    "gh": "*"
  },
  "commands": [
    {
      "name": "miyabi-init",
      "description": "新規プロジェクトを作成",
      "file": "commands/miyabi-init.md"
    },
    {
      "name": "miyabi-status",
      "description": "プロジェクトステータスを確認",
      "file": "commands/miyabi-status.md"
    },
    {
      "name": "miyabi-auto",
      "description": "Water Spider 自動モード起動",
      "file": "commands/miyabi-auto.md"
    },
    {
      "name": "miyabi-todos",
      "description": "TODO コメント検出と Issue 化",
      "file": "commands/miyabi-todos.md"
    },
    {
      "name": "miyabi-agent",
      "description": "指定 Agent を実行",
      "file": "commands/miyabi-agent.md"
    },
    {
      "name": "miyabi-docs",
      "description": "ドキュメント自動生成",
      "file": "commands/miyabi-docs.md"
    },
    {
      "name": "miyabi-deploy",
      "description": "デプロイ実行",
      "file": "commands/miyabi-deploy.md"
    }
  ],
  "agents": [
    {
      "name": "coordinator",
      "description": "タスク統括・並列実行制御",
      "file": "agents/coordinator.md"
    },
    {
      "name": "codegen",
      "description": "AI駆動コード生成",
      "file": "agents/codegen.md"
    },
    {
      "name": "review",
      "description": "コード品質判定",
      "file": "agents/review.md"
    },
    {
      "name": "issue",
      "description": "Issue分析・ラベル管理",
      "file": "agents/issue.md"
    },
    {
      "name": "pr",
      "description": "Pull Request自動作成",
      "file": "agents/pr.md"
    },
    {
      "name": "deployment",
      "description": "CI/CDデプロイ自動化",
      "file": "agents/deployment.md"
    },
    {
      "name": "test",
      "description": "テスト自動実行",
      "file": "agents/test.md"
    }
  ],
  "hooks": [
    {
      "event": "pre-commit",
      "script": "hooks/pre-commit.sh"
    },
    {
      "event": "post-commit",
      "script": "hooks/post-commit.sh"
    },
    {
      "event": "pre-pr",
      "script": "hooks/pre-pr.sh"
    },
    {
      "event": "post-test",
      "script": "hooks/post-test.sh"
    }
  ],
  "mcpServers": [
    {
      "name": "miyabi-integration",
      "command": "node",
      "args": ["mcp-servers/miyabi-integration.js"],
      "description": "Miyabi 統合 MCP Server"
    }
  ]
}
```

---

## 📋 marketplace.json 設計

```json
{
  "name": "Miyabi Official Plugins",
  "description": "完全自律型AI開発プラットフォーム Miyabi の公式プラグインコレクション",
  "owner": {
    "name": "Shunsuke Hayashi",
    "url": "https://github.com/ShunsukeHayashi"
  },
  "repository": "https://github.com/ShunsukeHayashi/Miyabi",
  "version": "1.0.0",
  "plugins": [
    {
      "name": "miyabi",
      "source": ".",
      "version": "0.8.1",
      "description": "Miyabi 完全パッケージ - 7つのAgent、7つのコマンド、4つのHook",
      "category": "automation",
      "tags": ["ai", "agents", "devops", "automation", "github"],
      "author": "Shunsuke Hayashi",
      "license": "Apache-2.0",
      "featured": true
    },
    {
      "name": "miyabi-core",
      "source": "./plugins/miyabi-core",
      "version": "0.8.1",
      "description": "Miyabi コア機能のみ（init, status, auto）",
      "category": "productivity",
      "tags": ["ai", "automation"],
      "author": "Shunsuke Hayashi",
      "license": "Apache-2.0"
    },
    {
      "name": "miyabi-agents-only",
      "source": "./plugins/miyabi-agents",
      "version": "0.8.1",
      "description": "Miyabi の7つのAgent定義のみ",
      "category": "agents",
      "tags": ["ai", "agents"],
      "author": "Shunsuke Hayashi",
      "license": "Apache-2.0"
    }
  ]
}
```

---

## 🚀 実装ロードマップ

### Phase 1: Plugin 構造作成 (Week 1)

#### タスク
- [ ] `.claude-plugin/` ディレクトリ作成
- [ ] `plugin.json` 作成
- [ ] `marketplace.json` 作成
- [ ] 既存の `.claude/` から commands/ にファイル移行
- [ ] 既存の `.claude/` から agents/ にファイル移行

#### 成果物
- Miyabi Plugin v1.0 の完成

---

### Phase 2: Slash Commands 実装 (Week 2)

#### 新規作成コマンド

1. **miyabi-init.md**
```markdown
---
name: miyabi-init
description: 新規Miyabiプロジェクトを作成
prompt: |
  Miyabi プロジェクトを初期化します。

  1. プロジェクト名を質問
  2. GitHub リポジトリ作成
  3. 53ラベルセットアップ
  4. GitHub Actions ワークフロー配置
  5. Projects V2 作成
  6. ローカルにクローン

  `npx miyabi init <project-name>` を実行してください。
---
```

2. **miyabi-status.md**
3. **miyabi-auto.md**
4. **miyabi-todos.md**
5. **miyabi-agent.md**
6. **miyabi-docs.md**
7. **miyabi-deploy.md**

---

### Phase 3: Hooks 実装 (Week 3)

#### Hooks 作成

1. **pre-commit.sh**
```bash
#!/bin/bash
# Miyabi Pre-Commit Hook
# Run linting and tests before commit

echo "🌸 Miyabi Pre-Commit Hook"

# Run linter
npm run lint || exit 1

# Run tests
npm test || exit 1

echo "✅ Pre-Commit checks passed"
```

2. **post-commit.sh**
```bash
#!/bin/bash
# Miyabi Post-Commit Hook
# Notify about commit

echo "🌸 Commit successful: $(git log -1 --pretty=%B)"
```

3. **pre-pr.sh**
```bash
#!/bin/bash
# Miyabi Pre-PR Hook
# Verify PR readiness

echo "🌸 Miyabi Pre-PR Check"

# Check if branch is up to date
git fetch origin main
if ! git merge-base --is-ancestor origin/main HEAD; then
  echo "⚠️ Branch is behind origin/main. Please rebase."
  exit 1
fi

# Verify tests pass
npm test || exit 1

echo "✅ Ready to create PR"
```

4. **post-test.sh**
```bash
#!/bin/bash
# Miyabi Post-Test Hook
# Generate coverage report

echo "🌸 Generating test coverage report..."
npm run test:coverage
```

---

### Phase 4: マーケットプレイス公開 (Week 4)

#### タスク
- [ ] README.md を Plugin 用に更新
- [ ] スクリーンショット・デモ GIF 追加
- [ ] GitHub Release 作成（v0.8.1-plugin）
- [ ] Claude Code Plugin Marketplace に登録申請
- [ ] SNS で発表

#### 公開方法

```bash
# ユーザーがインストールする手順
/plugin marketplace add ShunsukeHayashi/Miyabi
/plugin install miyabi
```

---

## 📚 ドキュメント更新

### README.md セクション追加

```markdown
## 🔌 Claude Code Plugin としてインストール

Miyabi は Claude Code Plugin としても利用可能です。

### インストール方法

Claude Code 内で以下を実行:

\`\`\`bash
/plugin marketplace add ShunsukeHayashi/Miyabi
/plugin install miyabi
\`\`\`

### 利用可能なコマンド

- `/miyabi-init` - 新規プロジェクト作成
- `/miyabi-status` - ステータス確認
- `/miyabi-auto` - 自動モード起動
- `/miyabi-todos` - TODO 検出
- `/miyabi-agent <name>` - Agent 実行
- `/miyabi-docs` - ドキュメント生成
- `/miyabi-deploy` - デプロイ

### 利用可能な Agents

- `coordinator` - タスク統括
- `codegen` - コード生成
- `review` - コード品質判定
- `issue` - Issue 分析
- `pr` - PR 作成
- `deployment` - デプロイ
- `test` - テスト実行
\`\`\`
```

---

## 🎯 期待される効果

### ユーザー体験の向上

**Before (従来)**:
```bash
npm install -g miyabi
miyabi init my-project
```

**After (Plugin)**:
```bash
/plugin install miyabi
/miyabi-init
```

### メリット

1. **インストールが簡単**
   - npm 不要
   - Claude Code 内で完結

2. **即座に利用可能**
   - インストール後すぐ使える
   - 環境構築不要

3. **チーム統一**
   - 全員が同じバージョンを使用
   - 設定を共有可能

4. **発見可能性向上**
   - Marketplace で検索可能
   - 他の開発者が見つけやすい

---

## 📊 成功指標

### Plugin 化後の目標

| 指標 | Month 1 | Month 3 | Month 6 |
|------|---------|---------|---------|
| **Plugin Installs** | 50 | 200 | 500 |
| **Active Users** | 30 | 120 | 300 |
| **GitHub Stars** | 120 | 250 | 500 |
| **Community PRs** | 2 | 10 | 25 |

---

## 🔗 参考リンク

- [Claude Code Plugins Documentation](https://docs.claude.com/en/docs/claude-code/plugins)
- [Anthropic Blog: Claude Code Plugins](https://www.anthropic.com/news/claude-code-plugins)
- [Example Marketplace: Seth Hobson's Commands](https://github.com/wshobson/commands)
- [Example Marketplace: Dan Ávila's Plugins](https://github.com/hesreallyhim/awesome-claude-code)

---

## 🚧 次のステップ

### Immediate (今すぐ)
1. `.claude-plugin/` ディレクトリ作成
2. `plugin.json` 作成
3. `marketplace.json` 作成

### Short-term (1-2 weeks)
4. Slash Commands 実装
5. Hooks 実装
6. README 更新

### Long-term (3-4 weeks)
7. マーケットプレイス公開
8. SNS 発表
9. コミュニティフィードバック収集

---

**Document Version**: 1.0
**Last Updated**: 2025-10-10
**Next Review**: 2025-10-17

---

🌸 **Miyabi** - Beauty in Autonomous Development
🔌 **Powered by Claude Code Plugin System**
