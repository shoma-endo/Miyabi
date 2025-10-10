---
description: 特定のMiyabi Agentを実行
---

# Miyabi Agent実行

CoordinatorAgent、CodeGenAgent、ReviewAgent、IssueAgent、PRAgent、DeploymentAgent、TestAgentなど、特定のAgentを個別に実行します。

## MCPツール

### `miyabi__agent`
指定したAgentを実行

**パラメータ**:
- `agent`: Agent名（coordinator/codegen/review/issue/pr/deployment/test）
- `target`: 対象リソース（Issue番号、PR番号、ファイルパスなど）
- `options`: Agent固有のオプション（JSON形式）

**使用例**:
```
CoordinatorAgentでIssue分析:
miyabi__agent({ agent: "coordinator", target: "123" })

CodeGenAgentでコード生成:
miyabi__agent({ agent: "codegen", target: "123", options: { language: "typescript" } })

ReviewAgentでPRレビュー:
miyabi__agent({ agent: "review", target: "pr-456" })

IssueAgentでラベル付与:
miyabi__agent({ agent: "issue", target: "123" })

PRAgentでDraft PR作成:
miyabi__agent({ agent: "pr", target: "123" })

DeploymentAgentでデプロイ:
miyabi__agent({ agent: "deployment", target: "staging" })

TestAgentでテスト実行:
miyabi__agent({ agent: "test", target: "./src" })
```

## 動作フロー

```
Agent起動
    ↓
対象リソース取得（Issue/PR/ファイル）
    ↓
Agent固有処理実行
    ↓
├─ CoordinatorAgent: タスク分解・DAG生成
├─ CodeGenAgent: Claude APIでコード生成
├─ ReviewAgent: 品質スコア算出・レビュー
├─ IssueAgent: ラベル付与・優先度判定
├─ PRAgent: Draft PR作成・テンプレート適用
├─ DeploymentAgent: デプロイ実行・ヘルスチェック
└─ TestAgent: Vitest実行・カバレッジレポート
    ↓
結果をGitHub/Projectsに反映
    ↓
実行ログ・メトリクス記録
```

## Agent一覧

### 1. CoordinatorAgent（統括Agent）

**役割**: タスクの分析・分解・優先順位付け

**対象**: Issue番号

**実行内容**:
- Issueの複雑度分析
- サブタスクへの分解（DAG生成）
- 必要なAgent決定
- 実行計画作成

**出力**:
- タスクDAG（JSON形式）
- 優先度付きサブタスク
- 推定工数・リスク評価

### 2. CodeGenAgent（コード生成Agent）

**役割**: Claude APIを使ったコード自動生成

**対象**: Issue番号またはタスク記述

**実行内容**:
- Issue内容の解析
- コード生成（TypeScript/JavaScript/Python等）
- ユニットテスト生成
- ドキュメントコメント付与

**出力**:
- 生成コード（ファイル）
- テストコード
- 実装レポート

### 3. ReviewAgent（レビューAgent）

**役割**: コード品質チェック・レビュー

**対象**: PR番号またはファイルパス

**実行内容**:
- 静的解析（ESLint/Prettier）
- 品質スコア算出（/100点）
- セキュリティチェック
- ベストプラクティス検証

**出力**:
- 品質スコア
- 改善提案リスト
- レビューコメント

### 4. IssueAgent（Issue管理Agent）

**役割**: Issue分析・ラベル付与

**対象**: Issue番号

**実行内容**:
- Issueタイプ判定（feature/bug/refactor等）
- 緊急度・規模の判定
- 識学理論65ラベル付与
- 担当者自動割当（オプション）

**出力**:
- 付与されたLabel一覧
- 優先度評価
- 推奨アクション

### 5. PRAgent（Pull Request Agent）

**役割**: Draft PR自動作成

**対象**: Issue番号またはブランチ名

**実行内容**:
- Draft PR作成
- テンプレート適用
- Issueとのリンク
- レビュアー割当

**出力**:
- PR番号
- PR URL
- 作成されたブランチ名

### 6. DeploymentAgent（デプロイAgent）

**役割**: 環境へのデプロイ実行

**対象**: 環境名（staging/production）

**実行内容**:
- ビルド実行
- デプロイ実行（Firebase/Vercel/AWS等）
- ヘルスチェック
- ロールバック対応

**出力**:
- デプロイURL
- ヘルスチェック結果
- デプロイログ

### 7. TestAgent（テストAgent）

**役割**: テスト実行・カバレッジ測定

**対象**: ファイルパスまたは"all"

