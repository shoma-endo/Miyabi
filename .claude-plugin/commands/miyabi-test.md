---
description: テスト実行・カバレッジ測定
---

# Miyabi テスト実行

Vitestを使用したテスト実行、カバレッジ測定、ウォッチモードをサポートします。

## MCPツール

### `miyabi__test`
テストを実行

**パラメータ**:
- `target`: テスト対象（ファイルパスまたは"all"）
- `coverage`: カバレッジ測定（デフォルト: false）
- `watch`: ウォッチモード（デフォルト: false）
- `type`: テストタイプ（unit/integration/e2e/all）

**使用例**:
```
全テスト実行:
miyabi__test({ target: "all" })

カバレッジ測定付き:
miyabi__test({ target: "all", coverage: true })

特定ファイルをテスト:
miyabi__test({ target: "src/agents/coordinator.test.ts" })

ウォッチモード:
miyabi__test({ target: "src/", watch: true })

ユニットテストのみ:
miyabi__test({ type: "unit" })

E2Eテスト:
miyabi__test({ type: "e2e" })
```

## 動作フロー

```
テスト実行
    ↓
テストファイル検出
    ↓
├─ *.test.ts
├─ *.spec.ts
└─ __tests__/**/*
    ↓
Vitest実行
    ↓
テストタイプ別実行
    ↓
├─ Unit: 単体テスト
├─ Integration: 統合テスト
└─ E2E: エンドツーエンドテスト
    ↓
[coverage=true の場合]
    ↓
カバレッジ測定
    ↓
├─ ライン カバレッジ
├─ 関数 カバレッジ
├─ ブランチ カバレッジ
└─ ステートメント カバレッジ
    ↓
結果レポート出力
    ↓
[watch=true の場合]
    ↓
ファイル変更を監視
    ↓
変更検出時に自動再実行
```

## テストタイプ

### 1. ユニットテスト（Unit Tests）

**対象**: 個別の関数・クラス

**配置**: `src/**/*.test.ts`

**実行**:
```bash
npx miyabi test unit
```

**例**:
```typescript
// src/agents/coordinator.test.ts
import { describe, it, expect } from 'vitest';
import { CoordinatorAgent } from './coordinator';

describe('CoordinatorAgent', () => {
  it('should analyze issue and generate task DAG', async () => {
    const agent = new CoordinatorAgent(config);
    const dag = await agent.analyze(123);

    expect(dag).toBeDefined();
    expect(dag.tasks).toHaveLength(3);
    expect(dag.tasks[0].type).toBe('codegen');
  });

  it('should prioritize tasks by urgency', () => {
    const tasks = [
      { urgency: 'low', id: 1 },
      { urgency: 'high', id: 2 },
      { urgency: 'medium', id: 3 }
    ];

    const sorted = agent.prioritize(tasks);
    expect(sorted[0].urgency).toBe('high');
  });
});
```

### 2. 統合テスト（Integration Tests）

**対象**: 複数モジュールの連携

**配置**: `tests/integration/**/*.test.ts`

**実行**:
```bash
npx miyabi test integration
```

**例**:
```typescript
// tests/integration/agent-flow.test.ts
import { describe, it, expect } from 'vitest';
import { WaterSpiderAgent } from '@/agents/water-spider';

describe('Agent Integration Flow', () => {
  it('should process issue from detection to PR creation', async () => {
    const waterSpider = new WaterSpiderAgent();

    // Issue検出
    const issues = await waterSpider.detectIssues();
    expect(issues).toHaveLength(1);

    // Coordinator起動
    const coordinator = await waterSpider.startCoordinator(issues[0]);
    expect(coordinator).toBeDefined();

    // CodeGen実行
    const codeGen = await coordinator.executeCodeGen();
    expect(codeGen.files).toHaveLength(2);

    // PR作成
    const pr = await coordinator.createPR();
    expect(pr.number).toBeGreaterThan(0);
  });
});
```

### 3. E2Eテスト（End-to-End Tests）

**対象**: エンドユーザーの操作フロー全体

**配置**: `tests/e2e/**/*.test.ts`

**実行**:
```bash
npx miyabi test e2e
```

