---
description: 新規Miyabiプロジェクトを作成
---

# Miyabi プロジェクト初期化

新規プロジェクトを作成し、Miyabi の完全自律型開発環境をセットアップします。

## コマンド

```bash
npx miyabi init <project-name>
```

## 実行内容

このコマンドは以下を自動的に実行します:

### 1. GitHub OAuth認証
```
Device Flow OAuth による安全な認証
→ ブラウザで認証コード入力
→ トークン自動取得・保存
```

### 2. GitHubリポジトリ作成
```
新規リポジトリ作成
→ owner/project-name
→ Public/Private選択可能
→ README, .gitignore, LICENSE自動生成
```

### 3. 53ラベルセットアップ
```
識学理論5原則に基づく53ラベル体系
→ 優先度ラベル（P0-Critical ~ P3-Low）
→ 状態ラベル（pending/analyzing/implementing/reviewing/done）
→ Agentラベル（coordinator/codegen/review/issue/pr/deployment/test）
→ 品質ラベル（excellent/good/needs-improvement/poor）
```

### 4. GitHub Actions展開
```
26ワークフロー自動配置
→ .github/workflows/ に配置
→ CI/CD, セキュリティスキャン, レポート生成
→ 自動テスト, デプロイ, モニタリング
```

### 5. Projects V2作成
```
カンバンボード自動作成
→ Backlog / Todo / In Progress / Review / Done
→ 自動Issue連携
→ カスタムフィールド（優先度、規模、複雑度）
```

### 6. ローカルにクローン
```
git clone → ローカルディレクトリ作成
→ npm install 実行
→ 依存関係インストール
```

### 7. Welcome Issue作成
```
初回セットアップガイドIssue
→ 環境変数設定手順
→ 次のステップ案内
→ チュートリアルリンク
```

## 使用例

### 基本的な使用
```bash
npx miyabi init my-awesome-app
```

### 対話的セットアップ
```
? プロジェクト名: my-awesome-app
? 説明: My awesome application
? リポジトリの公開設定: Public
? ライセンス: MIT
? TypeScript使用: Yes
? テストフレームワーク: Vitest

✓ GitHubリポジトリ作成完了
✓ 53ラベルセットアップ完了
✓ 26 GitHub Actions展開完了
✓ Projects V2作成完了
✓ ローカルクローン完了
✓ Welcome Issue作成完了

🎉 プロジェクト初期化完了！

次のステップ:
1. cd my-awesome-app
2. npx miyabi status
3. Issue #1 (Welcome Issue) を確認
```

## オプション

### プロジェクト設定
```bash
# プロジェクト名を指定
npx miyabi init my-project

# Private リポジトリとして作成
npx miyabi init my-project --private

# テンプレートから作成
npx miyabi init my-project --template typescript-full
```

### スキップオプション
```bash
# GitHub Actions をスキップ
npx miyabi init my-project --skip-workflows

# Projects V2 をスキップ
npx miyabi init my-project --skip-project

# Welcome Issue をスキップ
npx miyabi init my-project --skip-welcome
```

### 非対話モード
```bash
# 全てデフォルト設定で作成
npx miyabi init my-project --yes

# 設定ファイルから読み込み
npx miyabi init my-project --config miyabi-config.yml
```

## 環境変数

初期化後、以下の環境変数を `.env` に設定:

```bash
# GitHub Personal Access Token（自動設定済み）
GITHUB_TOKEN=ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# Anthropic API Key（手動設定が必要）
ANTHROPIC_API_KEY=sk-ant-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# リポジトリ情報（自動設定済み）
REPOSITORY=owner/my-project

# デバイス識別子（オプション）
DEVICE_IDENTIFIER=MacBook Pro 16-inch
```

## ディレクトリ構造

初期化後のプロジェクト構造:

```
my-awesome-app/
├── .github/
│   ├── workflows/              # 26 GitHub Actions
│   ├── ISSUE_TEMPLATE/
│   ├── PULL_REQUEST_TEMPLATE.md
│   └── labels.yml             # 53ラベル定義
├── .ai/
│   ├── logs/                  # 実行ログ
│   ├── parallel-reports/      # 並列実行レポート
│   └── knowledge-base/        # ナレッジベース
├── .claude/
│   ├── agents/                # 7 Agent定義
│   ├── commands/              # カスタムコマンド
│   └── mcp-servers/           # MCP Server設定
├── src/
│   └── index.ts
├── tests/
│   └── index.test.ts
├── .env.example
├── .miyabi.yml                # Miyabi設定
├── package.json
├── tsconfig.json
├── vitest.config.ts
├── README.md
└── LICENSE
```

## 53ラベル体系

### 優先度（Priority）
- 🔥 priority:P0-Critical
- ⚠️ priority:P1-High
- 📊 priority:P2-Medium
- 📝 priority:P3-Low

### 状態（State）
- 📥 state:pending
- 🔍 state:analyzing
- 🏗️ state:implementing
- 👀 state:reviewing
- ✅ state:done
- 🔴 state:blocked
- 🔴 state:failed

### Agent
- 🤖 agent:coordinator
- 🤖 agent:codegen
- 🤖 agent:review
- 🤖 agent:issue
- 🤖 agent:pr
- 🤖 agent:deployment
- 🤖 agent:test

### 品質（Quality）
- ⭐ quality:excellent
- ✅ quality:good
- ⚠️ quality:needs-improvement
- 🔴 quality:poor

### タイプ（Type）
- ✨ type:feature
- 🐛 type:bug
- 🔧 type:refactor
- 📚 type:docs
- 🧪 type:test
- 🚀 type:deployment

## トラブルシューティング

### GitHub認証エラー
```
❌ Error: GitHub authentication failed

解決策:
1. gh auth login を実行
2. ブラウザで認証
3. 再度 npx miyabi init を実行
```

### リポジトリ作成エラー
```
❌ Error: Repository already exists

解決策:
1. 別のプロジェクト名を使用
2. または既存リポジトリに追加: npx miyabi install
```

### ラベル作成エラー
```
❌ Error: Failed to create labels

解決策:
1. GitHub トークンに repo 権限があるか確認
2. リポジトリへの書き込み権限があるか確認
```

## ベストプラクティス

### 🎯 プロジェクト命名
```bash
# Good
npx miyabi init my-awesome-app
npx miyabi init e-commerce-platform
npx miyabi init ai-chat-bot

# Bad
npx miyabi init test  # 汎用的すぎる
npx miyabi init 123   # 数字のみ
```

### ⚠️ 注意事項
- プロジェクト名は GitHub リポジトリ名として使用されます
- 既存リポジトリと重複しないよう注意してください
- Private リポジトリは GitHub プラン制限に注意

## 次のステップ

初期化完了後:

1. **環境変数設定**
   ```bash
   cd my-awesome-app
   cp .env.example .env
   # .env を編集して ANTHROPIC_API_KEY を追加
   ```

2. **状態確認**
   ```bash
   npx miyabi status
   ```

3. **自動モード起動**
   ```bash
   npx miyabi auto --max-issues 5
   ```

4. **Welcome Issue確認**
   ```bash
   gh issue view 1
   ```

---

🌸 **Miyabi** - Beauty in Autonomous Development
🚀 **一つのコマンドで全てが完結する自律型開発フレームワーク**
