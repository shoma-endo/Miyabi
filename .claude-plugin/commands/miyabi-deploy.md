---
description: デプロイ実行・管理
---

# Miyabi デプロイ実行

staging/production環境へのデプロイ、ヘルスチェック、ロールバック機能を提供します。

## MCPツール

### `miyabi__deploy`
指定環境へデプロイ

**パラメータ**:
- `env`: デプロイ先環境（staging/production/preview）
- `provider`: デプロイプロバイダー（firebase/vercel/aws/netlify）
- `healthCheck`: ヘルスチェック実行（デフォルト: true）
- `rollbackOnFailure`: 失敗時の自動ロールバック（デフォルト: true）

**使用例**:
```
stagingにデプロイ:
miyabi__deploy({ env: "staging" })

productionにデプロイ（Firebase）:
miyabi__deploy({ env: "production", provider: "firebase" })

ヘルスチェックなしでデプロイ:
miyabi__deploy({ env: "staging", healthCheck: false })

失敗時ロールバック有効:
miyabi__deploy({ env: "production", rollbackOnFailure: true })

プレビュー環境にデプロイ（Vercel）:
miyabi__deploy({ env: "preview", provider: "vercel" })
```

## 動作フロー

```
デプロイ前チェック
    ↓
├─ Gitブランチ確認
├─ テスト実行
├─ ビルド実行
└─ 環境変数確認
    ↓
デプロイ実行
    ↓
├─ Firebase: firebase deploy
├─ Vercel: vercel --prod
├─ AWS: aws s3 sync
└─ Netlify: netlify deploy --prod
    ↓
ヘルスチェック
    ↓
├─ HTTPエンドポイント確認
├─ データベース接続確認
├─ 外部API接続確認
└─ 基本機能テスト
    ↓
[成功]
    ↓
デプロイ完了通知
    ↓
[失敗 & rollbackOnFailure=true]
    ↓
自動ロールバック実行
```

## デプロイプロバイダー

### 1. Firebase Hosting

**対象**: Webアプリケーション（静的サイト・SPA）

**設定**:
```bash
# 環境変数
FIREBASE_TOKEN=xxx

# firebase.json
{
  "hosting": {
    "public": "dist",
    "ignore": ["firebase.json", "**/.*", "**/node_modules/**"]
  }
}
```

**実行**:
```bash
npx miyabi deploy staging --provider firebase
```

**出力URL**:
- Staging: `https://staging.example.com`
- Production: `https://example.com`

### 2. Vercel

**対象**: Next.js、React、Vue.js等のWebアプリ

**設定**:
```bash
# 環境変数
VERCEL_TOKEN=xxx
VERCEL_ORG_ID=xxx
VERCEL_PROJECT_ID=xxx

# vercel.json
{
  "version": 2,
  "builds": [{ "src": "package.json", "use": "@vercel/next" }]
}
```

**実行**:
```bash
npx miyabi deploy production --provider vercel
```

**出力URL**:
- Preview: `https://my-app-git-branch.vercel.app`
- Production: `https://my-app.vercel.app`

### 3. AWS (S3 + CloudFront)

**対象**: 静的サイト・SPA

**設定**:
```bash
# 環境変数
AWS_ACCESS_KEY_ID=xxx
AWS_SECRET_ACCESS_KEY=xxx
AWS_REGION=ap-northeast-1
AWS_S3_BUCKET=my-bucket
AWS_CLOUDFRONT_DISTRIBUTION_ID=xxx
```

**実行**:
```bash
npx miyabi deploy production --provider aws
```

**処理内容**:
1. ビルド（`npm run build`）
2. S3にアップロード（`aws s3 sync`）
3. CloudFront invalidation

### 4. Netlify

**対象**: 静的サイト・Jamstack

**設定**:
```bash
# 環境変数
NETLIFY_AUTH_TOKEN=xxx
NETLIFY_SITE_ID=xxx

# netlify.toml
[build]
  publish = "dist"
  command = "npm run build"
```

**実行**:
```bash
npx miyabi deploy production --provider netlify
```

## コマンドライン実行

MCPツールの代わりにコマンドラインでも実行可能:

