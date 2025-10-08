# [DEMO] ユーザー認証機能の実装

このIssueはAutonomous Operationsのデモ用です。`🤖agent-execute` ラベルを追加すると、Agentが自動的にコード生成からPR作成まで実行します。

---

## 📋 要件

以下の機能を実装してください:

- [ ] **ログイン画面の実装**
  - メールアドレスとパスワードの入力フォーム
  - バリデーション（メール形式チェック、パスワード最小8文字）
  - ローディング状態の表示
  - エラーメッセージの表示

- [ ] **JWT認証の実装**
  - ログインAPIエンドポイント (`POST /api/auth/login`)
  - JWTトークンの発行（有効期限: 24時間）
  - トークンの検証ミドルウェア
  - リフレッシュトークンの実装

- [ ] **ユーザーモデルの作成**
  - User型定義（TypeScript interface）
  - パスワードのハッシュ化（bcrypt使用）
  - ユーザーデータの永続化（Prismaまたはファイルベース）

- [ ] **ユニットテストの作成**
  - ログインフォームのテスト
  - JWT認証ロジックのテスト
  - 異常系のテスト（無効なメール、間違ったパスワード等）
  - テストカバレッジ ≥80%

---

## 🛠️ 技術スタック

### フロントエンド
- **React** (v18+)
- **TypeScript** (strict mode)
- **CSS Modules** または **Tailwind CSS**

### バックエンド
- **Express.js** (v4+)
- **jsonwebtoken** (JWT)
- **bcrypt** (パスワードハッシュ化)
- **Prisma** (ORM) または in-memory storage

### テスト
- **Vitest** (ユニットテスト)
- **React Testing Library** (コンポーネントテスト)

---

## ⚠️ 制約事項

- パスワードリセット機能は含めない（別Issueで実装）
- ソーシャルログイン（Google, GitHub）は含めない
- 多要素認証（MFA）は含めない
- セッション管理はJWTのみ（Redis等は不要）

---

## 📊 成功条件

### 必須条件
- [ ] TypeScript エラー: 0件
- [ ] ESLint エラー: 0件
- [ ] テストカバレッジ: ≥80%
- [ ] 品質スコア: ≥80点
- [ ] セキュリティスキャン: 脆弱性0件

### 品質条件
- [ ] すべての関数にJSDocコメント
- [ ] エッジケースのエラーハンドリング
- [ ] ローディング状態とエラー状態の適切な表示
- [ ] パスワードは平文で保存しない
- [ ] JWTシークレットは環境変数から読み込む

---

## 🤖 Agent実行設定

- **自動実行**: 有効 (🤖agent-execute ラベル付与で開始)
- **優先度**: Medium
- **期待実行時間**: 5-7分
- **期待される生成ファイル数**: 8-12ファイル

---

## 📁 期待されるファイル構成

```
src/
├── components/
│   ├── LoginForm.tsx              # ログインフォームコンポーネント
│   ├── LoginForm.test.tsx         # フォームのユニットテスト
│   └── LoginForm.module.css       # スタイル
├── auth/
│   ├── jwt.ts                     # JWT生成・検証ロジック
│   ├── jwt.test.ts                # JWTのテスト
│   ├── middleware.ts              # 認証ミドルウェア
│   └── middleware.test.ts         # ミドルウェアのテスト
├── models/
│   ├── User.ts                    # User型定義
│   └── User.test.ts               # Userモデルのテスト
├── api/
│   ├── auth.ts                    # 認証APIエンドポイント
│   └── auth.test.ts               # APIのテスト
└── utils/
    ├── validation.ts              # バリデーションユーティリティ
    └── validation.test.ts         # バリデーションのテスト
```

---

## 🧪 テスト要件

### ログインフォームのテスト

```typescript
describe('LoginForm', () => {
  it('renders email and password inputs', () => {});
  it('validates email format', () => {});
  it('validates password length', () => {});
  it('calls onSuccess after successful login', () => {});
  it('calls onError on login failure', () => {});
  it('disables inputs while loading', () => {});
  it('displays error messages', () => {});
});
```

### JWT認証のテスト

```typescript
describe('JWT Authentication', () => {
  it('generates valid JWT token', () => {});
  it('verifies valid token successfully', () => {});
  it('rejects expired token', () => {});
  it('rejects malformed token', () => {});
  it('rejects token with invalid signature', () => {});
});
```

### API エンドポイントのテスト

