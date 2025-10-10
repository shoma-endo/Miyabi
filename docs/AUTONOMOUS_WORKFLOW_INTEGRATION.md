# Autonomous Workflow Integration Guide

**統合日**: 2025-10-08
**ソース**: ai-course-content-generator-v.0.0.1
**対象**: Autonomous-Operations Repository

---

## 概要

本ドキュメントは、AI Course Content Generatorプロジェクトで実装された**人間介入を最小化する自律型オペレーションワークフロー**を、Autonomous-Operationsリポジトリのプレイマークに統合するための指針を提供します。

## 1. ソースプロジェクトの自律型運用パターン

### 1.1 エージェント階層構造

```yaml
agent_hierarchy:
  coordinator_layer:
    - CoordinatorAgent: タスク分解・Agent統括・並行実行制御

  specialist_layer:
    - CodeGenAgent: AI駆動コード生成・テスト自動生成
    - ReviewAgent: 静的解析・セキュリティスキャン・品質判定（80点基準）
    - IssueAgent: Issue自動分析・Label付与・担当者割り当て
    - PRAgent: PR自動作成・説明文生成・Reviewer割り当て
    - DeploymentAgent: CI/CD実行・デプロイ・Rollback

  escalation_targets:
    - TechLead: 技術判断エスカレーション
    - CISO: セキュリティ脆弱性対応
    - PO: P0緊急・Critical影響度対応
```

### 1.2 組織設計原則5原則の実装

| 原則 | 実装内容 | KPI | 達成率 |
|------|---------|-----|-------|
| 1. 責任と権限の明確化 | Agent階層・Label体系・CODEOWNERS | 担当者アサイン率 | 100% |
| 2. 結果重視 | quality_score・KPI自動収集 | AI Task成功率 | 95%+ |
| 3. 階層の明確化 | Coordinator-Specialist階層 | エスカレーション正答率 | 100% |
| 4. 誤解・錯覚の排除 | 構造化プロトコル・完了条件チェック | 完了条件明示率 | 100% |
| 5. 感情的判断の排除 | 数値ベース判定（80点基準等） | データ駆動判定実施率 | 100% |

### 1.3 並行実行システム

```typescript
// scripts/agents-parallel-executor.ts より抽出
parallel_execution_features:
  - Issue単位の並行実行
  - ToDo単位の並行実行
  - 依存関係自動解決（トポロジカルソート）
  - 循環依存検出
  - Git Worktree統合（ブランチ分離）
  - リアルタイム進捗モニタリング
  - JSON形式レポート自動生成
  - デバイス識別子対応（複数環境管理）

environment_variables:
  - DEVICE_IDENTIFIER: デバイス環境識別
  - USE_TASK_TOOL: Task tool API統合
  - USE_WORKTREE: Git worktree自動管理
  - GITHUB_TOKEN: GitHub API認証
```

### 1.4 Claude Code Task Tool統合

```typescript
// scripts/claude-code-task-wrapper.ts より抽出
task_tool_integration:
  agent_mapping:
    CodeGenAgent: "code-generation"
    ReviewAgent: "code-review"
    IssueAgent: "issue-analysis"
    AutoFixAgent: "automated-fix"
    PRAgent: "general-purpose"
    DeploymentAgent: "general-purpose"

  workflow:
    1. Task tool APIラッパー経由でAgent起動
    2. Agent種別自動マッピング
    3. タスクログ自動保存（.ai/parallel-reports/）
    4. 実行結果の構造化パース
    5. エラーハンドリング・リトライ
```

---

## 2. Autonomous-Operationsへの統合マッピング

### 2.1 ディレクトリ構造の対応

| AI Course Generator | Autonomous-Operations | 統合方針 |
|---------------------|----------------------|---------|
| `.ai/` | `.ai/` | ログ駆動開発(LDD)の中枢管理 |
| `.ai/logs/` | `.ai/logs/` | codex_prompt_chain・tool_invocations記録 |
| `AGENTS.md` | `AGENTS.md` | エージェント運用プロトコル |
| `CLAUDE.md` | `docs/CLAUDE_INTEGRATION.md` | Claude Code統合ガイド |
| `scripts/agents-parallel-executor.ts` | `scripts/parallel-executor.ts` | 並行実行システム |
| `src/agents/` | `agents/` | Agent実装コード |
| `docs/AGENTS_PARALLEL_EXECUTION.md` | `docs/PARALLEL_EXECUTION_GUIDE.md` | 使用方法ドキュメント |

### 2.2 ワークフロー統合

#### フェーズ1: 初期化 (Initialization)