```bash
# stagingにデプロイ
npx miyabi deploy staging

# productionにデプロイ
npx miyabi deploy production

# プロバイダー指定
npx miyabi deploy production --provider firebase

# ヘルスチェックスキップ
npx miyabi deploy staging --no-health-check

# ドライラン（実際にはデプロイしない）
npx miyabi deploy production --dry-run

# 自動ロールバック無効
npx miyabi deploy production --no-rollback

# 環境変数を上書き
npx miyabi deploy staging --env-file .env.staging

# 特定ブランチからデプロイ
npx miyabi deploy production --branch main

# ビルドスキップ（既存ビルドを使用）
npx miyabi deploy staging --skip-build
```

## 環境変数

`.env` ファイルに以下を設定:

```bash
# 共通
NODE_ENV=production

# GitHub（デプロイ通知用）
GITHUB_TOKEN=ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
REPOSITORY=owner/repo

# Firebase
FIREBASE_TOKEN=xxx

# Vercel
VERCEL_TOKEN=xxx
VERCEL_ORG_ID=xxx
VERCEL_PROJECT_ID=xxx

# AWS
AWS_ACCESS_KEY_ID=xxx
AWS_SECRET_ACCESS_KEY=xxx
AWS_REGION=ap-northeast-1
AWS_S3_BUCKET=my-bucket
AWS_CLOUDFRONT_DISTRIBUTION_ID=xxx

# Netlify
NETLIFY_AUTH_TOKEN=xxx
NETLIFY_SITE_ID=xxx

# ヘルスチェック
HEALTH_CHECK_URL=https://api.example.com/health
HEALTH_CHECK_TIMEOUT=30000
```

環境別の設定ファイル:
```bash
.env.staging   # staging環境
.env.production # production環境
.env.preview   # preview環境
```

## ヘルスチェック

デプロイ後に自動実行されるヘルスチェック:

### HTTPエンドポイント確認

```typescript
// GET /health または GET /api/health
{
  "status": "ok",
  "timestamp": "2025-10-10T14:30:00Z",
  "services": {
    "database": "ok",
    "cache": "ok",
    "external_api": "ok"
  }
}
```

### チェック項目

1. **HTTPステータス**: 200 OK
2. **レスポンスタイム**: < 5秒
3. **データベース接続**: OK
4. **外部API接続**: OK
5. **必須機能**: 正常動作

### カスタムヘルスチェック

`.miyabi.yml` でカスタマイズ:

```yaml
deploy:
  healthCheck:
    enabled: true
    timeout: 30000 # 30秒
    retries: 3
    interval: 5000 # 5秒

    endpoints:
      - url: https://api.example.com/health
        method: GET
        expectedStatus: 200

      - url: https://api.example.com/db/ping
        method: GET
        expectedStatus: 200
        timeout: 10000

    # スモークテスト
    smokeTests:
      - name: "ユーザー認証"
        command: "npm run test:smoke:auth"
      - name: "API基本動作"
        command: "npm run test:smoke:api"
```

## ロールバック機能

デプロイ失敗時の自動ロールバック:

### 自動ロールバック

```bash
npx miyabi deploy production --rollback-on-failure
```

実行内容:
1. デプロイ実行
2. ヘルスチェック失敗検出
3. 前バージョンに自動復元
4. ヘルスチェック再実行
5. 失敗通知

### 手動ロールバック

```bash
# 直前のバージョンにロールバック
npx miyabi rollback

# 特定バージョンにロールバック
npx miyabi rollback --version v1.2.3

# 特定デプロイIDにロールバック
npx miyabi rollback --deployment-id abc123

# ロールバック履歴表示
npx miyabi rollback --list
```

### ロールバック履歴

```bash
npx miyabi rollback --list
```

出力:
```
📝 デプロイ履歴

v1.2.5 (current)
  - 日時: 2025-10-10 14:30:00
  - 環境: production
  - ステータス: ❌ 失敗（ヘルスチェックNG）

v1.2.4 (previous)
  - 日時: 2025-10-09 10:15:00
  - 環境: production
  - ステータス: ✅ 成功

v1.2.3
  - 日時: 2025-10-08 16:45:00
  - 環境: production
  - ステータス: ✅ 成功

ロールバックコマンド:
  npx miyabi rollback --version v1.2.4
```

