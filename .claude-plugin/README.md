# 🌸 Miyabi - Claude Code Plugin

**完全自律型AI開発オペレーションプラットフォーム**

Claude Code Plugin として、Issue作成からコード実装、PR作成、デプロイまでを完全自動化します。

---

## ✨ クイックスタート

```bash
# Claude Code内で実行
/plugin install miyabi
```

インストール後、すぐに利用可能です！

---

## 🎯 提供機能

### 📝 Slash Commands（8つ）

| コマンド | 説明 | 使用例 |
|---------|------|--------|
| `/miyabi-init` | 新規プロジェクト作成 | 53ラベル、26ワークフロー自動セットアップ |
| `/miyabi-status` | ステータス確認 | リアルタイムIssue/PR状態表示 |
| `/miyabi-auto` | Water Spider自動モード | Issue自動処理（最大処理数指定可） |
| `/miyabi-todos` | TODO検出→Issue化 | コード内TODOを自動Issue化 |
| `/miyabi-agent` | Agent実行 | 7つのAgentから選択実行 |
| `/miyabi-docs` | ドキュメント生成 | README/API/Architecture docs生成 |
| `/miyabi-deploy` | デプロイ実行 | staging/production デプロイ |
| `/miyabi-test` | テスト実行 | unit/integration/e2e テスト |

### 🤖 Autonomous Agents（7つ）

| Agent | 役割 | 主な機能 |
|-------|------|---------|
| **CoordinatorAgent** | タスク統括 | DAG分解、並列実行制御、進捗管理 |
| **CodeGenAgent** | コード生成 | Claude Sonnet 4による高品質実装 |
| **ReviewAgent** | 品質判定 | 静的解析、セキュリティスキャン、品質スコアリング |
| **IssueAgent** | Issue分析 | 53ラベル自動分類、優先度判定 |
| **PRAgent** | PR作成 | Conventional Commits準拠、Draft PR自動生成 |
| **DeploymentAgent** | デプロイ | Firebase自動デプロイ・Rollback |
| **TestAgent** | テスト | Vitest実行、80%+カバレッジ目標 |

### 🪝 Event Hooks（4つ）

| Hook | タイミング | 実行内容 |
|------|----------|---------|
| **pre-commit** | コミット前 | Lint + Type check + Test |
| **post-commit** | コミット後 | コミット情報表示、メトリクス更新 |
| **pre-pr** | PR作成前 | Rebase確認、Test、Coverage、Conventional Commits検証 |
| **post-test** | テスト後 | カバレッジレポート生成、HTML出力、アーカイブ |

---

## 🚀 使い方

### 1. インストール

```bash
# Claude Code内で実行
/plugin install miyabi
```

### 2. 新規プロジェクト作成

```bash
/miyabi-init
```

プロジェクト名を入力するだけで、以下が自動実行されます：

- ✅ GitHubリポジトリ作成
- ✅ 53ラベルセットアップ
- ✅ 26 GitHub Actionsワークフロー展開
- ✅ Projects V2作成
- ✅ ローカルクローン
- ✅ Welcome Issue作成

### 3. ステータス確認

```bash
/miyabi-status
```

現在のプロジェクト状態、Issue進捗、Agent稼働状況をリアルタイム表示。

### 4. 自動モード起動

```bash
/miyabi-auto
```

Water Spider Agent が未処理Issueを自動検出・処理します。

**10-15分でPRが完成。レビューして、マージするだけ。**

---

## 🎨 完全自動ワークフロー

```
Issue作成
    ↓
IssueAgent（自動ラベル分類）
    ↓
CoordinatorAgent（DAG分解、並列実行プラン）
    ↓
CodeGenAgent（コード実装）
    ↓
TestAgent（テスト実行、80%+カバレッジ）
    ↓
ReviewAgent（品質チェック、80点以上でパス）
    ↓
PRAgent（Draft PR作成）
    ↓
DeploymentAgent（マージ後に自動デプロイ）
```

---

## 📊 パフォーマンス

- **並列実行効率**: 72%向上（36h → 26h）
- **テストカバレッジ**: 83.78%（目標: 80%+）
- **品質スコア**: 80点以上でマージ可能
- **平均処理時間**: 10-15分（Issue → PR）
- **成功率**: 95%+（自動PR作成）

---

## 🏷️ 53ラベル体系

識学理論5原則に基づいた体系的ラベル管理：

- **優先度**: P0-Critical, P1-High, P2-Medium, P3-Low（4種）
- **ステータス**: pending, analyzing, implementing, reviewing, done, blocked（8種）
- **タイプ**: feature, bug, refactor, docs, test, deployment（12種）
- **エリア**: frontend, backend, infra, etc.（15種）
- **Agent**: coordinator, codegen, review, issue, pr, deployment, test（7種）
- **難易度**: trivial, simple, moderate, complex, critical（5種）
- **その他**: good-first-issue, help-wanted（2種）

---

## 🔐 セキュリティ