**実行内容**:
- Vitest実行
- カバレッジ測定
- テスト結果レポート
- 失敗テストの詳細分析

**出力**:
- テスト結果サマリー
- カバレッジレポート
- 失敗テスト詳細

## コマンドライン実行

MCPツールの代わりにコマンドラインでも実行可能:

```bash
# CoordinatorAgentでIssue分析
npx miyabi agent coordinator --target 123

# CodeGenAgentでコード生成
npx miyabi agent codegen --target 123 --language typescript

# ReviewAgentでPRレビュー
npx miyabi agent review --target pr-456

# IssueAgentでラベル付与
npx miyabi agent issue --target 123

# PRAgentでDraft PR作成
npx miyabi agent pr --target 123

# DeploymentAgentでデプロイ
npx miyabi agent deployment --target staging

# TestAgentでテスト実行
npx miyabi agent test --target ./src

# 複数Agent連鎖実行
npx miyabi agent coordinator --target 123 --chain codegen,review,pr
```

## 環境変数

`.env` ファイルに以下を設定:

```bash
GITHUB_TOKEN=ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
ANTHROPIC_API_KEY=sk-ant-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
REPOSITORY=owner/repo
DEVICE_IDENTIFIER=MacBook Pro 16-inch

# デプロイ用（DeploymentAgent）
FIREBASE_TOKEN=xxx
VERCEL_TOKEN=xxx
AWS_ACCESS_KEY_ID=xxx
AWS_SECRET_ACCESS_KEY=xxx
```

## Agent固有オプション

### CodeGenAgent

```bash
npx miyabi agent codegen --target 123 \
  --language typescript \
  --framework react \
  --test-framework vitest \
  --style-guide airbnb
```

### ReviewAgent

```bash
npx miyabi agent review --target pr-456 \
  --min-score 80 \
  --auto-comment true \
  --severity error,warning
```

### DeploymentAgent

```bash
npx miyabi agent deployment --target staging \
  --provider firebase \
  --health-check true \
  --rollback-on-failure true
```

### TestAgent

```bash
npx miyabi agent test --target ./src \
  --coverage true \
  --watch false \
  --reporter verbose
```

## 出力形式

### 成功時

```
✅ Agent実行完了: CodeGenAgent

対象: Issue #123
実行時間: 45秒

結果:
  ✓ コード生成: src/auth/mfa.ts
  ✓ テスト生成: src/auth/mfa.test.ts
  ✓ ドキュメント: src/auth/README.md

品質スコア: 92/100

次のアクション:
  1. npx miyabi agent review --target pr-456
  2. 人間レビュー実施
  3. マージ後デプロイ
```

### エラー時

```
❌ Agent実行失敗: DeploymentAgent

対象: production
実行時間: 12秒

エラー:
  Health check failed: 503 Service Unavailable

詳細:
  - Endpoint: https://api.example.com/health
  - Status: 503
  - Response: Database connection timeout

推奨アクション:
  1. データベース接続を確認
  2. npx miyabi agent deployment --target staging でテスト
  3. ロールバック: git revert HEAD
```

## Agent連鎖実行

複数のAgentを順次実行:

```bash
# Issue分析 → コード生成 → レビュー → PR作成
npx miyabi agent coordinator --target 123 --chain codegen,review,pr

# コード生成 → テスト → レビュー → デプロイ
npx miyabi agent codegen --target 123 --chain test,review,deployment
```

連鎖実行時のフロー:

```
CoordinatorAgent起動
    ↓
タスク分解完了
    ↓
CodeGenAgent起動（自動）
    ↓
コード生成完了
    ↓
ReviewAgent起動（自動）
    ↓
品質スコア: 85/100 ✅
    ↓
PRAgent起動（自動）
    ↓
Draft PR #456作成
    ↓
完了通知
```

## 使用例

### 例1: Issue自動処理（全Agent連鎖）

```
あなた: "Issue #123を全自動で処理して"

Claude: [miyabi__agent({ agent: "coordinator", target: "123", options: { chain: "codegen,test,review,pr" } }) を実行]

✅ CoordinatorAgent: タスク分解完了
  - サブタスク3件生成
  - 推定工数: 2時間

✅ CodeGenAgent: コード生成完了
  - src/auth/mfa.ts（152行）
  - src/auth/mfa.test.ts（86行）

✅ TestAgent: テスト実行
  - 全テストパス（12/12）
  - カバレッジ: 94%

✅ ReviewAgent: 品質チェック
  - 品質スコア: 88/100 ✅
  - 改善提案: 2件

✅ PRAgent: Draft PR作成
  - PR #456: https://github.com/owner/repo/pull/456
  - レビュアー: @team-backend

完了: Issue #123 → PR #456
```