## デプロイ戦略

### Blue-Green Deployment

```bash
# 新環境（Green）にデプロイ
npx miyabi deploy production --strategy blue-green

# ヘルスチェック成功後、トラフィック切替
npx miyabi deploy swap --from blue --to green
```

### Canary Deployment

```bash
# 10%のトラフィックを新バージョンに
npx miyabi deploy production --strategy canary --traffic 10

# 問題なければ50%に増加
npx miyabi deploy canary --traffic 50

# 最終的に100%（完全切替）
npx miyabi deploy canary --traffic 100
```

### Rolling Deployment

```bash
# インスタンスを順次更新
npx miyabi deploy production --strategy rolling --batch-size 2
```

## デプロイ通知

成功/失敗時の通知設定:

### GitHub Issue/PRコメント

```yaml
# .miyabi.yml
deploy:
  notifications:
    github:
      enabled: true
      commentOnPR: true
      commentOnIssue: true
```

通知内容:
```markdown
🚀 デプロイ完了: production

- バージョン: v1.2.5
- 環境: production
- URL: https://example.com
- デプロイ時刻: 2025-10-10 14:30:00
- デプロイ時間: 2分30秒

ヘルスチェック: ✅ 成功
  - API: 200 OK (120ms)
  - Database: 接続成功
  - External API: 正常
```

### Slack通知

```yaml
# .miyabi.yml
deploy:
  notifications:
    slack:
      enabled: true
      webhookUrl: ${SLACK_WEBHOOK_URL}
      channel: "#deployments"
```

### Discord通知

```yaml
# .miyabi.yml
deploy:
  notifications:
    discord:
      enabled: true
      webhookUrl: ${DISCORD_WEBHOOK_URL}
```

## 使用例

### 例1: stagingへの通常デプロイ

```
あなた: "stagingにデプロイして"

Claude: [miyabi__deploy({ env: "staging" }) を実行]

✅ デプロイ完了: staging

デプロイ情報:
  - 環境: staging
  - プロバイダー: Firebase Hosting
  - バージョン: v1.2.5-rc.1
  - ブランチ: develop
  - コミット: abc123
  - デプロイ時刻: 2025-10-10 14:30:00

ビルド:
  ✓ npm run build（45秒）
  ✓ 出力サイズ: 2.3 MB

デプロイ:
  ✓ firebase deploy（30秒）
  ✓ アップロード: 2.3 MB

ヘルスチェック:
  ✓ https://staging.example.com: 200 OK
  ✓ API: 正常動作
  ✓ データベース: 接続成功

URL:
  - Web: https://staging.example.com
  - API: https://api-staging.example.com

次のアクション:
  1. 動作確認実施
  2. 問題なければproductionへデプロイ
  3. npx miyabi deploy production
```

### 例2: productionへのデプロイ（ヘルスチェック付き）

```
あなた: "productionにデプロイして、ヘルスチェックも実施"

Claude: [miyabi__deploy({ env: "production", healthCheck: true, rollbackOnFailure: true }) を実行]

✅ デプロイ完了: production

デプロイ情報:
  - 環境: production
  - プロバイダー: Vercel
  - バージョン: v1.2.5
  - ブランチ: main
  - コミット: def456
  - デプロイ時刻: 2025-10-10 15:00:00

ビルド:
  ✓ npm run build（1分20秒）
  ✓ 最適化完了

デプロイ:
  ✓ vercel --prod（45秒）
  ✓ DNS設定: 完了

ヘルスチェック:
  ✓ HTTPステータス: 200 OK
  ✓ レスポンスタイム: 85ms
  ✓ データベース: 接続成功（10ms）
  ✓ 外部API: 正常（150ms）
  ✓ スモークテスト: パス（3/3）

パフォーマンス:
  - First Contentful Paint: 1.2s
  - Time to Interactive: 2.8s
  - Lighthouse Score: 95/100

URL:
  - Web: https://example.com
  - API: https://api.example.com

完了: productionデプロイ成功
```

### 例3: デプロイ失敗とロールバック