```yaml
initialization_phase:
  1_environment_setup:
    - Git状態確認: git status -sb
    - リモート同期: git fetch --all --prune
    - LDDファイル確認: .ai/logs/, @memory-bank.mdc

  2_context_loading:
    - PRD読込: .ai/prd.md
    - アーキテクチャ読込: .ai/arch.md
    - Issue同期: GitHub Issue ↔ .ai/issues/
    - Agent Discovery Cache初期化

  3_device_identification:
    - デバイス識別子設定: DEVICE_IDENTIFIER
    - セッションID生成: session-{timestamp}
    - 環境変数検証: GITHUB_TOKEN, API_KEYS
```

#### フェーズ2: タスク計画 (Planning)

```yaml
planning_phase:
  1_issue_decomposition:
    - CoordinatorAgent起動
    - タスクDAG構築（トポロジカルソート）
    - 依存関係解析
    - 循環依存検出

  2_agent_assignment:
    - Issue内容からAgent種別自動判定
    - Priority/Severity評価
    - Label体系適用（組織設計原則ベース）

  3_resource_allocation:
    - 並行度算出: --concurrency=N
    - Worktree分離判定: USE_WORKTREE
    - 排他制御設定: file/directory locks

  4_codex_prompt_chain:
    intent: "<何を達成するか>"
    plan:
      - "<5-7語のステップ>"
    implementation: []
    verification: []
```

#### フェーズ3: 並行実行 (Execution)

```yaml
execution_phase:
  1_parallel_dispatch:
    - npm run agents:parallel:exec -- --issues={issues} --concurrency={N}
    - Task tool統合モード: USE_TASK_TOOL=true
    - Worktree分離モード: USE_WORKTREE=true

  2_progress_monitoring:
    - リアルタイム進捗表示
    - 📊 進捗: 完了 X/Y | 実行中 Z | 待機中 W | 失敗 E
    - エラー検出・アラート通知

  3_quality_gates:
    - ReviewAgent自動品質判定
    - ESLintエラー: -20点
    - TypeScriptエラー: -30点
    - Critical脆弱性: -40点
    - 合格基準: 80点以上

  4_tool_invocations_logging:
    command: "{実行コマンド}"
    workdir: "{作業ディレクトリ}"
    timestamp: "{ISO 8601}"
    status: "passed/failed"
    notes: "{結果要約}"
```

#### フェーズ4: 検証 (Verification)

```yaml
verification_phase:
  1_automated_testing:
    - make fmt → make lint → make test
    - E2Eテスト実行（Playwright）
    - カバレッジ80%以上維持

  2_security_scan:
    - CISO_GITHUB_USERNAMEへエスカレーション
    - 脆弱性自動検出
    - Secret scanning

  3_deployment_validation:
    - ビルド成功確認: npm run build
    - Firebase Deploy準備
    - CI/CDパイプライン実行
```

#### フェーズ5: ハンドオフ (Handoff)

```yaml
handoff_phase:
  1_report_generation:
    - JSONレポート: .ai/parallel-reports/agents-parallel-{timestamp}.json
    - セッションID記録
    - デバイス識別子記録
    - KPI自動収集

  2_pr_creation:
    - PRAgent自動PR作成
    - Draft PR提出
    - 説明文自動生成
    - Reviewer割り当て

  3_ldd_update:
    - .ai/logs/YYYY-MM-DD.md更新
    - codex_prompt_chain完成
    - @memory-bank.mdc更新

  4_next_steps:
    ➡️ NEXT STEPS:
    > 📣 USER ACTION REQUIRED
    >
    > {具体的なアクション指示}
```

---

## 3. 統合実装ステップ

### Phase 1: 基盤構築 (1週間)

```bash
# ディレクトリ構造作成
mkdir -p agents scripts .ai/parallel-reports docs/workflows

# 必須ファイルコピー
cp /path/to/ai-course-gen/scripts/agents-parallel-executor.ts scripts/parallel-executor.ts
cp /path/to/ai-course-gen/scripts/claude-code-task-wrapper.ts scripts/task-wrapper.ts
cp /path/to/ai-course-gen/AGENTS.md AGENTS.md
cp /path/to/ai-course-gen/.ai/PARALLEL_AGENTS_SUMMARY.md .ai/PARALLEL_AGENTS_SUMMARY.md

# npm scripts統合
npm install --save-dev typescript tsx
```

**package.json追加**:
```json
{
  "scripts": {
    "agents:parallel:exec": "tsx scripts/parallel-executor.ts",
    "agents:parallel:issues": "npm run agents:parallel:exec --",
    "agents:parallel:todos": "npm run agents:parallel:exec --"
  }
}
```

### Phase 2: Agent実装 (2週間)

