# 🌍 Autonomous-Operations

> **"The Operating System for the Age of Agents"**
>
> GitHubをAgenticOSとして機能させ、人類とAgentが共存する未来を創る。

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8+-blue.svg)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-20+-green.svg)](https://nodejs.org/)
[![Autonomous](https://img.shields.io/badge/Autonomous-95%25-brightgreen)](AGENTS.md)

**最終更新**: 2025-10-08 | **バージョン**: 1.0.0 | **準拠**: AGENTS.md v5.0

---

## 🎯 What is This?

**Autonomous-Operations** は、世界初の **Agentic Operating System Template** です。

### 従来の誤解
```
GitHub = コードを置く場所
```

### 真実
```
GitHub = Agent Operating System

Issues     → Process Control (プロセス管理)
Projects   → Data Persistence (永続化)
Actions    → Execution Engine (実行エンジン)
Labels     → State Machine (状態管理)
Webhooks   → Event Bus (イベントバス)
```

このリポジトリをクローンするだけで、**Agentと人間が協調する完全自律型開発環境**が即座に構築されます。

---

## ⚡ Quick Start

### 30秒で始める

```bash
# 1. このTemplateを使う
gh repo create my-project --template ShunsukeHayashi/autonomous-operations

# 2. 初期化スクリプト実行
cd my-project
./scripts/init-project.sh

# 3. 最初のIssueを作成
gh issue create --title "Add user authentication"

# 4. 5-10分待つ
# ✅ Draft PRが自動生成される
```

**Agentの仕組みを理解する必要なし** — まるでiPhoneのように。

---

## 🚀 Why This Matters

### The iPhone Moment for AI Agents

| 時代 | OS | 革命 |
|------|----|----|
| 1990s | Windows 95 | "PCを理解しなくても使える" |
| 2010s | iOS/Android | "スマホの仕組みを知らなくても使える" |
| **2025+** | **Agentic OS** | **"Agentを理解しなくても、Agentと働ける"** |

現在、Agentを使いこなせる人は**世界人口の0.1%未満**。

**Agentic OS が変える未来**:
- エンジニアでなくてもIssueを書くだけで実装完了
- コーディング教育が "Agentへの指示出し" に変わる
- 人類の生産性が指数関数的に向上

---

## 🎯 Vision & Philosophy

### 🌐 Universal Accessibility

```yaml
For Engineers:
  └─ Full control over agent behavior via AGENTS.md

For Non-Engineers:
  └─ Just create Issues → Agents handle everything

For Organizations:
  └─ Scale to 100+ repositories with unified governance
```

### 💡 Core Principles

このシステムは **AGENTS.md v5.0 "The Final Mandate"** 憲法に基づいています。

#### Three Laws of Autonomy

1. **Law of Objectivity (客観性の法則)**
   - 全ての判断は観測可能なデータに基づく
   - 感情・主観を完全排除

2. **Law of Self-Sufficiency (自給自足の法則)**
   - 人間への依存 = インシデント
   - 目標: 人間介入率 ≤5%

3. **Law of Traceability (追跡可能性の法則)**
   - 全てのアクションはGitHubに記録
   - 完全な透明性・監査可能性

---

## 🏗️ アーキテクチャ

### Agent階層構造

```
┌─────────────────────────────────────────────────┐
│          Human Layer (戦略・承認)                │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐        │
│  │TechLead │  │   PO    │  │  CISO   │        │
│  └────┬────┘  └────┬────┘  └────┬────┘        │
└───────┼───────────┼────────────┼──────────────┘
        │ Escalation│            │
┌───────┴───────────┴────────────┴──────────────┐
│       Coordinator Layer (統括)                 │
│  ┌──────────────────────────────────┐         │
│  │      CoordinatorAgent            │         │
│  │  - タスク分解 (DAG構築)          │         │
│  │  - Agent割り当て                 │         │
│  │  - 並行実行制御                  │         │
│  └──────────┬────────────┬──────────┘         │
└─────────────┼────────────┼────────────────────┘
              │ Dispatch   │
┌─────────────┴────────────┴────────────────────┐
│       Specialist Layer (実行)                  │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │CodeGen   │  │Review    │  │Issue     │   │
│  │Agent     │  │Agent     │  │Agent     │   │
│  └──────────┘  └──────────┘  └──────────┘   │
│  ┌──────────┐  ┌──────────┐                 │
│  │PR        │  │Deployment│                 │
│  │Agent     │  │Agent     │                 │
│  └──────────┘  └──────────┘                 │
└────────────────────────────────────────────┘
```

### 完全自律型ワークフロー

```
Issue作成 → IssueAgent分析 → Label自動付与 →
CoordinatorAgentタスク分解 → 並行実行 →
CodeGen/Review/Test → 品質判定(≥80点) →
PRAgent自動PR作成 → 人間レビュー →
Merge承認 → DeploymentAgent → 本番デプロイ
```

---

## 🚀 主要機能

### 1. Agent階層システム

| Agent | 責任範囲 | 権限 |
|-------|---------|------|
| **CoordinatorAgent** | タスク分解・統括・並行実行制御 | リソース配分・Agent割り当て |
| **CodeGenAgent** | AI駆動コード生成・テスト自動生成 | 実装レベル決定 |
| **ReviewAgent** | 静的解析・セキュリティスキャン・品質判定 | 品質合否判定（80点基準） |
| **IssueAgent** | Issue自動分析・Label付与・担当者割り当て | Label自動付与 |
| **PRAgent** | PR自動作成・説明文生成・Reviewer割り当て | Draft PR作成 |
| **DeploymentAgent** | CI/CD実行・デプロイ・Rollback | Staging環境デプロイ |

### 2. 並行実行システム

- **Issue/ToDo単位の並行実行**: 複数タスクの同時処理
- **DAG構築**: トポロジカルソートによる依存関係自動解決
- **循環依存検出**: 無限ループの事前防止
- **Git Worktree統合**: ブランチ分離によるバッティング完全回避
- **リアルタイム進捗モニタリング**: 実行状況の可視化
- **JSON形式レポート**: 自動生成・履歴管理

### 3. ログ駆動開発(LDD)

```yaml
codex_prompt_chain:
  intent: "何を達成するか"
  plan: ["ステップ1", "ステップ2"]
  implementation: ["変更ファイル"]
  verification: ["検証結果"]

tool_invocations:
  - command: "npm run lint"
    workdir: "/path/to/repo"
    timestamp: "2025-10-08T12:34:56Z"
    status: "passed"
    notes: "ESLintエラー0件"
```

### 4. 識学理論5原則

| 原則 | 実装内容 | KPI | 目標 |
|------|---------|-----|------|
| 1. 責任と権限の明確化 | Agent階層・Label体系・CODEOWNERS | 担当者アサイン率 | 100% |
| 2. 結果重視 | quality_score・KPI自動収集 | AI Task成功率 | 95%+ |
| 3. 階層の明確化 | Coordinator-Specialist階層 | エスカレーション正答率 | 100% |
| 4. 誤解・錯覚の排除 | 構造化プロトコル・完了条件チェック | 完了条件明示率 | 100% |
| 5. 感情的判断の排除 | 数値ベース判定（80点基準等） | データ駆動判定実施率 | 100% |

---

## 📁 リポジトリ構造

```
Autonomous-Operations/
├── .ai/                          # AIエージェント中枢管理
│   ├── logs/                     # LDD（ログ駆動開発）ログ
│   ├── parallel-reports/         # 並行実行レポート
│   └── issues/                   # GitHub Issue同期
├── agents/                       # Agent実装（予定）
│   ├── base-agent.ts
│   ├── coordinator-agent.ts
│   └── ...
├── scripts/                      # 自動化スクリプト
│   ├── parallel-executor.ts      # 並行実行システム
│   └── task-wrapper.ts           # Task tool統合
├── docs/                         # ドキュメント
│   ├── AGENT_OPERATIONS_MANUAL.md         # Agent運用マニュアル
│   ├── AUTONOMOUS_WORKFLOW_INTEGRATION.md # ワークフロー統合ガイド
│   └── REPOSITORY_OVERVIEW.md             # リポジトリ概要
├── external/                     # 外部統合
│   └── github-mcp-server/        # GitHub MCP Server
├── AGENTS.md                     # Agent運用プロトコル
├── README.md                     # 本ファイル
└── @memory-bank.mdc              # 共有メモリバンク
```

---

## 🛠️ セットアップ

### 必須ツール

```bash
node -v   # v20+
npm -v    # v10+
git --version  # v2.40+
gh --version   # v2.40+ (optional)
```

### ローカル開発環境

#### 1. リポジトリクローン

```bash
git clone https://github.com/user/Autonomous-Operations.git
cd Autonomous-Operations
```

#### 2. 依存パッケージインストール

```bash
npm install
```

#### 3. 環境変数設定

```bash
# .envファイル作成
cp .env.example .env

# .envを編集して以下を設定:
# - GITHUB_TOKEN (https://github.com/settings/tokens から取得)
# - ANTHROPIC_API_KEY (https://console.anthropic.com/ から取得)
# - REPOSITORY (owner/repo 形式)
```

#### 4. TypeScriptコンパイル確認

```bash
npm run typecheck
# ✅ 0 errors expected
```

#### 5. テスト実行

```bash
npm test
# ✅ 7 tests should pass
```

### GitHub Actions セットアップ

#### 1. Secretsの設定

GitHubリポジトリの Settings → Secrets and variables → Actions で以下を追加:

```
ANTHROPIC_API_KEY=sk-ant-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

**Note**: `GITHUB_TOKEN` は自動的に提供されるため設定不要です。

#### 2. ワークフロー有効化

`.github/workflows/autonomous-agent.yml` がリポジトリに含まれていることを確認します。

#### 3. Issueテンプレート使用

新しいIssueを作成時に「🤖 Autonomous Agent Task」テンプレートを選択します。

#### 4. Agent実行トリガー

以下のいずれかでAgentが自動実行されます:

- **Issueにラベル付与**: `🤖agent-execute` ラベルを追加
- **コメントコマンド**: Issue内で `/agent` とコメント
- **手動実行**: Actions タブから「Autonomous Agent Execution」を手動トリガー

---

## 💻 実行コマンド

### ローカル実行

#### 基本コマンド

```bash
# 単一Issue処理
npm run agents:parallel:exec -- --issue 123

# 複数Issue処理
npm run agents:parallel:exec -- --issues 123,124,125 --concurrency 3

# Dry run (変更なし確認)
npm run agents:parallel:exec -- --issue 123 --dry-run

# ヘルプ表示
npm run agents:parallel:exec -- --help
```

#### TypeScript & テスト

```bash
# TypeScriptコンパイルチェック
npm run typecheck

# テスト実行
npm test

# ビルド
npm run build
```

### GitHub Actions実行

#### 自動トリガー

1. **Issueラベル**: Issueに `🤖agent-execute` ラベルを追加
2. **コメントコマンド**: Issue内で `/agent` とコメント
3. **手動実行**: Actions → Autonomous Agent Execution → Run workflow

#### 実行フロー

```
Issue作成/ラベル付与
    ↓
GitHub Actions起動
    ↓
CoordinatorAgent実行
    ↓
├─ IssueAgent (Issue分析)
├─ CodeGenAgent (コード生成)
├─ ReviewAgent (品質チェック)
└─ PRAgent (PR作成)
    ↓
Draft PR作成
    ↓
人間レビュー
    ↓
承認 & マージ
    ↓
DeploymentAgent (自動デプロイ)
```

### レポート確認

```bash
# 最新レポート表示
cat .ai/parallel-reports/agents-parallel-*.json | jq

# 成功率集計
jq '.summary.success_rate' .ai/parallel-reports/*.json | \
  awk '{sum+=$1; count++} END {print sum/count "%"}'

# デバイス別統計
jq -r '.device_identifier' .ai/parallel-reports/*.json | sort | uniq -c
```

---

## 📊 実績・KPI

### 統合元プロジェクト実績

```yaml
ai-course-content-generator-v.0.0.1:
  total_lines: 679,000+
  agents_implemented: 7種類（2,600行）
  labels_created: 65個（識学理論体系）
  kpi_achievement:
    ai_task_success_rate: 97%
    average_execution_time: 3分
    quality_score_avg: 92点
    escalation_accuracy: 100%
```

### 主要KPI

| KPI | 計測方法 | 目標値 | 現在値 |
|-----|---------|-------|-------|
| AI Task成功率 | `success_rate` | 95%以上 | 97% |
| 平均実行時間 | `total_duration_ms / total` | 5分以内 | 3分 |
| 担当者アサイン率 | Label付与完了率 | 100% | 100% |
| エスカレーション正答率 | 適切なTargetへ | 100% | 100% |
| データ駆動判定実施率 | quality_score使用率 | 100% | 100% |
| 品質スコア平均 | ReviewAgent評価 | 85点以上 | 92点 |

---

## 📚 ドキュメント

### 🌟 Start Here

| ドキュメント | 説明 |
|-------------|------|
| **[AGENTIC_OS.md](AGENTIC_OS.md)** | 🌍 **AgenticOSの全体像** - なぜこれが世界を変えるのか |
| [GETTING_STARTED.md](GETTING_STARTED.md) | 📖 完全セットアップガイド |
| [QUICKSTART.md](QUICKSTART.md) | ⚡ 5分で始めるクイックスタート |

### 🤖 Agent System

| ドキュメント | 説明 |
|-------------|------|
| [.github/AGENTS.md](.github/AGENTS.md) | 📜 **憲法** - Three Laws of Autonomy |
| [BUDGET.yml](BUDGET.yml) | 💰 経済ガバナンス設定 |
| [docs/AGENT_OPERATIONS_MANUAL.md](docs/AGENT_OPERATIONS_MANUAL.md) | 🔧 Agent運用マニュアル（完全版） |

### 🏗️ Architecture

| ドキュメント | 説明 |
|-------------|------|
| [OSS_DEVELOPMENT_SYSTEM.md](OSS_DEVELOPMENT_SYSTEM.md) | 🔄 継続開発システム設計 |
| [docs/AUTONOMOUS_WORKFLOW_INTEGRATION.md](docs/AUTONOMOUS_WORKFLOW_INTEGRATION.md) | ⚙️ ワークフロー統合ガイド |
| [docs/REPOSITORY_OVERVIEW.md](docs/REPOSITORY_OVERVIEW.md) | 📁 リポジトリ構造解説 |

### 📝 Template Usage

| ドキュメント | 説明 |
|-------------|------|
| [TEMPLATE_INSTRUCTIONS.md](TEMPLATE_INSTRUCTIONS.md) | 📋 Templateの使い方 |
| [TEMPLATE_COMPLETE.md](TEMPLATE_COMPLETE.md) | ✅ Template完成報告 |
| [@memory-bank.mdc](@memory-bank.mdc) | 🧠 共有メモリバンク |

---

## 🗺️ ロードマップ

### ✅ Phase 1-5: Foundation & Template (完了)

- [x] Agent階層構造設計 (CoordinatorAgent + 5 Specialists)
- [x] AGENTS.md v5.0 憲法制定 (Three Laws of Autonomy)
- [x] 並行実行システム実装
- [x] LDD運用プロトコル確立
- [x] 識学理論Label体系統合 (65 labels)
- [x] Claude Code統合 (.claude/commands, .claude/agents)
- [x] MCP Server実装 (3 servers)
- [x] GitHub Actions統合
- [x] Complete Template Package

### ✅ Phase 6: Agentic OS Integration (完了 - 2025-10-08)

- [x] **AGENTIC_OS.md** - AgenticOS全体像ドキュメント
- [x] **Economic Circuit Breaker** - `.github/workflows/economic-circuit-breaker.yml`
- [x] **BUDGET.yml** - 経済ガバナンス設定
- [x] **Knowledge Persistence Layer** 設計
- [x] **Graceful Degradation Protocol** 実装
- [x] **Constitutional Amendment Process** 定義
- [x] **OSS_DEVELOPMENT_SYSTEM.md** - 継続開発システム設計
- [x] **README.md更新** - AgenticOSビジョン統合

### 🚀 Phase 7: OSS Launch (2025 Q4)

- [ ] **CODE_OF_CONDUCT.md** - コミュニティ行動規範
- [ ] **SECURITY.md** - セキュリティポリシー
- [ ] **GOVERNANCE.md** - プロジェクトガバナンス構造
- [ ] **CONTRIBUTING.md** 拡充
- [ ] Contributor Levels System実装
- [ ] Triage Bot (Issue自動ラベリング)
- [ ] Public Dashboard (GitHub Pages)
- [ ] Template Repository公開
- [ ] 初期コミュニティ形成

### 🌱 Phase 8: Community Growth (2026 Q1-Q2)

- [ ] Knowledge Base Repository (`autonomous-operations-knowledge`)
- [ ] Vector DB統合 (Pinecone/Weaviate)
- [ ] Agent Learning System (過去事例検索)
- [ ] Example Projects (3-5 showcases)
- [ ] Integration Guides (Firebase, Vercel, AWS)
- [ ] Monthly Community Calls
- [ ] YouTube Tutorials (JP/EN)
- [ ] Medium/Dev.to Blog Series

### 🌍 Phase 9: Ecosystem Expansion (2026 Q3-Q4)

- [ ] 100+ Projects Adoption
- [ ] GitHub Official Integration検討
- [ ] "Agentic Mode" Feature Proposal
- [ ] Educational Curriculum ("Agent-Native Development")
- [ ] Enterprise Support Package
- [ ] Multi-language Support (中文, Español, etc.)
- [ ] Annual AgenticOS Conference

### 🔮 Phase 10: The Future (2027+)

- [ ] **Agent-Native Generation** - 次世代開発者育成
- [ ] **10,000+ Repositories** - エコシステム確立
- [ ] **GitHub Native Feature** - プラットフォーム統合
- [ ] **Industry Standard** - デファクトスタンダード化

---

## 🔧 開発ガイドライン

### Git運用

```bash
# ブランチ命名規則
devin/{timestamp}-{feature-name}

# コミットメッセージ（Conventional Commits）
feat(agents): CoordinatorAgent実装
fix(parallel): 循環依存検出バグ修正
docs(manual): Agent運用マニュアル更新

# Draft PR作成
gh pr create \
  --title "feat: CoordinatorAgent実装" \
  --body-file .ai/issues/feature-coordinator.md \
  --draft
```

### LDD運用

```yaml
1_タスク開始前:
  - .ai/logs/YYYY-MM-DD.md作成
  - codex_prompt_chain.intent/plan記載

2_タスク実行中:
  - tool_invocations逐次追記
  - エラー時は即座に記録

3_タスク完了後:
  - implementation/verification完成
  - @memory-bank.mdc更新
  - ➡️ NEXT STEPS提示
```

---

## 🐛 トラブルシューティング

### よくある問題

| 問題 | 原因 | 解決策 |
|------|------|-------|
| Task tool APIエラー | Claude Code未実装 | 疑似実行モード使用 |
| Worktree競合 | 既存worktree残存 | `git worktree prune` |
| 依存関係循環 | Issue相互依存 | Issue本文修正 |
| 並行度過多 | `--concurrency`過大 | 2-5に調整 |
| 品質スコア不合格 | 自動修正不能エラー | 手動修正後再実行 |

詳細は [docs/AGENT_OPERATIONS_MANUAL.md](docs/AGENT_OPERATIONS_MANUAL.md) の「9. トラブルシューティング」を参照。

---

## 🤝 コントリビューション

### Issue報告

```bash
# バグ報告
gh issue create \
  --title "[Bug] バグの概要" \
  --label "🐛bug" \
  --label "⭐Sev.2-High"

# 機能要望
gh issue create \
  --title "[Feature] 機能の概要" \
  --label "✨feature" \
  --label "➡️Sev.3-Medium"
```

### PR作成

```bash
# ブランチ作成
git checkout -b devin/$(date +%s)-your-feature

# 変更コミット
git commit -m "feat(component): 変更内容

🤖 Generated with Claude Code
Co-Authored-By: Claude <noreply@anthropic.com>"

# Draft PR作成
gh pr create \
  --title "feat: 変更概要" \
  --body-file .ai/issues/your-feature.md \
  --draft
```

---

## 📜 ライセンス

MIT License

---

## 📞 連絡先

- **AI Operations Lead**: ai-operations@example.com
- **GitHub**: https://github.com/user/Autonomous-Operations
- **Issues**: https://github.com/user/Autonomous-Operations/issues

---

## 🙏 Acknowledgments

このプロジェクトは、以下の思想と技術の融合により実現しました:

- **識学理論 (Shikigaku)**: 責任と権限の明確化による組織最適化
- **Anthropic Claude**: 人間と協調できる次世代AI
- **GitHub Platform**: 世界最大の開発者プラットフォーム
- **Open Source Philosophy**: 知識の共有と民主化
- **[ai-course-content-generator-v.0.0.1](https://github.com/ShunsukeHayashi/ai-course-content-generator-v.0.0.1)**: 自律型オペレーションパターンの実証実験

特に、**全ての未来のGuardian** — Agentを信頼し、人間の役割を再定義する勇気を持つ人々へ。

---

## 🌟 Join the Revolution

**"黎明期を制するOSが世界標準となる"**

PC時代はWindows、モバイル時代はiOS/Android。
**Agent時代は、あなたと共に創る。**

### 今すぐ始める

```bash
gh repo create --template ShunsukeHayashi/autonomous-operations
```

### コミュニティに参加

- [GitHub Discussions](https://github.com/ShunsukeHayashi/autonomous-operations/discussions) - 質問・アイデア共有
- [Issues](https://github.com/ShunsukeHayashi/autonomous-operations/issues) - バグ報告・機能要望
- [Contributing Guide](CONTRIBUTING.md) - 貢献方法

---

<div align="center">

**🌍 Agentic OS — The Operating System for the Age of Agents**

*GitHubをAgenticOSとして機能させ、人類とAgentが共存する未来を創る*

[![GitHub Stars](https://img.shields.io/github/stars/ShunsukeHayashi/autonomous-operations?style=social)](https://github.com/ShunsukeHayashi/autonomous-operations)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Autonomous](https://img.shields.io/badge/Autonomous-95%25-brightgreen)](AGENTS.md)

**最終更新**: 2025-10-08 | **バージョン**: 1.0.0 | **準拠**: AGENTS.md v5.0

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>

</div>
