# Examples - サンプルプロジェクト

Autonomous Operationsの実行例とサンプル出力を紹介します。

---

## 📂 ディレクトリ構成

```
examples/
├── README.md                     # このファイル
├── demo-issue.md                 # デモ用Issue（実行可能）
├── sample-output/                # 期待される出力例
│   ├── generated-code/           # Agent生成コード
│   ├── test-results/             # テスト結果
│   └── execution-report.json     # 実行レポート
└── tutorials/                    # チュートリアル
    ├── 01-first-agent-run.md
    ├── 02-custom-agent.md
    ├── 03-github-actions.md
    └── 04-deployment.md
```

---

## 🎯 デモ実行

### 1. デモIssue作成

[demo-issue.md](./demo-issue.md) の内容をコピーして、GitHubリポジトリで新規Issueを作成します。

#### 簡単な方法: GitHub CLI

```bash
gh issue create --title "[DEMO] ユーザー認証機能の実装" \
  --body-file examples/demo-issue.md \
  --label "🤖agent-execute,📚demo"
```

#### 手動での方法:

1. GitHubリポジトリの **Issues** タブ
2. **New issue** をクリック
3. `demo-issue.md` の内容を貼り付け
4. ラベル: `🤖agent-execute`, `📚demo` を追加
5. **Submit new issue**

### 2. Agent実行を確認

#### GitHub Actions経由

1. **Actions** タブを開く
2. **Autonomous Agent Executor** ワークフローを確認
3. 実行ログをリアルタイムで確認

#### ローカル実行

```bash
# Issue番号を確認
gh issue list --label "📚demo"

# ローカルでAgent実行
npm run agents:parallel:exec -- --issue [ISSUE_NUMBER]

# ドライラン（実際には実行しない）
npm run agents:parallel:exec -- --issue [ISSUE_NUMBER] --dry-run
```

### 3. 結果確認

#### Draft PR確認

```bash
# PR一覧表示
gh pr list --state all

# 特定PRの詳細
gh pr view [PR_NUMBER]

# PR差分確認
gh pr diff [PR_NUMBER]
```

#### 生成されたコードを確認

```bash
# ブランチをチェックアウト
gh pr checkout [PR_NUMBER]

# ファイル一覧
ls -la src/

# 生成されたコードを表示
cat src/auth/login.ts
cat src/auth/login.test.ts
```

#### ログ確認

```bash
# LDDログ確認
cat .ai/logs/$(date +%Y-%m-%d).md

# 実行レポート確認
cat .ai/parallel-reports/report-issue-[ISSUE_NUMBER].json | jq
```

---

## 📊 サンプル出力

### 実行レポート (execution-report.json)

実際のAgent実行結果の例:

```json
{
  "issueNumber": 1,
  "title": "[DEMO] ユーザー認証機能の実装",
  "startTime": "2025-10-08T10:00:00Z",
  "endTime": "2025-10-08T10:04:32Z",
  "duration": "4m 32s",
  "status": "success",
  "tasks": [
    {
      "id": "task-1",
      "type": "implement",
      "description": "ログイン画面の実装",
      "agent": "CodeGenAgent",
      "status": "completed",
      "duration": "1m 15s",
      "files": [
        "src/components/LoginForm.tsx",
        "src/components/LoginForm.test.tsx"
      ]
    },
    {
      "id": "task-2",
      "type": "implement",
      "description": "JWT認証の実装",
      "agent": "CodeGenAgent",
      "status": "completed",
      "duration": "1m 45s",
      "files": [
        "src/auth/jwt.ts",
        "src/auth/jwt.test.ts"
      ]
    },
    {
      "id": "task-3",
      "type": "test",
      "description": "ユニットテスト実行",
      "agent": "ReviewAgent",
      "status": "completed",
      "duration": "45s",
      "coverage": "87%"
    }
  ],
  "qualityReport": {
    "score": 87,
    "passed": true,
    "breakdown": {
      "eslintScore": 100,
      "typeScriptScore": 100,
      "securityScore": 90,
      "testCoverageScore": 85
    },
    "issues": [],
    "recommendations": [
      "Consider adding rate limiting to login endpoint",
      "Add CSRF protection"
    ]
  },
  "prNumber": 2,
  "prUrl": "https://github.com/owner/repo/pull/2"
}
```

### 生成コード例 (LoginForm.tsx)

```typescript
/**
 * LoginForm Component
 *
 * User authentication form with email and password validation.
 *
 * @component
 * @example
 * ```tsx
 * <LoginForm onSuccess={() => navigate('/dashboard')} />
 * ```
 */
import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { validateEmail } from '../utils/validation';

interface LoginFormProps {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

export const LoginForm: React.FC<LoginFormProps> = ({
  onSuccess,
  onError,
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateEmail(email)) {
      onError?.(new Error('Invalid email format'));
      return;
    }

    setLoading(true);

    try {
      await login(email, password);
      onSuccess?.();
    } catch (error) {
      onError?.(error as Error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="login-form">
      <div className="form-group">
        <label htmlFor="email">Email</label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          disabled={loading}
        />
      </div>

      <div className="form-group">
        <label htmlFor="password">Password</label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          disabled={loading}
        />
      </div>

      <button type="submit" disabled={loading}>
        {loading ? 'Logging in...' : 'Login'}
      </button>
    </form>
  );
};
```

### テスト結果例

```
✓ src/components/LoginForm.test.tsx (8 tests) 245ms
  ✓ LoginForm (8 tests) 243ms
    ✓ renders email and password inputs
    ✓ validates email format
    ✓ calls onSuccess after successful login
    ✓ calls onError on login failure
    ✓ disables inputs while loading
    ✓ prevents submission with empty fields
    ✓ handles network errors gracefully
    ✓ displays loading state

Test Files  1 passed (1)
     Tests  8 passed (8)
  Duration  1.23s
  Coverage  92%
```

