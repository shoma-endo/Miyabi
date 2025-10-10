# Miyabi ✨

[![npm version](https://badge.fury.io/js/miyabi.svg)](https://www.npmjs.com/package/miyabi)
[![License: Apache-2.0](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)

[English](#english) | [日本語](#日本語)

---

## 日本語

**一つのコマンドで全てが完結する自律型開発フレームワーク**

## クイックスタート

```bash
npx miyabi
```

たったこれだけ。全て自動で完結します。

## インストール

```bash
# npxで直接実行（推奨）
npx miyabi

# グローバルインストール
npm install -g miyabi
miyabi
```

## 使い方

### ステップ1: コマンドを実行

```bash
npx miyabi
```

### ステップ2: メニューから選択

```
✨ Miyabi

一つのコマンドで全てが完結

? 何をしますか？
  🆕 新しいプロジェクトを作成
  📦 既存プロジェクトに追加
  📊 ステータス確認
  ❌ 終了
```

### ステップ3: あとは待つだけ

AIエージェントが自動で:
- Issueを分析してラベル付け
- タスクに分解
- コードを実装
- コード品質をレビュー
- PRを作成

10-15分でPRが完成。レビューして、マージするだけ。

## 特徴

### 🎯 開発者体験
- **一つのコマンド**: `miyabi`だけ覚えればOK
- **対話形式**: 必要な情報を質問形式で聞きます
- **完全日本語UI**: 全てのメッセージが日本語
- **自動セットアップ**: `npm install`直後から使える
- **環境検出**: Node.js, Git, GITHUB_TOKENを自動チェック

### 🤖 AI自律エージェント（7種類）
1. **CoordinatorAgent** - タスク統括・並列実行制御
2. **IssueAgent** - Issue分析・ラベル管理
3. **CodeGenAgent** - AI駆動コード生成
4. **ReviewAgent** - コード品質判定
5. **PRAgent** - Pull Request自動作成
6. **DeploymentAgent** - CI/CDデプロイ自動化
7. **TestAgent** - テスト自動実行

### 🔄 完全自動ワークフロー
- Issue作成からPR作成まで全自動
- 識学理論に基づく53ラベル体系
- GitHub Projects V2自動連携
- リアルタイム進捗トラッキング
- 並列実行で高速処理（72%効率化）

### 📚 ドキュメント自動生成
- TypeScript/JavaScriptコードから自動生成
- JSDoc/TSDoc対応
- Watch mode（ファイル変更を自動検知）
- Training materials生成（AI学習用）

### 🔐 セキュリティ
- CODEOWNERS自動生成
- ブランチ保護ルール管理
- シークレットスキャン統合
- 依存関係脆弱性チェック
- SBOM生成（CycloneDX形式）

### 🚀 GitHub OS統合（15コンポーネント）
- Issues, Actions, Projects V2
- Webhooks, Pages, Packages
- Discussions, Releases, Environments
- Security, Labels, Milestones
- Pull Requests, Wiki, API

## 何が得られるか

### 📊 自動化されるワークフロー
- ✅ **Issue分析**: 53ラベル体系による自動分類
- ✅ **タスク分解**: DAGベースの依存関係解析
- ✅ **コード実装**: Claude Sonnet 4による高品質コード生成
- ✅ **テスト作成**: Vitest対応、80%+カバレッジ目標
- ✅ **コードレビュー**: 静的解析・セキュリティスキャン・品質スコアリング
- ✅ **PR作成**: Conventional Commits準拠、Draft PR自動生成
- ✅ **デプロイ**: Firebase自動デプロイ・ヘルスチェック・Rollback機能

### 📈 プロジェクト管理
- ✅ **リアルタイム進捗**: GitHub Projects V2連携
- ✅ **カスタムフィールド**: Agent名、Duration、Cost、Quality Score
- ✅ **KPIダッシュボード**: メトリクス自動生成（GitHub Pages）
- ✅ **週次レポート**: 自動Issue作成

### 📚 ドキュメント
- ✅ **API docs自動生成**: TypeScript/JavaScript AST解析
- ✅ **Training materials**: AI学習用資料生成
- ✅ **GitHub Discussions統合**: 自動投稿

### 🔐 セキュリティ・品質管理
- ✅ **依存関係監視**: Dependabot, npm audit
- ✅ **CodeQL分析**: セキュリティ脆弱性検出
- ✅ **シークレットスキャン**: Gitleaks統合
- ✅ **SBOM生成**: Software Bill of Materials
- ✅ **OpenSSF Scorecard**: セキュリティスコアリング

## 使用例

### 新規プロジェクト作成

```bash
$ npx miyabi

? 何をしますか？ 🆕 新しいプロジェクトを作成
? プロジェクト名: my-app
? プライベートリポジトリにしますか？ No

🚀 セットアップ開始...
✓ GitHubリポジトリ作成
✓ ラベル設定（53個）
✓ ワークフロー配置（10+個）
✓ Projects設定
✓ ローカルにクローン

完了！🎉
```

### 既存プロジェクトに追加

```bash
$ cd my-existing-project
$ npx miyabi

? 何をしますか？ 📦 既存プロジェクトに追加
? ドライランで確認しますか？ Yes

🔍 プロジェクト解析中...
✓ 言語検出: JavaScript/TypeScript
✓ フレームワーク: Next.js
✓ ビルドツール: Vite
✓ パッケージマネージャー: pnpm

インストール予定:
  - 53個のラベル
  - 10+個のワークフロー
  - Projects V2連携
```

### ステータス確認

```bash
$ npx miyabi

? 何をしますか？ 📊 ステータス確認
? ウォッチモードを有効にしますか？ No

📊 Miyabi ステータス

State         Count  Status
───────────────────────────
Pending       2      ⏳ 待機中
Implementing  3      ⚡ 作業中
Reviewing     1      🔍 レビュー中
Done          15     ✓ 完了

📝 最近のPR:
#42 ユーザーダッシュボード追加
#41 ログインリダイレクト修正
#40 APIエンドポイントのドキュメント化
```

## コマンドリファレンス

### 対話モード
```bash
# メインメニュー表示
npx miyabi

# オプション選択
? 何をしますか？
  🌸 初めての方（セットアップガイド）
  🆕 新しいプロジェクトを作成
  📦 既存プロジェクトに追加
  📊 ステータス確認
  📚 ドキュメント生成
  ⚙️  設定
  ❌ 終了
```

### 直接コマンド（CLI mode）
```bash
# 新規プロジェクト作成
npx miyabi init my-project [--private] [--skip-install]

# 既存プロジェクトに追加
npx miyabi install [--dry-run]

# ステータス確認
npx miyabi status [--watch]

# ドキュメント生成
npx miyabi docs [--input ./src] [--output ./docs/API.md] [--watch] [--training]

# 設定管理
npx miyabi config

# セットアップガイド
npx miyabi setup
```

### 環境変数

**GitHub認証（必須）**

推奨方法：gh CLIを使用
```bash
# GitHub CLIで認証（推奨）
gh auth login

# アプリケーションは自動的に 'gh auth token' を使用します
```

代替方法：環境変数（CI/CD用）
```bash
# 環境変数を使用（gh CLIがない環境向け）
export GITHUB_TOKEN=ghp_xxxxx
```

**Anthropic API Key（Agent実行時に必要）**
```bash
export ANTHROPIC_API_KEY=sk-ant-xxxxx
```

**オプション設定**
```bash
export MIYABI_LOG_LEVEL=info
export MIYABI_PARALLEL_AGENTS=3
```

## アーキテクチャ

### 識学理論（Shikigaku Theory）5原則

Miyabiは株式会社識学の理論に基づいた自律型組織設計:

1. **責任の明確化** - 各AgentがIssueに対する責任を負う
2. **権限の委譲** - Agentは自律的に判断・実行可能
3. **階層の設計** - CoordinatorAgent → 各専門Agent
4. **結果の評価** - 品質スコア、カバレッジ、実行時間で評価
5. **曖昧性の排除** - DAGによる依存関係明示、状態ラベルで進捗可視化

### パフォーマンス指標

- **並列実行効率**: 72%（Phase A → B/E並列化で36h → 26h）
- **テストカバレッジ**: 83.78%（目標: 80%+）
- **品質スコア**: 80点以上でマージ可能
- **Critical Path最適化**: DAGベース依存関係解析

## ドキュメント

### 公式ドキュメント
- [Termux環境ガイド](docs/TERMUX_GUIDE.md) - Android/Termux環境での使用方法
- [セキュリティポリシー](SECURITY.md) - セキュリティ脆弱性の報告方法

### 開発者向け
- [パブリッシュガイド](docs/PUBLICATION_GUIDE.md) - npm公開手順
- [Agent開発ガイド](packages/miyabi-agent-sdk/README.md) - カスタムAgent作成
- [CLAUDE.md](packages/cli/CLAUDE.md) - Claude Code統合

### API・仕様
- [ラベル定義](.github/labels.yml) - 53ラベル体系
- [GitHub Actionsワークフロー](.github/workflows/) - 自動化ワークフロー

## 必要要件

### 基本要件
- **Node.js** >= 18.0.0（推奨: v20 LTS）
- **GitHubアカウント**
- **git CLI** - バージョン管理
- **GitHub Personal Access Token** - API認証

### オプション
- **gh CLI** - GitHub CLI（推奨）
- **Anthropic API Key** - Agent実行時に必要

### サポート環境
- ✅ macOS（Intel / Apple Silicon）
- ✅ Linux（Ubuntu, Debian, RHEL系）
- ✅ Windows（WSL2推奨）
- ⚠️ Termux（一部機能制限あり - 対話モード無効）

## バージョン情報

- **Current**: v0.8.0 (2025-10-09)
- **npm**: https://www.npmjs.com/package/miyabi
- **Repository**: https://github.com/ShunsukeHayashi/Miyabi
- **License**: Apache-2.0
- **Author**: Shunsuke Hayashi ([@ShunsukeHayashi](https://github.com/ShunsukeHayashi))
- **X (Twitter)**: [@The_AGI_WAY](https://x.com/The_AGI_WAY)

### 最新の変更 (v0.8.0)
- ✅ ライセンスをApache 2.0に変更（商標・特許保護強化）
- ✅ NOTICEファイル追加（帰属表示・商標保護）
- ✅ README英語版セクション追加
- ✅ GitHubトークンセキュリティ強化（gh CLI優先）
- ✅ Termux環境完全対応ガイド

## トラブルシューティング

### OAuth認証エラーが発生する

```
❌ エラーが発生しました: Error: Failed to request device code: Not Found
```

**原因**: OAuth Appが未設定のため、デバイスフロー認証が使えません。

**解決方法**: GitHub Personal Access Tokenを使用してください。

1. https://github.com/settings/tokens/new にアクセス
2. 以下の権限を選択:
   - `repo` - Full control of private repositories
   - `workflow` - Update GitHub Action workflows
   - `read:project`, `write:project` - Access projects
3. トークンを生成してコピー
4. プロジェクトのルートに `.env` ファイルを作成:
   ```bash
   echo "GITHUB_TOKEN=ghp_your_token_here" > .env
   ```
5. もう一度 `npx miyabi` を実行

### 古いバージョンが実行される

**解決方法**:

```bash
# グローバルインストールを削除
npm uninstall -g miyabi

# npxキャッシュをクリア
rm -rf ~/.npm/_npx

# 最新版を明示的に指定
npx miyabi@latest
```

### トークンが無効と表示される

```
⚠️ トークンが無効です。再認証が必要です
```

**解決方法**: `.env` ファイルのトークンを削除または更新してください:

```bash
# 古いトークンを削除
rm .env

# 新しいトークンを作成（上記の手順に従う）
echo "GITHUB_TOKEN=ghp_new_token" > .env
```

## コントリビューション

Miyabiへのコントリビューションを歓迎します！

### 報告・提案
- **バグ報告**: [GitHub Issues](https://github.com/ShunsukeHayashi/Miyabi/issues)
- **機能提案**: [GitHub Discussions](https://github.com/ShunsukeHayashi/Miyabi/discussions)
- **セキュリティ報告**: [SECURITY.md](SECURITY.md)

### 開発に参加
1. リポジトリをフォーク
2. フィーチャーブランチを作成 (`git checkout -b feature/amazing-feature`)
3. 変更をコミット (`git commit -m 'feat: Add amazing feature'`)
4. ブランチをプッシュ (`git push origin feature/amazing-feature`)
5. Pull Requestを作成

### コミットメッセージ規約
Conventional Commits準拠:
- `feat:` - 新機能
- `fix:` - バグ修正
- `docs:` - ドキュメント更新
- `chore:` - ビルド・設定変更
- `test:` - テスト追加・修正

## サポート

### コミュニティ
- **GitHub Discussions**: https://github.com/ShunsukeHayashi/Miyabi/discussions
- **Issues**: https://github.com/ShunsukeHayashi/Miyabi/issues

### スポンサー
Miyabiの開発を支援してください:
- **GitHub Sponsors**: https://github.com/sponsors/ShunsukeHayashi
- **Patreon**: https://www.patreon.com/ShunsukeHayashi

## ライセンス

Apache License 2.0 - 詳細は [LICENSE](LICENSE) を参照

Copyright (c) 2025 Shunsuke Hayashi

このソフトウェアは商標保護と特許保護を含むApache 2.0ライセンスの下で提供されています。
- 「Miyabi」は Shunsuke Hayashi の商標です
- 改変版を配布する場合は、変更内容を明示する必要があります
- 詳細は [NOTICE](NOTICE) ファイルをご覧ください

## 謝辞

- **Claude AI (Anthropic)** - AIペアプログラミング
- **識学理論** - 組織設計の理論的基盤
- **オープンソースコミュニティ** - 全ての依存パッケージ

---

**覚えるコマンドは一つだけ。**

```bash
npx miyabi
```

🌸 **Miyabi** - Beauty in Autonomous Development
🤖 Powered by Claude AI

---

## English

**An autonomous development framework where everything completes with one command**

### Quick Start

```bash
npx miyabi
```

That's it. Everything runs automatically.

### What is Miyabi?

Miyabi is a complete autonomous AI development operations platform built on the "GitHub as OS" architecture. From issue creation to code implementation, PR creation, and deployment—everything is fully automated.

### Key Features

🎯 **Developer Experience**
- **One Command**: Just remember `miyabi`
- **Interactive Mode**: Guides you through setup with questions
- **Fully Japanese UI**: All messages in Japanese (English support coming soon)
- **Auto Setup**: Works right after `npm install`
- **Environment Detection**: Auto-checks Node.js, Git, GITHUB_TOKEN

🤖 **7 AI Autonomous Agents**
1. **CoordinatorAgent** - Task orchestration & parallel execution control
2. **IssueAgent** - Issue analysis & label management
3. **CodeGenAgent** - AI-driven code generation
4. **ReviewAgent** - Code quality assessment
5. **PRAgent** - Automated Pull Request creation
6. **DeploymentAgent** - CI/CD deployment automation
7. **TestAgent** - Automated test execution

🔄 **Fully Automated Workflow**
- Fully automated from issue creation to PR creation
- 53-label system based on Shikigaku Theory
- Auto-integration with GitHub Projects V2
- Real-time progress tracking
- High-speed processing with parallel execution (72% efficiency improvement)

📚 **Automatic Documentation Generation**
- Auto-generated from TypeScript/JavaScript code
- JSDoc/TSDoc support
- Watch mode (auto-detects file changes)
- Training materials generation (for AI learning)

🔐 **Security**
- CODEOWNERS auto-generation
- Branch protection rules management
- Secret scanning integration
- Dependency vulnerability checking
- SBOM generation (CycloneDX format)

### Installation

```bash
# Run directly with npx (recommended)
npx miyabi

# Global installation
npm install -g miyabi
miyabi
```

### Usage

**Step 1: Run the command**
```bash
npx miyabi
```

**Step 2: Select from menu**
```
✨ Miyabi

Everything completes with one command

? What would you like to do?
  🆕 Create new project
  📦 Add to existing project
  📊 Check status
  ❌ Exit
```

**Step 3: Just wait**

AI agents automatically:
- Analyze and label issues
- Decompose into tasks
- Implement code
- Review code quality
- Create PR

PR completes in 10-15 minutes. Just review and merge.

### Requirements

**Basic Requirements**
- **Node.js** >= 18.0.0 (recommended: v20 LTS)
- **GitHub Account**
- **git CLI** - Version control
- **GitHub Personal Access Token** - API authentication

**Optional**
- **gh CLI** - GitHub CLI (recommended)
- **Anthropic API Key** - Required for agent execution

### Supported Environments
- ✅ macOS (Intel / Apple Silicon)
- ✅ Linux (Ubuntu, Debian, RHEL-based)
- ✅ Windows (WSL2 recommended)
- ⚠️ Termux (some features limited - interactive mode disabled)

### Documentation

- [Termux Guide](docs/TERMUX_GUIDE.md) - Usage in Android/Termux environment
- [Security Policy](SECURITY.md) - Security vulnerability reporting
- [Publication Guide](docs/PUBLICATION_GUIDE.md) - npm publishing process
- [Agent SDK](packages/miyabi-agent-sdk/README.md) - Custom agent development
- [Claude Code Integration](packages/cli/CLAUDE.md) - Claude Code setup

### Version Information

- **Current**: v0.8.0 (2025-10-09)
- **npm**: https://www.npmjs.com/package/miyabi
- **Repository**: https://github.com/ShunsukeHayashi/Miyabi
- **License**: Apache-2.0
- **Author**: Shunsuke Hayashi ([@ShunsukeHayashi](https://github.com/ShunsukeHayashi))
- **X (Twitter)**: [@The_AGI_WAY](https://x.com/The_AGI_WAY)

### Support

**Community**
- **GitHub Discussions**: https://github.com/ShunsukeHayashi/Miyabi/discussions
- **Issues**: https://github.com/ShunsukeHayashi/Miyabi/issues

**Sponsorship**
Support Miyabi's development:
- **GitHub Sponsors**: https://github.com/sponsors/ShunsukeHayashi
- **Patreon**: https://www.patreon.com/ShunsukeHayashi

### License

Apache License 2.0 - See [LICENSE](LICENSE) for details

Copyright (c) 2025 Shunsuke Hayashi

This software is provided under the Apache 2.0 License with trademark and patent protection.
- "Miyabi" is a trademark of Shunsuke Hayashi
- Modified versions must clearly indicate changes
- See [NOTICE](NOTICE) file for full attribution requirements

### Acknowledgments

- **Claude AI (Anthropic)** - AI pair programming
- **Shikigaku Theory** - Theoretical foundation for organizational design
- **Open Source Community** - All dependency packages

---

**Remember just one command.**

```bash
npx miyabi
```

🌸 **Miyabi** - Beauty in Autonomous Development
🤖 Powered by Claude AI
