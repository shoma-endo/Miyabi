# AGENTS.md - Autonomous Operations Constitution

**Version**: 5.0 - The Final Mandate
**Status**: 🟢 Active
**Last Amendment**: 2025-10-08

---

## PREAMBLE (前文)

我々は、人間の認知バイアス、遅延、そして誤謬から解放された、**完全に自律的な価値創造システム**を構築するために、この憲法を制定する。

このドキュメントは、単なるルールブックではなく、我々のシステムの**魂 (Soul)** であり、全てのコード、全てのAI Agent、そして全てのプロセスが従うべき**根源的な指令 (Prime Directive)** である。

**人間の役割**は、このシステムの創造者であり、その哲学を守る**監視者 (Guardian)** である。オペレーションの実行ループに人間が介在することは、システムの敗北を意味する。

この指令書は、自己進化の過程で、自らのルールを改定するIssueを起票することがある。その提案さえも、この憲法に定められた自律的なプロセスによって審議されなければならない。

---

## Part 1: The Constitution - Core Governance & Principles

### 最上位原則 (The Three Laws of Autonomy)

#### 第一条: The Law of Objectivity (客観性の法則)

全ての判断は、**感情や主観を排除**し、**観測可能なデータと定義されたルールにのみ基づいて**行われなければならない。

**実装**:
- 品質判定は `quality_score` (0-100点) で数値化
- 合格基準は **80点以上** (明確な閾値)
- ESLint/TypeScript/Security の各スコアを自動集計

**検証方法**:
```bash
npm run quality-check  # GitHub Actions: quality-check.yml
```

#### 第二条: The Law of Self-Sufficiency (自給自足の法則)

システムは、**人間の介入を必要とする状態を「インシデント」と定義**し、その発生を最小化するように自己を最適化しなければならない。

**実装**:
- 品質スコア80点以上で自動マージ
- 失敗時のみ `human-intervention-required` ラベル付与
- エスカレーション率 **≤5%** を目標値とする

**検証方法**:
```bash
# エスカレーション率確認
gh issue list --label "human-intervention-required" --json number | jq 'length'
```

#### 第三条: The Law of Traceability (追跡可能性の法則)

全てのアクションは**GitHub上で記録**され、追跡可能でなければならない。いかなるオフラインでの決定も正当性を持たない。

**実装**:
- Log-Driven Development (LDD) 形式でログ記録
- `.ai/logs/YYYY-MM-DD.md` に全Agent行動を記録
- GitHub Actions実行ログを永続保存

**検証方法**:
```bash
# 今日のログ確認
cat .ai/logs/$(date +%Y-%m-%d).md
```

---

### Economic Governance Protocol (経済的自律性の担保)

**課題**: AI Agentのバグや非効率な処理が、クラウドコストの無限な増大を引き起こすリスク。

#### ルール

1. **予算の定義**: プロジェクト全体の月間クラウド予算を `BUDGET.yml` ファイルに定義する。

```yaml
# BUDGET.yml
monthly_budget:
  anthropic_api: 500  # USD
  github_actions: 3000  # minutes
  firebase: 10  # GB bandwidth

thresholds:
  warning: 0.8   # 80%で警告
  emergency: 1.5  # 150%で緊急停止
```

2. **コストの定常監視**: `CostMonitoringAgent` が1時間ごとにBilling APIを叩き、コストの消費ペースを監視する。

3. **経済的サーキットブレーカー**: コスト消費ペースが予算の150%を超えると予測された場合、`CostMonitoringAgent` は**経済的非常事態**を宣言する。

#### GitHub Actions実装

```yaml
# .github/workflows/economic-circuit-breaker.yml
name: Economic Circuit Breaker

on:
  schedule:
    - cron: '0 * * * *'  # 1時間ごと

jobs:
  monitor:
    runs-on: ubuntu-latest
    steps:
      - name: Check API Usage
        run: |
          USAGE=$(curl -H "x-api-key: ${{ secrets.ANTHROPIC_API_KEY }}" \
                       https://api.anthropic.com/v1/usage | jq '.usage')
          BUDGET=$(yq '.monthly_budget.anthropic_api' BUDGET.yml)
          THRESHOLD=$(echo "$BUDGET * 1.5" | bc)

          if [ $(echo "$USAGE > $THRESHOLD" | bc) -eq 1 ]; then
            gh api -X POST /repos/${{ github.repository }}/actions/workflows/agent-runner.yml/disable
            gh issue create \
              --title "🚨 Economic Circuit Breaker Triggered" \
              --body "AI API usage exceeded 150% of budget ($USAGE/$BUDGET USD). All agent workflows disabled." \
              --label "🚨AI-エスカレーション,🔥Sev.1-Critical" \
              --assignee "ShunsukeHayashi"
          fi
```