**例**:
```typescript
// tests/e2e/full-workflow.test.ts
import { describe, it, expect } from 'vitest';
import { execSync } from 'child_process';

describe('Full Workflow E2E', () => {
  it('should complete full cycle from issue to deployment', async () => {
    // Issue作成
    const issue = execSync('gh issue create --title "Test" --body "E2E test"');
    const issueNumber = extractIssueNumber(issue);

    // Water Spider起動（自動処理）
    execSync(`npx miyabi auto --max-issues 1 --interval 0`);

    // PR確認
    const pr = execSync(`gh pr list --search "closes #${issueNumber}"`);
    expect(pr).toContain('Draft');

    // マージ
    const prNumber = extractPRNumber(pr);
    execSync(`gh pr merge ${prNumber} --squash --auto`);

    // デプロイ確認
    const deployment = execSync('npx miyabi deploy staging');
    expect(deployment).toContain('Success');
  }, 300000); // 5分タイムアウト
});
```

## コマンドライン実行

MCPツールの代わりにコマンドラインでも実行可能:

```bash
# 全テスト実行
npx miyabi test

# ユニットテストのみ
npx miyabi test unit

# 統合テスト
npx miyabi test integration

# E2Eテスト
npx miyabi test e2e

# カバレッジ測定
npx miyabi test --coverage

# ウォッチモード
npx miyabi test --watch

# 特定ファイル
npx miyabi test src/agents/coordinator.test.ts

# 特定ディレクトリ
npx miyabi test src/agents/

# パターン指定
npx miyabi test --pattern "**/*.test.ts"

# 並列実行（高速化）
npx miyabi test --threads 4

# UI モード（ブラウザで結果表示）
npx miyabi test --ui

# レポーター指定
npx miyabi test --reporter verbose
npx miyabi test --reporter json --outputFile test-results.json
```

## 環境変数

`.env.test` ファイルに以下を設定:

```bash
# テスト用環境
NODE_ENV=test

# GitHub（テスト用トークン）
GITHUB_TOKEN=ghp_test_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
REPOSITORY=owner/repo

# テスト用データベース
DATABASE_URL=postgresql://localhost:5432/miyabi_test

# モック用
ANTHROPIC_API_KEY=sk-ant-test-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# タイムアウト設定
TEST_TIMEOUT=30000 # 30秒
E2E_TIMEOUT=300000 # 5分

# デバッグ
DEBUG=miyabi:*
```

## カバレッジ測定

### カバレッジ実行

```bash
npx miyabi test --coverage
```

### カバレッジレポート

```
📊 テストカバレッジレポート

File                          | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s
------------------------------|---------|----------|---------|---------|------------------
All files                     |   87.5  |   82.3   |   90.1  |   87.2  |
 src/agents/                  |   92.3  |   88.5   |   95.0  |   92.1  |
  coordinator.ts              |   95.2  |   90.0   |  100.0  |   95.0  | 42, 67
  codegen.ts                  |   88.7  |   85.0   |   90.0  |   88.5  | 123-125, 200
  review.ts                   |   93.5  |   90.5   |   95.0  |   93.2  | 89, 156
 src/utils/                   |   78.2  |   70.5   |   80.0  |   77.9  |
  github.ts                   |   82.0  |   75.0   |   85.0  |   81.5  | 45-50, 78, 92
  logger.ts                   |   65.0  |   55.0   |   70.0  |   64.8  | 12-20, 35-42

カバレッジ目標:
  ✅ ステートメント: 87.5% (目標: 80%)
  ✅ ブランチ: 82.3% (目標: 75%)
  ✅ 関数: 90.1% (目標: 85%)
  ✅ ライン: 87.2% (目標: 80%)

HTMLレポート: coverage/index.html
```

### カバレッジHTML表示

```bash
# HTMLレポート生成
npx miyabi test --coverage

# ブラウザで開く
open coverage/index.html

# または
npx serve coverage
# http://localhost:3000
```

### カバレッジ閾値設定

`vitest.config.ts`:
```typescript
export default defineConfig({
  test: {
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      statements: 80,
      branches: 75,
      functions: 85,
      lines: 80,
      // カバレッジ不足で失敗
      thresholds: {
        statements: 80,
        branches: 75,
        functions: 85,
        lines: 80
      }
    }
  }
});
```

## ウォッチモード

ファイル変更時に自動再実行:

```bash
npx miyabi test --watch
```

動作:
```
🔍 テストウォッチモード起動

監視中: src/**/*.{ts,tsx}

[14:30:00] 全テスト実行（初回）
  ✓ src/agents/coordinator.test.ts (12 tests)
  ✓ src/agents/codegen.test.ts (8 tests)

  Total: 20 tests passed

[14:32:15] 変更検出: src/agents/coordinator.ts
[14:32:16] テスト再実行: src/agents/coordinator.test.ts
  ✓ src/agents/coordinator.test.ts (12 tests)

[14:35:42] 変更検出: src/utils/github.ts
[14:35:43] 関連テスト再実行
  ✓ src/utils/github.test.ts (5 tests)
  ✓ src/agents/coordinator.test.ts (2 tests)

キー:
  q: 終了
  a: 全テスト再実行
  f: 失敗したテストのみ再実行
  t: ファイル名でフィルタ
```