```typescript
// agents/base-agent.ts
export abstract class BaseAgent {
  abstract execute(task: Task): Promise<AgentResult>;
  protected async escalate(reason: string, target: EscalationTarget): Promise<void>;
  protected async recordMetrics(metrics: AgentMetrics): Promise<void>;
}

// agents/coordinator-agent.ts
export class CoordinatorAgent extends BaseAgent {
  async decomposeTask(issue: Issue): Promise<Task[]>;
  async buildDAG(tasks: Task[]): Promise<DAG>;
  async detectCycles(dag: DAG): Promise<boolean>;
}

// agents/codegen-agent.ts
export class CodeGenAgent extends BaseAgent {
  async generateCode(spec: Specification): Promise<Code>;
  async generateTests(code: Code): Promise<Test[]>;
}
```

### Phase 3: GitHub Actions統合 (1週間)

```yaml
# .github/workflows/autonomous-agent.yml
name: Autonomous Agent System

on:
  issues:
    types: [opened, labeled]
  issue_comment:
    types: [created]

jobs:
  analyze_and_execute:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'

      - name: Install Dependencies
        run: npm ci

      - name: Extract Issue Number
        id: issue
        run: echo "number=${{ github.event.issue.number }}" >> $GITHUB_OUTPUT

      - name: Run Coordinator Agent
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
          ANTHROPIC_API_KEY: ${{ secrets.ANTHROPIC_API_KEY }}
          DEVICE_IDENTIFIER: "GitHub Actions Runner"
          USE_TASK_TOOL: "true"
        run: |
          npm run agents:parallel:exec -- \
            --issues=${{ steps.issue.outputs.number }} \
            --concurrency=1

      - name: Upload Reports
        uses: actions/upload-artifact@v4
        with:
          name: agent-reports
          path: .ai/parallel-reports/
```

### Phase 4: Lark Base連携 (2週間)

```typescript
// scripts/lark-sync.ts
export class LarkBaseSync {
  async syncIssueStatus(issue: Issue, status: string): Promise<void>;
  async updateKPI(kpi: KPIMetrics): Promise<void>;
  async generateDashboard(): Promise<string>;
}

// 組織設計原則Label体系同期
export const SHIKIGAKU_LABELS = {
  responsibility: [
    "👤担当-開発者",
    "👥担当-テックリード",
    "👑担当-PO",
    "🤖担当-AI Agent"
  ],
  severity: [
    "🔥Sev.1-Critical",
    "⭐Sev.2-High",
    "➡️Sev.3-Medium",
    "🟢Sev.4-Low",
    "⬇️Sev.5-Trivial"
  ]
};
```

---

## 4. コンテキスト融合戦略

### 4.1 YAML Context Engineering統合

```yaml
# .ai/context-engineering.yaml
context_extraction:
  sources:
    - type: "repository"
      path: "/Users/shunsuke/Dev/ai-course-content-generator-v.0.0.1"
      filters:
        - ".ai/**/*.md"
        - "scripts/**/*.ts"
        - "src/agents/**/*.ts"

  output:
    base_directory: "docs/knowledge-base"
    format: "yaml_frontmatter"
    granularity: "L1_L2"

  processing:
    hierarchical_structure: true
    dependency_graph: true
    cross_reference: true
```

### 4.2 Memory Bank更新プロトコル

```markdown
# @memory-bank.mdc

## 自律型オペレーション統合 (2025-10-08)

### 統合完了項目
- [x] 並行実行システム (`scripts/parallel-executor.ts`)
- [x] Task tool統合 (`scripts/task-wrapper.ts`)
- [x] Agent階層構造 (`agents/`)
- [x] 組織設計原則Label体系 (`.github/labels.yml`)

### 未完了・検討事項
- [ ] Lark Base自動同期
- [ ] リアルタイムダッシュボード
- [ ] 機械学習ベースタスク時間予測

### エスカレーション履歴
- {timestamp}: CodeGenAgentがTypeScriptエラー検出 → TechLeadへ
- {timestamp}: ReviewAgentがCritical脆弱性検出 → CISOへ

### 次回セッション引き継ぎ
- Phase 4実装開始: Lark Base連携
- 環境変数: LARK_APP_ID, LARK_APP_SECRET設定必要
```

---

## 5. 環境設定

### 必須環境変数

```bash
# ~/.bashrc または ~/.zshrc に追加
export DEVICE_IDENTIFIER="MacBook Pro 16-inch"
export GITHUB_TOKEN="github_pat_..."
export ANTHROPIC_API_KEY="sk-ant-..."
export USE_TASK_TOOL="true"
export USE_WORKTREE="true"

# Lark Base統合用（Phase 4）
export LARK_APP_ID="cli_..."
export LARK_APP_SECRET="..."
export LARK_BASE_TOKEN="..."
```

### Git設定