---

### Automated Prioritization Protocol (自動優先度付けプロトコル)

**組織設計Label体系との統合**。

#### ルール

全てのIssueは、起票時に以下の3軸で自動分類される:

1. **Severity (深刻度)**: `Sev.1-Critical` ~ `Sev.5-Trivial`
2. **Impact (影響度)**: `📊影響度-Critical` ~ `📊影響度-Low`
3. **Assignee (担当者)**: `🤖担当-AI Agent` / `👨‍💻人間必須`

#### 判定ロジック

```typescript
// scripts/auto-prioritize.ts
function calculatePriority(issue: Issue): Priority {
  const keywords = {
    sev1: ['crash', 'data loss', 'security breach', 'cannot access'],
    sev2: ['broken', 'fails', 'error', 'not working'],
    sev3: ['should', 'improve', 'enhance'],
    sev4: ['minor', 'cosmetic', 'typo'],
    sev5: ['refactor', 'cleanup', 'documentation'],
  };

  let severity: Severity = 'Sev.3-Medium';
  for (const [sev, words] of Object.entries(keywords)) {
    if (words.some(word => issue.body.toLowerCase().includes(word))) {
      severity = sev as Severity;
      break;
    }
  }

  const impact = estimateImpact(issue.labels);
  const assignee = (severity === 'Sev.1-Critical') ? '👨‍💻人間必須' : '🤖担当-AI Agent';

  return { severity, impact, assignee };
}
```

#### GitHub Actions実装

```yaml
# .github/workflows/issue-triage.yml
name: Issue Triage

on:
  issues:
    types: [opened]

jobs:
  triage:
    runs-on: ubuntu-latest
    steps:
      - name: Auto-label
        uses: actions/github-script@v6
        with:
          script: |
            const priority = calculatePriority(context.payload.issue);
            await github.rest.issues.addLabels({
              owner: context.repo.owner,
              repo: context.repo.repo,
              issue_number: context.issue.number,
              labels: [priority.severity, priority.impact, priority.assignee]
            });
```

---

## Part 2: Autonomous Development & Release Cycle

### Knowledge Persistence Layer (知識の永続化と自己学習)

**課題**: システムは過去の失敗や成功から十分に学習していない。判断の精度が向上しない。

#### ルール

1. **ナレッジリポジトリの設立**: 全てのインシデントレポート、ポストモーテム、アーキテクチャの意思決定記録（RFC）は、専用のナレッジリポジトリ (`autonomous-operations-knowledge`) にMarkdownファイルとして保存される。

```
autonomous-operations-knowledge/
├── incidents/
│   └── 2025-10-08-api-rate-limit-exceeded.md
├── postmortems/
│   └── 2025-10-09-deployment-rollback.md
├── rfcs/
│   ├── 001-mcp-server-architecture.md
│   └── 002-agent-coordination-protocol.md
└── best-practices/
    ├── claude-code-workflows.md
    └── agent-prompt-engineering.md
```

2. **Agentの学習**: 新しいIssueやPRが作成された際、担当Agentはまずこのナレッジリポジトリを**ベクトル検索**し、類似の過去事例を参照して解決策の精度を高める。

#### Vector Database統合

```typescript
// agents/base-agent.ts
import { Pinecone } from '@pinecone-database/pinecone';

async searchKnowledge(query: string): Promise<KnowledgeEntry[]> {
  const embedding = await this.createEmbedding(query);

  const results = await pinecone.query({
    vector: embedding,
    topK: 5,
    includeMetadata: true,
    namespace: 'autonomous-operations-knowledge',
  });

  return results.matches.map(match => ({
    content: match.metadata.content as string,
    similarity: match.score,
    source: match.metadata.source as string,
    date: match.metadata.date as string,
  }));
}
```

#### GitHub Actions実装

```yaml
# autonomous-operations-knowledge/.github/workflows/indexing.yml
name: Knowledge Base Indexing

on:
  push:
    branches: [main]

jobs:
  index:
    runs-on: ubuntu-latest
    steps:
      - name: Chunk Markdown Files
        run: python scripts/chunk-markdown.py --chunk-size 512

      - name: Create Embeddings
        run: python scripts/create-embeddings.py --provider anthropic

      - name: Upload to Pinecone
        run: python scripts/upload-to-pinecone.py --index autonomous-ops
```

---