```typescript
describe('POST /api/auth/login', () => {
  it('returns 200 and token on valid credentials', () => {});
  it('returns 401 on invalid credentials', () => {});
  it('returns 400 on missing email', () => {});
  it('returns 400 on missing password', () => {});
  it('returns 400 on invalid email format', () => {});
  it('returns 429 on too many requests', () => {});
});
```

---

## 🔐 セキュリティ要件

### 必須対応
- [ ] パスワードは bcrypt でハッシュ化（salt rounds: 10）
- [ ] JWTシークレットは `.env` から読み込み
- [ ] SQL Injection 対策（Prisma使用で自動対応）
- [ ] XSS 対策（入力値のサニタイゼーション）
- [ ] CSRF 対策（トークンベース認証で部分的に対応）

### 推奨対応
- [ ] レート制限（ログイン試行を5分間に5回まで）
- [ ] パスワード強度チェック（最低8文字、英数字記号混在）
- [ ] HTTPSのみでの通信（プロダクション環境）

---

## 📝 実装の参考例

### ログインフォームの基本構造

```typescript
interface LoginFormProps {
  onSuccess?: (token: string) => void;
  onError?: (error: Error) => void;
}

export const LoginForm: React.FC<LoginFormProps> = ({ onSuccess, onError }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) throw new Error('Login failed');

      const { token } = await response.json();
      onSuccess?.(token);
    } catch (error) {
      onError?.(error as Error);
    } finally {
      setLoading(false);
    }
  };

  return <form onSubmit={handleSubmit}>{/* ... */}</form>;
};
```

### JWT生成の基本構造

```typescript
import jwt from 'jsonwebtoken';

interface JWTPayload {
  userId: string;
  email: string;
}

export const generateToken = (payload: JWTPayload): string => {
  const secret = process.env.JWT_SECRET!;
  const expiresIn = '24h';

  return jwt.sign(payload, secret, { expiresIn });
};

export const verifyToken = (token: string): JWTPayload => {
  const secret = process.env.JWT_SECRET!;
  return jwt.verify(token, secret) as JWTPayload;
};
```

---

## 🎯 期待される結果

### Agent実行後
1. **Draft PR作成**: `feat: ユーザー認証機能の実装 (#1)`
2. **ブランチ**: `agent-generated-issue-1`
3. **ファイル数**: 8-12ファイル
4. **コード行数**: 600-800行
5. **品質スコア**: 85-90点
6. **テストカバレッジ**: 85-90%

### PR内容
- コミットメッセージ: Conventional Commits形式
- PR本文: 実装内容の説明、品質レポート
- Co-Authored-By: Claude <noreply@anthropic.com>

---

## 🔗 関連Issue

なし（独立したデモIssue）

---

## 📚 参考ドキュメント

- [JWT.io](https://jwt.io/) - JWT仕様
- [bcrypt npm](https://www.npmjs.com/package/bcrypt) - パスワードハッシュ化
- [React Hook Form](https://react-hook-form.com/) - フォーム管理（オプション）
- [Vitest Documentation](https://vitest.dev/) - テストフレームワーク

---

## 💡 Tips

### ローカルでの動作確認

```bash
# Agent実行（ローカル）
npm run agents:parallel:exec -- --issue [THIS_ISSUE_NUMBER]

# ドライラン（実際には実行しない）
npm run agents:parallel:exec -- --issue [THIS_ISSUE_NUMBER] --dry-run

# 生成されたコードの確認
gh pr checkout [PR_NUMBER]
npm run typecheck
npm test
```

### デバッグ

```bash
# ログ確認
cat .ai/logs/$(date +%Y-%m-%d).md

# 実行レポート確認
cat .ai/parallel-reports/report-issue-[THIS_ISSUE_NUMBER].json | jq

# GitHub Actionsログ確認
gh run list --workflow "Autonomous Agent Executor"
gh run view [RUN_ID] --log
```

---

## 🏷️ ラベル

このIssueには以下のラベルを付与してください:

- `🤖agent-execute` - Agent自動実行を有効化（必須）
- `📚demo` - デモ用Issue
- `🆕feature` - 新機能実装
- `🟡priority-medium` - 優先度: 中

---

## ⏱️ 期待される実行時間

| フェーズ | 時間 |
|---------|------|
| Issue分析・タスク分解 | 30秒 |
| コード生成 | 3-4分 |
| 品質チェック | 1分 |
| PR作成 | 30秒 |
| **合計** | **5-7分** |

---

**🚨 重要**: このIssueに `🤖agent-execute` ラベルを追加すると、Agentが自動実行を開始します。

---

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>