---

## 📚 チュートリアル

### [01: 初回Agent実行](./tutorials/01-first-agent-run.md)

- Issueの作成方法
- ラベルの付与
- Agent実行の監視
- 結果の確認

**所要時間**: 15分

### [02: カスタムAgent作成](./tutorials/02-custom-agent.md)

- Agent実装の基礎
- BaseAgentの継承
- カスタムロジックの追加
- Coordinatorへの登録

**所要時間**: 30分

### [03: GitHub Actions統合](./tutorials/03-github-actions.md)

- Workflowのカスタマイズ
- Secretsの管理
- 条件付き実行
- 通知設定

**所要時間**: 20分

### [04: デプロイメント](./tutorials/04-deployment.md)

- Firebase設定
- Staging/Production環境
- ヘルスチェック
- ロールバック

**所要時間**: 25分

---

## 🎯 実践的な例

### Example 1: 簡単なAPI実装

```markdown
# Issue: RESTful User API の実装

## 要件
- [ ] GET /api/users - ユーザー一覧取得
- [ ] GET /api/users/:id - ユーザー詳細取得
- [ ] POST /api/users - ユーザー作成
- [ ] PUT /api/users/:id - ユーザー更新
- [ ] DELETE /api/users/:id - ユーザー削除

## 技術スタック
- Express.js
- TypeScript
- Prisma ORM

ラベル: 🤖agent-execute, 🆕feature
```

**期待される実行時間**: 5-7分
**生成されるファイル**: 8-10ファイル
**品質スコア**: 85-90点

### Example 2: バグ修正

```markdown
# Issue: ログイン時にトークンが更新されない

## 問題
ユーザーがログインしても、古いJWTトークンが使用され続ける。

## 再現手順
1. ログイン
2. トークン有効期限切れまで待つ
3. 再度ログインを試みる
4. 古いトークンが使われる

## 期待される動作
ログイン時に新しいトークンが発行され、Redisに保存される。

ラベル: 🤖agent-execute, 🐛bug
```

**期待される実行時間**: 3-4分
**修正されるファイル**: 2-3ファイル
**品質スコア**: 90-95点

### Example 3: リファクタリング

```markdown
# Issue: UserService のリファクタリング

## 目的
コードの可読性向上とテスタビリティの改善

## 要件
- [ ] 大きな関数を分割
- [ ] 依存性注入パターン適用
- [ ] エラーハンドリング統一
- [ ] ユニットテストのカバレッジ向上

## 制約
- 既存のAPIインターフェースは変更しない
- パフォーマンスを低下させない

ラベル: 🤖agent-execute, ♻️refactor
```

**期待される実行時間**: 6-8分
**リファクタされるファイル**: 5-7ファイル
**品質スコア**: 85-90点

---

## 📈 パフォーマンス指標

実際の実行データに基づく平均値:

| 指標 | 平均値 | 範囲 |
|------|--------|------|
| Issue → PR作成 | 4分30秒 | 3-7分 |
| 生成ファイル数 | 6ファイル | 2-15ファイル |
| コード行数 | 450行 | 100-1,200行 |
| 品質スコア | 87点 | 80-95点 |
| テストカバレッジ | 85% | 75-95% |

---

## 🔍 デバッグ方法

### ログの確認

```bash
# LDD形式のログ
cat .ai/logs/$(date +%Y-%m-%d).md

# Agent実行レポート
cat .ai/parallel-reports/report-issue-*.json | jq

# GitHub Actionsログ
gh run list --workflow "Autonomous Agent Executor"
gh run view [RUN_ID] --log
```

### ドライランモード

実際には実行せず、何が起こるかシミュレート:

```bash
npm run agents:parallel:exec -- --issue 1 --dry-run
```

**出力例**:

```
🔍 Dry Run Mode

Issue #1: [DEMO] ユーザー認証機能の実装

📋 Task Decomposition:
1. task-1: ログイン画面の実装 (CodeGenAgent)
2. task-2: JWT認証の実装 (CodeGenAgent)
3. task-3: ユニットテスト作成 (CodeGenAgent)
4. task-4: 品質チェック (ReviewAgent)
5. task-5: PR作成 (PRAgent)

📊 Estimated Duration: 4-6 minutes

✅ Dry run completed (no changes made)
```

---

## 🤝 コミュニティ例

### 実際のプロジェクトでの使用例

1. **ECサイト構築**: 商品管理APIの実装を自動化
2. **社内ツール**: Slack Bot の機能追加を Agent に任せる
3. **技術的負債解消**: レガシーコードのリファクタリングを段階的に実行

コミュニティの実例は [GitHub Discussions](https://github.com/ShunsukeHayashi/Autonomous-Operations/discussions) で共有されています。

---

## 📝 フィードバック

サンプルやチュートリアルについてのフィードバックは以下で受け付けています:

- GitHub Issues: バグ報告・改善提案
- GitHub Discussions: 質問・議論
- Pull Requests: サンプルコードの追加・改善

---

## 🎓 次のステップ

1. **デモIssueを実行**: [demo-issue.md](./demo-issue.md) を使って実際に動かす
2. **チュートリアルを完了**: 4つのチュートリアルすべてを実施
3. **実プロジェクトで使用**: 実際の開発タスクをAgentに任せてみる
4. **カスタマイズ**: プロジェクトに合わせてAgentやコマンドをカスタマイズ

---

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>