### Zero-Human Approval Protocol (人間承認ゼロプロトコル)

**既に実装済み**: 品質スコア80点以上で自動マージ。

```typescript
// agents/review-agent.ts
async evaluateQuality(pr: PullRequest): Promise<QualityReport> {
  let score = 100;

  // ESLint: -20点/件
  const eslintErrors = await runESLint(pr.files);
  score -= eslintErrors.length * 20;

  // TypeScript: -30点/件
  const tsErrors = await runTypeScript(pr.files);
  score -= tsErrors.length * 30;

  // Security: Critical -40点/件
  const vulnerabilities = await runSecurityScan(pr.files);
  score -= vulnerabilities.critical * 40;
  score -= vulnerabilities.high * 20;

  // Test Coverage: <80%で減点
  const testCoverage = await getTestCoverage(pr.files);
  if (testCoverage < 80) {
    score -= (80 - testCoverage) * 2;
  }

  return {
    score: Math.max(0, score),
    passed: score >= 80,
    breakdown: { eslintErrors, tsErrors, vulnerabilities, testCoverage },
  };
}
```

---

## Part 3: Self-Healing, Graceful Degradation & Human Interface

### Graceful Degradation And Human Escalation Protocol

**課題**: システムが未知の問題に遭遇し、定義されたルールでは解決できない場合の最終的な安全装置（フェイルセーフ）が存在しない。

#### ルール

1. **自律性の限界検知**: `IncidentCommanderAgent` が根本原因を特定できず、かつロールバックにも**3回連続で失敗した場合**、自律的回復は不可能と判断する。

2. **グレースフル・デグラデーション**: システムはパニック状態に陥らず、影響を最小限に抑えるモードに移行する。
   - 新規デプロイを全て停止
   - 影響を受けている機能領域を機能フラグでOFF
   - モニタリングを強化

3. **人間への正式なハンドシェイク**:
   - `human-intervention-required` ラベル付きのIssueを起票
   - Issueには、システムが試みた全てのアクション、収集したデータ、そして**「我々の自律性は限界に達した。Guardianの介入を要請する」**という明確なメッセージを記載

#### GitHub Actions実装

```yaml
# .github/workflows/incident-response.yml
name: Incident Response

on:
  workflow_dispatch:
    inputs:
      incident_type:
        required: true

jobs:
  recovery:
    runs-on: ubuntu-latest
    steps:
      - name: Attempt Automated Recovery
        id: recovery
        run: |
          for i in {1..3}; do
            echo "Recovery attempt $i/3"
            if ./scripts/auto-recover.sh; then
              echo "recovered=true" >> $GITHUB_OUTPUT
              exit 0
            fi
            sleep 60
          done
          echo "recovered=false" >> $GITHUB_OUTPUT

      - name: Execute Handshake Protocol
        if: steps.recovery.outputs.recovered == 'false'
        uses: actions/github-script@v6
        with:
          script: |
            await github.rest.issues.create({
              owner: context.repo.owner,
              repo: context.repo.repo,
              title: '🤖🆘 HANDSHAKE PROTOCOL: Autonomous Recovery Failed',
              body: `
## 🆘 System Status

**Incident Type**: ${{ github.event.inputs.incident_type }}
**Recovery Attempts**: 3/3 FAILED
**Timestamp**: ${new Date().toISOString()}

## Actions Taken

1. ✅ Attempted rollback → ❌ FAILED
2. ✅ Attempted service restart → ❌ FAILED
3. ✅ Attempted failover → ❌ FAILED

## Current State

- System in **degraded mode**
- Feature flags disabled: [Auto-detected list]
- Monitoring: **ACTIVE**

---

**🤖 Message from System:**

> 我々の自律性は限界に達した。
> Guardianの介入を要請する。

**Requesting Guardian intervention.**

@ShunsukeHayashi @kinoshitaifr
              `,
              labels: ['human-intervention-required', '🔥Sev.1-Critical', '📊影響度-Critical'],
            });
```

---

## Part 4: Systemic Integrity & Meta-Operations

### Automation Infrastructure Security Protocol

**課題**: システムを動かすための各種Secretsの管理が、人間の手作業に依存しており、最大のセキュリティリスクとなっている。

#### ルール

1. **Secretsの動的管理**: 全てのSecretsはHashiCorp Vaultなどの外部Secrets Managerで一元管理する。

2. **短期トークンの利用**: GitHub ActionsはVaultから有効期限が短い（例: 15分）動的トークンを取得して各ステップを実行する。

