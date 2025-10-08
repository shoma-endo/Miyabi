# GitHub Token Setup Guide

このガイドでは、Autonomous Operations で必要な GitHub Personal Access Token (PAT) の設定方法を説明します。

## 必要なスコープ

### 必須スコープ
- **`repo`** - リポジトリへのフルアクセス（Issue、PR、コードの読み書き）
- **`workflow`** - GitHub Actions ワークフローの管理
- **`read:project`** - GitHub Projects V2 の読み取り
- **`write:project`** - GitHub Projects V2 への書き込み（アイテム追加・更新）

### 推奨スコープ
- **`read:org`** - Organization 情報の読み取り（Organization プロジェクト使用時）
- **`notifications`** - 通知へのアクセス

## セットアップ手順

### 1. GitHub Personal Access Token の作成

1. https://github.com/settings/tokens にアクセス
2. **"Generate new token"** → **"Generate new token (classic)"** をクリック
3. Token に名前を付ける（例: `Autonomous Operations`）
4. 有効期限を選択（推奨: 90 days 以上）
5. 以下のスコープを選択:
   - ✅ `repo` (全て)
   - ✅ `workflow`
   - ✅ `read:project`
   - ✅ `write:project`
   - ✅ `notifications` (推奨)
   - ✅ `read:org` (Organization 使用時)
6. **"Generate token"** をクリック
7. 生成された Token をコピー（⚠️ このページを離れると再表示できません）

### 2. 環境変数の設定

#### オプション A: `.env` ファイルを使用（推奨）

1. プロジェクトルートに `.env` ファイルを作成:
```bash
GITHUB_TOKEN=ghp_your_token_here
```

2. `.env` ファイルが `.gitignore` に含まれていることを確認:
```bash
grep .env .gitignore
```

#### オプション B: 環境変数を直接設定

**Linux/macOS:**
```bash
export GITHUB_TOKEN=ghp_your_token_here
```

**Windows (PowerShell):**
```powershell
$env:GITHUB_TOKEN="ghp_your_token_here"
```

**永続的に設定する場合:**

Linux/macOS の場合、`~/.bashrc` または `~/.zshrc` に追加:
```bash
echo 'export GITHUB_TOKEN=ghp_your_token_here' >> ~/.bashrc
source ~/.bashrc
```

### 3. Token の検証

Token が正しく設定されているか確認:

```bash
# gh CLI を使用
gh auth status

# 環境変数を確認
echo $GITHUB_TOKEN

# プロジェクト管理機能をテスト
npm run project:info
```

## トラブルシューティング

### エラー: "Your token has not been granted the required scopes"

**原因:** Token に必要なスコープが不足しています。

**解決方法:**
1. https://github.com/settings/tokens にアクセス
2. 該当する Token を選択
3. 不足しているスコープを追加（特に `read:project` と `write:project`）
4. Token を再生成
5. `.env` ファイルまたは環境変数を更新

### エラー: "GITHUB_TOKEN not set"

**原因:** 環境変数が設定されていません。

**解決方法:**
```bash
# .env ファイルが存在するか確認
ls -la .env

# 環境変数を source
set -a && source .env && set +a

# または直接設定
export GITHUB_TOKEN=ghp_your_token_here
```

### gh CLI の認証と環境変数が異なる

`gh` CLI は独自の認証を管理しています。スクリプトで使用する `GITHUB_TOKEN` 環境変数とは別です。

**両方を設定する:**
```bash
# gh CLI の認証
gh auth login

# 環境変数の設定
export GITHUB_TOKEN=$(gh auth token)
```

## セキュリティのベストプラクティス

### ✅ すべきこと
- Token は `.env` ファイルに保存し、`.gitignore` に追加
- Token は定期的に再生成（90日ごと推奨）
- 必要最小限のスコープのみ付与
- Token は絶対にコミットしない
- Organization の場合は SSO を有効化

### ❌ してはいけないこと
- Token をコードに直接記述
- Token を公開リポジトリにコミット
- Token を共有
- 不要なスコープを付与
- Token を平文でメッセージに含める

## Fine-grained Personal Access Token (推奨)

より細かい権限管理が可能な Fine-grained PAT の使用を推奨します:

1. https://github.com/settings/tokens?type=beta にアクセス
2. **"Generate new token"** をクリック
3. Token の詳細を設定:
   - **Repository access**: 特定のリポジトリを選択
   - **Permissions**:
     - Repository permissions:
       - Contents: Read and write
       - Issues: Read and write
       - Pull requests: Read and write
       - Workflows: Read and write
     - Organization permissions:
       - Projects: Read and write
4. Token を生成してコピー
5. `.env` ファイルに保存

## 関連機能

以下の機能で GitHub Token が必要です:

### プロジェクト管理
```bash
npm run project:info      # プロジェクト情報の取得
npm run project:add       # Issue/PR をプロジェクトに追加
npm run project:report    # プロジェクトレポート生成
```

### 並列作業自動化
```bash
npm run agents:parallel:issues    # Issue の並列処理
npm run agents:parallel:todos     # TODO の並列処理
```

### KPI 収集
```bash
npm run kpi:collect              # KPI データの収集
npm run dashboard:generate       # ダッシュボード生成
```

## 参考リンク

- [GitHub Personal Access Tokens Documentation](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/managing-your-personal-access-tokens)
- [GitHub Projects V2 API](https://docs.github.com/en/issues/planning-and-tracking-with-projects/automating-your-project/using-the-api-to-manage-projects)
- [GitHub CLI Authentication](https://cli.github.com/manual/gh_auth_login)

## サポート

問題が解決しない場合は、Issue を作成してください:
https://github.com/ShunsukeHayashi/Autonomous-Operations/issues/new