## テスト出力形式

### デフォルト（Verbose）

```bash
npx miyabi test --reporter verbose
```

出力:
```
✓ src/agents/coordinator.test.ts (12)
  ✓ CoordinatorAgent (12)
    ✓ should analyze issue and generate task DAG (45ms)
    ✓ should prioritize tasks by urgency (12ms)
    ✓ should handle API errors gracefully (23ms)
    ...

✓ src/agents/codegen.test.ts (8)
  ✓ CodeGenAgent (8)
    ✓ should generate TypeScript code (156ms)
    ✓ should generate test code (89ms)
    ...

Test Files  2 passed (2)
     Tests  20 passed (20)
  Start at  14:30:00
  Duration  1.23s
```

### JSON形式

```bash
npx miyabi test --reporter json --outputFile test-results.json
```

出力:
```json
{
  "numTotalTestSuites": 2,
  "numPassedTestSuites": 2,
  "numFailedTestSuites": 0,
  "numTotalTests": 20,
  "numPassedTests": 20,
  "numFailedTests": 0,
  "startTime": 1728554400000,
  "testResults": [
    {
      "name": "src/agents/coordinator.test.ts",
      "status": "passed",
      "duration": 450,
      "assertionResults": [
        {
          "title": "should analyze issue and generate task DAG",
          "status": "passed",
          "duration": 45
        }
      ]
    }
  ]
}
```

### JUnit XML形式（CI用）

```bash
npx miyabi test --reporter junit --outputFile junit.xml
```

## モック・スタブ

### API モック

```typescript
// src/agents/coordinator.test.ts
import { describe, it, expect, vi } from 'vitest';
import { CoordinatorAgent } from './coordinator';
import * as github from '@/utils/github';

describe('CoordinatorAgent with mocks', () => {
  it('should use mocked GitHub API', async () => {
    // GitHub API をモック
    vi.spyOn(github, 'getIssue').mockResolvedValue({
      number: 123,
      title: 'Test issue',
      body: 'Test body'
    });

    const agent = new CoordinatorAgent(config);
    const result = await agent.analyze(123);

    expect(github.getIssue).toHaveBeenCalledWith(123);
    expect(result).toBeDefined();
  });
});
```

### 環境変数モック

```typescript
import { describe, it, expect, beforeEach, afterEach } from 'vitest';

describe('With environment variables', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
    process.env.GITHUB_TOKEN = 'test-token';
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it('should use mocked env vars', () => {
    expect(process.env.GITHUB_TOKEN).toBe('test-token');
  });
});
```

### タイマーモック

```typescript
import { describe, it, expect, vi } from 'vitest';

describe('With timer mocks', () => {
  it('should fast-forward timers', async () => {
    vi.useFakeTimers();

    const callback = vi.fn();
    setTimeout(callback, 1000);

    // 1秒進める
    vi.advanceTimersByTime(1000);

    expect(callback).toHaveBeenCalled();

    vi.useRealTimers();
  });
});
```

## 使用例

### 例1: 全テスト実行

```
あなた: "全テストを実行して"

Claude: [miyabi__test({ target: "all", coverage: true }) を実行]

✅ テスト実行完了

実行結果:
  ✓ ユニットテスト: 45 passed
  ✓ 統合テスト: 12 passed
  ✓ E2Eテスト: 3 passed

  Total: 60 tests passed (60)
  Duration: 12.5s

カバレッジ:
  ✓ ステートメント: 89.2%
  ✓ ブランチ: 84.5%
  ✓ 関数: 92.1%
  ✓ ライン: 88.9%

HTMLレポート: coverage/index.html

次のアクション:
  1. カバレッジレポートを確認
  2. 未カバー箇所にテスト追加
  3. デプロイ準備
```

### 例2: 特定ファイルのテスト

```
あなた: "coordinator.tsのテストを実行"

Claude: [miyabi__test({ target: "src/agents/coordinator.test.ts" }) を実行]

✅ テスト実行完了

実行結果:
  ✓ src/agents/coordinator.test.ts (12 tests)
    ✓ CoordinatorAgent (12)
      ✓ should analyze issue and generate task DAG (45ms)
      ✓ should prioritize tasks by urgency (12ms)
      ✓ should handle API errors gracefully (23ms)
      ✓ should detect circular dependencies (34ms)
      ✓ should estimate task duration (18ms)
      ... (7 more)

  Total: 12 tests passed (12)
  Duration: 456ms

全テストパス ✅
```