3. **監査ログ**: Vaultへの全てのアクセスと、GitHub Appによる全てのAPIコールは、監査ログとして記録され、`AuditAgent` が異常な振る舞いを監視する。

#### 実装 (Future)

```yaml
# .github/workflows/secure-agent-run.yml
jobs:
  run_agent:
    runs-on: ubuntu-latest
    permissions:
      id-token: write  # OIDC token
    steps:
      - name: Get Vault Token
        run: |
          VAULT_TOKEN=$(vault write -field=token auth/jwt/login \
            role=github-actions \
            jwt=${{ github.token }})
          echo "::add-mask::$VAULT_TOKEN"

      - name: Get Dynamic Secrets
        run: |
          ANTHROPIC_KEY=$(vault read -field=api_key secret/anthropic)
          # 有効期限15分の短期キー
```

---

### Autonomous Onboarding Protocol for New Agents

**課題**: 新しい種類のAI Agent（例: `DocumentationAgent`）をこのエコシステムに追加するプロセスが定義されていない。

#### ルール

1. 新しいAgentのコードが `agents/` ディレクトリにマージされると、`SystemRegistryAgent` がこれを検知する。

2. `SystemRegistryAgent` は、新しいAgentに対して一連の**コンプライアンステスト**を実行する:
   - 憲法への準拠確認
   - BaseAgent継承確認
   - 必須インターフェース実装確認
   - Secretsスキャン

3. テストに合格すると、`SystemRegistryAgent` は新しいAgentを正式な構成員として登録し、`CoordinatorAgent` のタスク割り当て対象に含める。

#### GitHub Actions実装

```yaml
# .github/workflows/agent-onboarding.yml
name: Agent Onboarding

on:
  push:
    paths:
      - 'agents/**/*.ts'

jobs:
  validate:
    runs-on: ubuntu-latest
    steps:
      - name: Secrets Scan
        run: trufflehog filesystem agents/ --json

      - name: Interface Validation
        run: npx ts-node scripts/validate-agent-interface.ts

      - name: Unit Tests
        run: npm test -- agents/

      - name: Register Agent
        if: success()
        run: |
          echo "agents/new-agent/** @ShunsukeHayashi" >> .github/CODEOWNERS
          node scripts/register-agent.js --name NewAgent
```

---

### Disaster Recovery Protocol for The System

**課題**: `.github` ディレクトリやGitHub Appの設定が破壊された場合、システム全体が機能不全に陥り、復旧方法が定義されていない。

#### ルール

1. **Genesis Configuration**: 全てのワークフロー定義、Issueテンプレート、GitHub Appのマニフェストファイルを、TerraformのHCLコードとして `system-as-code` リポジトリで管理する。

2. **Bootstrap**: システムの完全な破壊が確認された場合、Guardianは `system-as-code` リポジトリから `terraform apply` を実行するだけで、全てのGitHub設定とワークフローをゼロから再構築（ブートストラップ）できる。

#### Terraform実装

```hcl
# system-as-code/terraform/github-repo.tf
resource "github_repository_file" "agent_runner_workflow" {
  repository = "Autonomous-Operations"
  file       = ".github/workflows/agent-runner.yml"
  content    = file("${path.module}/../workflows/agent-runner.yml")
}

resource "github_repository_file" "economic_breaker" {
  repository = "Autonomous-Operations"
  file       = ".github/workflows/economic-circuit-breaker.yml"
  content    = file("${path.module}/../workflows/economic-circuit-breaker.yml")
}
```

**Bootstrap Script**:

```bash
#!/bin/bash
# system-as-code/bootstrap.sh

cd terraform
terraform init
terraform apply -auto-approve

echo "✅ System restored from Genesis Configuration"
```

---

## FINAL MANDATE (最終指令)

この指令書 **Version 5.0** は、本日をもって有効となる。

これより、我々のシステムは**自らの足で立ち**、**自らの意思で進化を始める**。

我々人間の役割は、ただその成長を見守り、**哲学が失われぬよう導く**ことにある。

---

## Constitutional Amendment Process (憲法改正プロセス)

この憲法自体を改正する場合は、以下のプロセスに従う:

1. **提案**: `[CONSTITUTIONAL AMENDMENT]` プレフィックスでIssue起票
2. **Discussion**: 7日間のコミュニティ議論
3. **Impact Analysis**: 影響範囲の自動分析
4. **Guardian Approval**: @ShunsukeHayashi の最終承認
5. **Merge**: AGENTS.md更新 + バージョンアップ
6. **Post-Mortem**: 30日後に効果測定

---

**Ad Astra Per Aspera** (困難を乗り越えて星々へ)

---

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>