- ✅ CodeQL（GitHub Advanced Security）
- ✅ ESLint セキュリティルール
- ✅ Gitleaks統合（シークレットスキャン）
- ✅ Dependabot自動PR
- ✅ SBOM生成（CycloneDX）
- ✅ OpenSSF Scorecard

---

## ⚙️ 必要要件

### 必須
- **Node.js**: >= 18.0.0（推奨: v20 LTS）
- **Git**: 最新版
- **GitHub Account**: GitHubアカウント
- **GitHub Token**: Personal Access Token または gh CLI

### オプション
- **gh CLI**: GitHub CLI（推奨）
- **Anthropic API Key**: Agent実行時に必要

---

## 📚 ドキュメント

- 📄 [メインリポジトリ](https://github.com/ShunsukeHayashi/Miyabi)
- 📖 [完全ガイド](https://github.com/ShunsukeHayashi/Miyabi/blob/main/README.md)
- 🔌 [Plugin統合ガイド](https://github.com/ShunsukeHayashi/Miyabi/blob/main/docs/CLAUDE_CODE_PLUGIN_INTEGRATION.md)
- 📱 [Termux環境ガイド](https://github.com/ShunsukeHayashi/Miyabi/blob/main/docs/TERMUX_GUIDE.md)
- 🤖 [Agent開発ガイド](https://github.com/ShunsukeHayashi/Miyabi/tree/main/packages/miyabi-agent-sdk)
- 🔒 [セキュリティポリシー](https://github.com/ShunsukeHayashi/Miyabi/blob/main/SECURITY.md)

---

## 💡 コマンドリファレンス

### 新規プロジェクト作成
```bash
/miyabi-init
```

### ステータス確認
```bash
/miyabi-status
```

Watch モード（5秒ごと自動更新）もサポート。

### Water Spider 自動モード
```bash
/miyabi-auto
```

最大処理Issue数、ポーリング間隔をカスタマイズ可能。

### TODO検出・Issue化
```bash
/miyabi-todos
```

コード内のTODO/FIXME/HACKコメントを自動検出してIssue化。

### Agent実行
```bash
/miyabi-agent
```

7つのAgentから選択実行：
- coordinator - タスク統括
- codegen - コード生成
- review - 品質判定
- issue - Issue分析
- pr - PR作成
- deployment - デプロイ
- test - テスト実行

### ドキュメント生成
```bash
/miyabi-docs
```

README、API docs、アーキテクチャ図を自動生成。

### デプロイ
```bash
/miyabi-deploy
```

staging/production へのデプロイ、ロールバック機能。

### テスト実行
```bash
/miyabi-test
```

unit/integration/e2e テスト、カバレッジレポート生成。

---

## 🤝 サポート

- 🐛 **バグ報告**: [GitHub Issues](https://github.com/ShunsukeHayashi/Miyabi/issues)
- 💡 **機能提案**: [GitHub Discussions](https://github.com/ShunsukeHayashi/Miyabi/discussions)
- 💬 **コミュニティ**: [Discord](https://discord.gg/miyabi)
- 🐦 **X (Twitter)**: [@The_AGI_WAY](https://x.com/The_AGI_WAY)

---

## 📜 ライセンス

**Apache License 2.0**

Copyright (c) 2025 Shunsuke Hayashi

- ✅ 商用利用可能
- ✅ 改変・再配布可能
- ✅ 商標保護・特許保護を含む
- ⚠️ 「Miyabi」は Shunsuke Hayashi の商号です（未登録商標）

詳細: [LICENSE](https://github.com/ShunsukeHayashi/Miyabi/blob/main/LICENSE)

---

## ⚠️ AI生成コードに関する注意事項

Miyabiは **Claude AI** を使用して自動的にコードを生成します。

### ユーザーの責任
- ✅ **必ずレビュー**: 生成されたコードをマージ前に必ず確認
- ✅ **徹底的なテスト**: 本番環境以外で十分にテスト
- ✅ **エラーの可能性**: AIが生成するコードには予期しないエラーが含まれる可能性あり
- ✅ **本番デプロイの責任**: 本番環境へのデプロイはユーザーの責任

### 免責事項
**Miyabiプロジェクトは、AI生成コードに起因する問題について一切の責任を負いません。**

---

<div align="center">

## 🌸 Miyabi - Beauty in Autonomous Development

**一つのコマンドで全てが完結する自律型開発フレームワーク**

[![npm version](https://img.shields.io/npm/v/miyabi?style=for-the-badge&logo=npm&color=CB3837)](https://www.npmjs.com/package/miyabi)
[![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg?style=for-the-badge&logo=apache)](https://opensource.org/licenses/Apache-2.0)
[![GitHub Stars](https://img.shields.io/github/stars/ShunsukeHayashi/Miyabi?style=for-the-badge&logo=github&color=yellow)](https://github.com/ShunsukeHayashi/Miyabi/stargazers)

🤖 Powered by Claude AI • 🔒 Apache 2.0 License • 💖 Made with Love

[GitHub Repository](https://github.com/ShunsukeHayashi/Miyabi) • [Documentation](https://github.com/ShunsukeHayashi/Miyabi/wiki) • [Discord Community](https://discord.gg/miyabi)

</div>