```
あなた: "productionにデプロイ"

Claude: [miyabi__deploy({ env: "production", rollbackOnFailure: true }) を実行]

❌ デプロイ失敗: production

デプロイ情報:
  - 環境: production
  - バージョン: v1.2.6
  - デプロイ時刻: 2025-10-10 16:00:00

ビルド:
  ✓ npm run build（1分15秒）

デプロイ:
  ✓ firebase deploy（40秒）

ヘルスチェック:
  ❌ HTTPステータス: 503 Service Unavailable
  ❌ データベース: 接続タイムアウト
  ⏱  外部API: 応答なし（タイムアウト）

自動ロールバック実行中...

ロールバック完了:
  ✓ バージョン: v1.2.5に復元
  ✓ ヘルスチェック: 正常

現在のバージョン: v1.2.5（前バージョン）

エラー原因:
  - データベース接続設定エラー
  - 環境変数 DATABASE_URL が不正

推奨アクション:
  1. 環境変数を確認: DATABASE_URL
  2. データベース接続をテスト
  3. 修正後に再デプロイ
```

### 例4: 手動ロールバック

```
あなた: "直前のバージョンにロールバックして"

Claude: [Bashコマンド実行]
npx miyabi rollback

✅ ロールバック完了

ロールバック情報:
  - ロールバック元: v1.2.6
  - ロールバック先: v1.2.5
  - 環境: production
  - 実行時刻: 2025-10-10 16:15:00

復元内容:
  ✓ コード: v1.2.5
  ✓ 設定: v1.2.5
  ✓ データベースマイグレーション: ロールバック

ヘルスチェック:
  ✓ HTTPステータス: 200 OK
  ✓ データベース: 接続成功
  ✓ 外部API: 正常

現在のバージョン: v1.2.5

完了: ロールバック成功
```

## トラブルシューティング

### デプロイ失敗

```
❌ Error: Deploy failed: Build error

解決策:
1. ビルドログを確認
2. ローカルでビルド実行: npm run build
3. エラーを修正後に再デプロイ
```

### ヘルスチェック失敗

```
❌ Health check failed: 503 Service Unavailable

確認:
1. デプロイ先URLが正しいか確認
2. サーバーが起動しているか確認
3. ファイアウォール設定を確認
4. ログを確認: npx miyabi logs production
```

### 認証エラー

```
❌ Error: Authentication failed

解決策:
1. トークンが設定されているか確認
   Firebase: FIREBASE_TOKEN
   Vercel: VERCEL_TOKEN
   AWS: AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY
2. トークンの有効期限を確認
3. トークンの権限を確認
```

### ロールバック失敗

```
❌ Error: Rollback failed: Previous version not found

解決策:
1. デプロイ履歴を確認: npx miyabi rollback --list
2. 特定バージョンを指定: npx miyabi rollback --version v1.2.4
3. 手動で復元
```

## ベストプラクティス

### 🎯 推奨ワークフロー

**開発フロー**:
```bash
# 1. 機能開発（feature branch）
git checkout -b feature/new-feature

# 2. プレビューデプロイ（自動）
git push origin feature/new-feature
# → Vercel/Netlifyが自動でプレビューデプロイ

# 3. staging確認
git checkout develop
git merge feature/new-feature
npx miyabi deploy staging

# 4. production反映
git checkout main
git merge develop
npx miyabi deploy production
```

### ⚠️ 注意事項

- **production直デプロイ禁止**: 必ずstagingで確認後にproduction
- **ヘルスチェック必須**: production環境では必ずヘルスチェック実施
- **ロールバック準備**: 常にロールバック可能な状態を維持
- **バックアップ**: データベースはデプロイ前にバックアップ

### 📝 デプロイチェックリスト

**デプロイ前**:
- [ ] テスト全てパス
- [ ] ビルド成功
- [ ] staging環境で動作確認
- [ ] データベースマイグレーション確認
- [ ] 環境変数設定確認
- [ ] ロールバック手順確認

**デプロイ後**:
- [ ] ヘルスチェック成功
- [ ] スモークテスト実施
- [ ] パフォーマンス確認
- [ ] エラーログ確認
- [ ] モニタリング確認

---

💡 **ヒント**: デプロイは「リリース」ではなく「継続的な改善」です。小さく頻繁にデプロイしましょう。