### 例3: ウォッチモード

```
あなた: "ウォッチモードでテスト実行"

Claude: [miyabi__test({ target: "src/", watch: true }) を実行]

🔍 テストウォッチモード起動

監視中: src/**/*.ts

[14:30:00] 初回実行
  ✓ 45 tests passed

[14:32:15] 変更検出: src/agents/coordinator.ts
[14:32:16] 関連テスト再実行
  ✓ src/agents/coordinator.test.ts (12 tests)

[14:35:42] 変更検出: src/utils/github.ts
[14:35:43] 関連テスト再実行
  ✓ src/utils/github.test.ts (5 tests)
  ✓ src/agents/coordinator.test.ts (2 tests)

キー:
  q: 終了
  a: 全テスト再実行
```

### 例4: カバレッジ不足の検出

```
あなた: "カバレッジ測定してテスト実行"

Claude: [miyabi__test({ target: "all", coverage: true }) を実行]

⚠️  テスト実行完了（カバレッジ不足）

実行結果:
  ✓ 60 tests passed

カバレッジ:
  ❌ ステートメント: 72.5% (目標: 80%)
  ❌ ブランチ: 68.3% (目標: 75%)
  ✅ 関数: 87.2% (目標: 85%)
  ❌ ライン: 71.8% (目標: 80%)

未カバー箇所:
  - src/utils/github.ts: 45-50, 78, 92
  - src/agents/codegen.ts: 123-125, 200
  - src/agents/review.ts: 89, 156

推奨アクション:
  1. 未カバー箇所を確認: open coverage/index.html
  2. テストを追加
  3. 再実行: npx miyabi test --coverage
```

## トラブルシューティング

### テスト失敗

```
❌ Test failed: src/agents/coordinator.test.ts

AssertionError: expected 3 to be 2
  at src/agents/coordinator.test.ts:42:5

解決策:
1. テストコードを確認
2. 実装を修正
3. 再実行: npx miyabi test
```

### タイムアウトエラー

```
❌ Test timeout: exceeded 5000ms

解決策:
1. タイムアウトを延長
   it('test', async () => { ... }, 10000); // 10秒
2. 非同期処理を確認
3. モックを使用して高速化
```

### カバレッジ測定エラー

```
❌ Error: Coverage provider 'v8' not found

解決策:
1. 依存関係をインストール
   npm install -D @vitest/coverage-v8
2. 再実行: npx miyabi test --coverage
```

### モックエラー

```
❌ Error: Cannot find module '@/utils/github'

解決策:
1. パスエイリアス設定を確認（vitest.config.ts）
2. tsconfig.json の paths 設定を確認
3. import文を修正
```

## ベストプラクティス

### 🎯 推奨ワークフロー

**開発中**:
```bash
# ウォッチモードで開発
npx miyabi test --watch
```

**PR作成前**:
```bash
# 全テスト+カバレッジ
npx miyabi test --coverage
```

**CI/CD**:
```bash
# JUnit XML出力
npx miyabi test --reporter junit --outputFile junit.xml
```

### ⚠️ 注意事項

- **テストは必須**: 新規コードには必ずテストを追加
- **カバレッジ目標**: 80%以上を維持
- **E2Eテストは最小限**: 遅いのでユニットテスト優先
- **モック活用**: 外部API呼び出しはモック化

### 📝 テストの書き方

**Good**:
```typescript
describe('CoordinatorAgent', () => {
  it('should prioritize high urgency tasks first', async () => {
    // Given: タスクリスト準備
    const tasks = [
      { urgency: 'low', id: 1 },
      { urgency: 'high', id: 2 }
    ];

    // When: 優先度付け実行
    const result = agent.prioritize(tasks);

    // Then: 高優先度が先頭
    expect(result[0].urgency).toBe('high');
  });
});
```

**Bad**:
```typescript
it('test', () => {
  const result = agent.prioritize([{ urgency: 'low' }]);
  expect(result).toBeTruthy(); // 曖昧なアサーション
});
```

### 🚀 パフォーマンス最適化

```typescript
// 並列実行
describe.concurrent('Parallel tests', () => {
  it('test 1', async () => { ... });
  it('test 2', async () => { ... });
  it('test 3', async () => { ... });
});

// テストデータ再利用
const testData = generateTestData();
beforeAll(() => {
  // 一度だけ実行
});
```

---

💡 **ヒント**: テストは「未来の自分への保険」です。今書いたコードが将来壊れないことを保証しましょう。