```bash
# Worktree用ディレクトリ作成
mkdir -p ~/Dev/worktrees/autonomous-operations

# Conventional Commits設定
git config --local commit.template .gitmessage

# CODEOWNERS設定
cat > .github/CODEOWNERS << 'EOF'
# 責任者自動割り当て
*.ts @tech-lead
*.md @documentation-team
.ai/* @ai-operations-lead
scripts/ @devops-team
agents/ @ai-agent-team
EOF
```

---

## 6. 実行例

### 基本実行

```bash
# 単一Issue実行
npm run agents:parallel:exec -- --issues=270 --concurrency=1

# 複数Issue並行実行
npm run agents:parallel:exec -- --issues=270,240,276 --concurrency=3

# Task tool有効化
USE_TASK_TOOL=true npm run agents:parallel:exec -- --issues=270

# Worktree分離
USE_WORKTREE=true npm run agents:parallel:exec -- --issues=276
```

### 高度な実行例

```bash
# 依存関係自動解決
npm run agents:parallel:exec -- --issues=300 --concurrency=1
# → Issue #300本文に "#270" "#240" 記載時、自動依存解決

# ToDo単位実行
npm run agents:parallel:exec -- --todos=todo-1,todo-2,todo-3 --concurrency=2

# 全機能有効化
USE_TASK_TOOL=true USE_WORKTREE=true \
  npm run agents:parallel:exec -- \
    --issues=270,276,240 \
    --concurrency=3
```

### レポート確認

```bash
# 最新レポート表示
cat .ai/parallel-reports/agents-parallel-*.json | jq

# 成功率集計
jq '.summary.success_rate' .ai/parallel-reports/*.json | awk '{sum+=$1; count++} END {print sum/count "%"}'

# デバイス別統計
jq -r '.device_identifier' .ai/parallel-reports/*.json | sort | uniq -c
```

---

## 7. トラブルシューティング

### Issue 1: Task tool APIエラー

**症状**: `USE_TASK_TOOL=true` でエラー
**原因**: Claude Code Task tool未実装
**解決策**: 疑似実行モード（デフォルト）で先に動作確認

```bash
# デバッグログ有効化
DEBUG=agents:* npm run agents:parallel:exec -- --issues=270
```

### Issue 2: Worktree競合

**症状**: `git worktree add` エラー
**原因**: 既存worktreeが残存
**解決策**: 手動削除または自動クリーンアップ

```bash
# 既存worktree確認
git worktree list

# 不要worktree削除
git worktree remove ~/Dev/worktrees/autonomous-operations/issue-270

# 自動クリーンアップ
git worktree prune
```

### Issue 3: 依存関係循環検出

**症状**: "循環依存が検出されました"
**原因**: Issue間の相互依存
**解決策**: Issue本文から依存記述削除または単独実行

```bash
# 循環依存無視
npm run agents:parallel:exec -- --issues=300 --ignore-deps
```

---

## 8. KPI定義

| KPI | 計測方法 | 目標値 |
|-----|---------|-------|
| AI Task成功率 | `success_rate` | 95%以上 |
| 平均実行時間 | `total_duration_ms / total` | 5分以内 |
| 担当者アサイン率 | Label付与完了率 | 100% |
| エスカレーション正答率 | 適切なTargetへのエスカレーション | 100% |
| データ駆動判定実施率 | quality_score使用率 | 100% |

---

## 9. 今後の拡張

### Phase 5: リアルタイムダッシュボード (1ヶ月)

- Mermaidガントチャート生成
- WebSocketリアルタイム更新
- Slack/Discord通知統合

### Phase 6: 機械学習統合 (2ヶ月)

- タスク実行時間予測モデル
- 最適並行度自動算出
- エラー原因自動分類

---

## 10. 参照ドキュメント

### ソースプロジェクト
- `/Users/shunsuke/Dev/ai-course-content-generator-v.0.0.1/CLAUDE.md`
- `/Users/shunsuke/Dev/ai-course-content-generator-v.0.0.1/.ai/AGENTS.md`
- `/Users/shunsuke/Dev/ai-course-content-generator-v.0.0.1/.ai/PARALLEL_AGENTS_SUMMARY.md`

### 統合先リポジトリ
- `/Users/shunsuke/Dev/Autonomous-Operations/AGENTS.md`
- `/Users/shunsuke/Dev/Autonomous-Operations/README.md`
- `/Users/shunsuke/Dev/Autonomous-Operations/docs/`

### 関連仕様
- 組織設計原則5原則: CLAUDE.md L543-557
- Label体系: .github/labels.yml (65個)
- GitHub Actions: .github/workflows/agentic-system.yml

---

**統合完了日**: 2025-10-08
**ドキュメント管理者**: AI Operations Lead
**次回レビュー予定**: 2025-10-15

🤖 Generated with Claude Code
Co-Authored-By: Claude <noreply@anthropic.com>