### 例2: PRレビュー

```
あなた: "PR #456をレビューして"

Claude: [miyabi__agent({ agent: "review", target: "pr-456" }) を実行]

✅ ReviewAgent: PR #456レビュー完了

品質スコア: 82/100

評価詳細:
  ✓ コード品質: 85/100
  ✓ テストカバレッジ: 92%
  ✓ ドキュメント: 75/100
  ⚠ セキュリティ: 1件の警告

改善提案:
  1. [高] src/auth/mfa.ts:42 - ハードコードされたsecretを環境変数に移行
  2. [中] src/auth/mfa.test.ts - エッジケースのテスト追加
  3. [低] README.md - MFA設定手順を追記

推奨アクション:
  1. セキュリティ警告を修正
  2. 改善提案を反映
  3. 再レビュー依頼
```

### 例3: 環境へのデプロイ

```
あなた: "stagingにデプロイして"

Claude: [miyabi__agent({ agent: "deployment", target: "staging" }) を実行]

✅ DeploymentAgent: staging環境へのデプロイ完了

デプロイ情報:
  - 環境: staging
  - プロバイダー: Firebase Hosting
  - バージョン: v1.2.3-rc.1
  - デプロイ時刻: 2025-10-10 14:30:00

ヘルスチェック:
  ✓ API: 200 OK
  ✓ データベース: 接続成功
  ✓ 外部サービス: 正常

URL:
  - Web: https://staging.example.com
  - API: https://api-staging.example.com

次のアクション:
  1. 動作確認実施
  2. 問題なければproductionへデプロイ
  3. npx miyabi agent deployment --target production
```

## トラブルシューティング

### Agent起動失敗

```
❌ Error: Agent not found: codejen

解決策:
1. Agent名を確認（coordinator/codegen/review/issue/pr/deployment/test）
2. スペルミスがないか確認
```

### API呼び出し失敗

```
❌ Error: ANTHROPIC_API_KEY is required for CodeGenAgent

解決策:
1. .envファイルを確認
2. ANTHROPIC_API_KEY=sk-ant-... を追加
3. APIキーの権限を確認
```

### 対象リソースが見つからない

```
❌ Error: Issue #999 not found

解決策:
1. Issue番号を確認
2. gh issue view 999 で存在確認
3. リポジトリが正しいか確認
```

### 品質スコア不合格

```
⚠️  Quality score below threshold: 65/100 (required: 80)

確認:
1. ReviewAgentの改善提案を確認
2. コード品質を改善
3. 再度ReviewAgentを実行
```

## ベストプラクティス

### 🎯 推奨ワークフロー

**通常開発**:
```bash
# 1. Issue分析
npx miyabi agent coordinator --target 123

# 2. コード生成
npx miyabi agent codegen --target 123

# 3. テスト実行
npx miyabi agent test --target ./src

# 4. レビュー
npx miyabi agent review --target pr-456

# 5. マージ後デプロイ
npx miyabi agent deployment --target production
```

**緊急対応**:
```bash
# 全自動連鎖実行
npx miyabi agent coordinator --target 123 --chain codegen,test,review,pr,deployment
```

### ⚠️ 注意事項

- **API制限**: Claude API呼び出しには料金がかかります（CodeGenAgent）
- **品質基準**: ReviewAgentの最低スコアは80/100推奨
- **デプロイ**: production環境へのデプロイは慎重に実行
- **テスト**: 必ずTestAgentでテストパスを確認

### 📝 Agent選択ガイド

| 目的 | Agent | コマンド例 |
|-----|-------|-----------|
| Issue分析 | CoordinatorAgent | `npx miyabi agent coordinator --target 123` |
| コード生成 | CodeGenAgent | `npx miyabi agent codegen --target 123` |
| PRレビュー | ReviewAgent | `npx miyabi agent review --target pr-456` |
| ラベル付与 | IssueAgent | `npx miyabi agent issue --target 123` |
| PR作成 | PRAgent | `npx miyabi agent pr --target 123` |
| デプロイ | DeploymentAgent | `npx miyabi agent deployment --target staging` |
| テスト | TestAgent | `npx miyabi agent test --target ./src` |

---

💡 **ヒント**: Agent連鎖実行（`--chain`）を使うと、複数のAgentを自動的に順次実行できます。
