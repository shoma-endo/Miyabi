# 🌸 Miyabi Plugin Distribution Guide

このガイドでは、Miyabi Claude Code Pluginの配布方法とマーケットプレイス公開の手順を説明します。

## 📦 配布方法

### 方法1: GitHubリポジトリベースの配布（推奨）

最も標準的で推奨される配布方法です。

#### メンテナー側の手順

1. **プラグインファイルを準備**

```bash
# .claude-plugin/ ディレクトリが正しく構成されていることを確認
ls -la .claude-plugin/

# 必須ファイル:
# - plugin.json
# - marketplace.json
# - README.md
# - instructions.md
# - context.md
# - commands/
# - agents/
# - hooks/
```

2. **GitHubにプッシュ**

```bash
git add .claude-plugin/
git commit -m "feat: Add Claude Code plugin for Miyabi"
git push origin main
```

3. **リリースを作成（オプション）**

```bash
# GitHubでリリースを作成
gh release create v1.0.0 \
  --title "Miyabi Plugin v1.0.0" \
  --notes "Initial release of Miyabi Claude Code Plugin"
```

#### ユーザー側のインストール手順

```bash
# Claude Code内で実行

# ステップ1: マーケットプレイスを追加
/plugin marketplace add ShunsukeHayashi/Miyabi

# ステップ2: プラグインをインストール
/plugin install miyabi

# または、直接Git URLから
/plugin marketplace add https://github.com/ShunsukeHayashi/Miyabi.git
/plugin install miyabi
```

---

### 方法2: ローカル開発・テスト

ローカルでプラグインをテストする場合：

```bash
# Claude Code内で実行

# ローカルパスを追加
/plugin marketplace add file:///Users/shunsuke/Dev/Autonomous-Operations

# プラグインをインストール
/plugin install miyabi
```

---

### 方法3: プライベートリポジトリ

プライベートリポジトリの場合：

```bash
# GitHubトークンを使用
/plugin marketplace add https://github.com/ShunsukeHayashi/Miyabi.git --token ghp_xxxxx

# または、SSH URL
/plugin marketplace add git@github.com:ShunsukeHayashi/Miyabi.git
```

---

## 🎨 プラグインバリエーション

Miyabiは3つのバリエーションを提供します：

### 1. miyabi（フルパッケージ）- 推奨

すべての機能を含むフルセット。

```bash
/plugin install miyabi
```

**含まれる機能:**
- 7つの自律型Agent
- 10個のSlashコマンド
- 4つの自動化Hook
- MCP Server統合

### 2. miyabi-core（コア機能のみ）

基本機能のみの軽量版。

```bash
/plugin install miyabi-core
```

**含まれる機能:**
- `/miyabi-init` - プロジェクト初期化
- `/miyabi-status` - ステータス確認
- `/miyabi-auto` - 自動モード

### 3. miyabi-agents-only（Agent定義のみ）

Agent定義のみを使用したい場合。

```bash
/plugin install miyabi-agents-only
```

**含まれる機能:**
- 7つのAgent定義ファイル

---

## 📋 marketplace.json の構造

```json
{
  "name": "Miyabi Official Plugins",
  "description": "完全自律型AI開発プラットフォーム Miyabi の公式プラグインコレクション",
  "owner": {
    "name": "Shunsuke Hayashi",
    "url": "https://github.com/ShunsukeHayashi"
  },
  "repository": "https://github.com/ShunsukeHayashi/Miyabi",
  "version": "1.0.0",
  "plugins": [
    {
      "name": "miyabi",
      "source": ".",
      "version": "0.8.2",
      "description": "Miyabi 完全パッケージ - 7つのAgent、7つのコマンド、4つのHook",
      "category": "automation",
      "tags": ["ai", "agents", "devops", "automation", "github"],
      "author": "Shunsuke Hayashi",
      "license": "Apache-2.0",
      "featured": true
    },
    {
      "name": "miyabi-core",
      "source": "./plugins/miyabi-core",
      "version": "0.8.2",
      "description": "Miyabi コア機能のみ（init, status, auto）",
      "category": "productivity",
      "tags": ["ai", "automation"],
      "author": "Shunsuke Hayashi",
      "license": "Apache-2.0"
    },
    {
      "name": "miyabi-agents-only",
      "source": "./plugins/miyabi-agents",
      "version": "0.8.2",
      "description": "Miyabi の7つのAgent定義のみ",
      "category": "agents",
      "tags": ["ai", "agents"],
      "author": "Shunsuke Hayashi",
      "license": "Apache-2.0"
    }
  ]
}
```

### フィールド説明

| フィールド | 説明 | 必須 |
|-----------|------|------|
| `name` | マーケットプレイス名 | ✅ |
| `description` | マーケットプレイスの説明 | ❌ |
| `owner` | メンテナー情報 | ❌ |
| `repository` | リポジトリURL | ❌ |
| `version` | マーケットプレイスバージョン | ❌ |
| `plugins` | プラグインリスト | ✅ |

### プラグインエントリのフィールド

| フィールド | 説明 | 必須 |
|-----------|------|------|
| `name` | プラグイン名 | ✅ |
| `source` | プラグインソース（相対パス、GitHub、Git URL） | ✅ |
| `version` | プラグインバージョン | ❌ |
| `description` | プラグインの説明 | ❌ |
| `category` | カテゴリ（automation, productivity, etc.） | ❌ |
| `tags` | タグリスト | ❌ |
| `author` | 作者名 | ❌ |
| `license` | ライセンス | ❌ |
| `featured` | 推奨プラグイン（true/false） | ❌ |

---

## 🔄 バージョン管理

### セマンティックバージョニング

```
major.minor.patch
```

- **major**: 破壊的変更
- **minor**: 機能追加（後方互換性あり）
- **patch**: バグ修正

### バージョン更新手順

1. **plugin.jsonを更新**

```json
{
  "version": "1.1.0"
}
```

2. **marketplace.jsonを更新**

```json
{
  "version": "1.1.0",
  "plugins": [
    {
      "name": "miyabi",
      "version": "1.1.0"
    }
  ]
}
```

3. **GitHubにプッシュ**

```bash
git add .claude-plugin/
git commit -m "chore: Bump version to 1.1.0"
git push origin main

# タグを作成
git tag v1.1.0
git push origin v1.1.0
```

---

## 📢 マーケットプレイス公開

### オプション1: GitHub Releases

1. **リリースノートを作成**

```bash
gh release create v1.0.0 \
  --title "Miyabi Plugin v1.0.0" \
  --notes "$(cat CHANGELOG.md)"
```

2. **リリースページで告知**

- GitHub Discussions
- Twitter/X
- Discord/Slack

### オプション2: NPMパッケージとして公開（将来）

```bash
# package.json を作成
{
  "name": "@miyabi/claude-plugin",
  "version": "1.0.0",
  "files": [".claude-plugin/"]
}

# NPMに公開
npm publish
```

---

## 🛡️ セキュリティとベストプラクティス

### 1. シークレット管理

❌ **やってはいけないこと:**
```json
{
  "token": "ghp_xxxxx"  // 絶対に含めない！
}
```

✅ **推奨:**
```bash
# 環境変数を使用
export GITHUB_TOKEN=ghp_xxxxx
```

### 2. ignore.txtで除外

```txt
# シークレットファイル
.env
.env.*
*.key
*.pem

# 大きなファイル
node_modules/
dist/
```

### 3. バージョン管理

- **Git タグ**を使用してバージョンを追跡
- **CHANGELOG.md**で変更履歴を記録
- **Semantic Versioning**に従う

---

## 📊 使用統計とフィードバック

### GitHub Issues でフィードバック収集

```bash
# Issue テンプレートを作成
.github/ISSUE_TEMPLATE/plugin-feedback.md
```

### GitHub Discussions でコミュニティ構築

```bash
# Discussions カテゴリ:
- 📢 Announcements (リリース情報)
- 💡 Feature Requests (機能要望)
- 🐛 Bug Reports (バグ報告)
- 💬 Q&A (質問)
```

---

## 🔗 関連リンク

- **Repository**: https://github.com/ShunsukeHayashi/Miyabi
- **NPM Package**: https://www.npmjs.com/package/miyabi
- **Landing Page**: https://shunsukehayashi.github.io/Miyabi/landing.html
- **Documentation**: https://github.com/ShunsukeHayashi/Miyabi/tree/main/docs
- **Issues**: https://github.com/ShunsukeHayashi/Miyabi/issues
- **Discussions**: https://github.com/ShunsukeHayashi/Miyabi/discussions

---

## 📝 チェックリスト

配布前の最終確認：

### メンテナー側

- [ ] `.claude-plugin/plugin.json` が正しく設定されている
- [ ] `.claude-plugin/marketplace.json` が正しく設定されている
- [ ] `.claude-plugin/README.md` が詳細に書かれている
- [ ] `.claude-plugin/instructions.md` がClaude Code向けに最適化されている
- [ ] `.claude-plugin/context.md` にプロジェクト情報が記載されている
- [ ] コマンドファイル（`.claude-plugin/commands/*.md`）が揃っている
- [ ] エージェントファイル（`.claude-plugin/agents/*.md`）が揃っている
- [ ] フックスクリプト（`.claude-plugin/hooks/*.sh`）が実行可能
- [ ] バージョン番号が一致している
- [ ] `.claude-plugin/ignore.txt` で不要ファイルを除外している
- [ ] GitHubにプッシュされている
- [ ] リリースが作成されている（オプション）

### ユーザー側

- [ ] GitHubリポジトリが公開されている
- [ ] Claude Codeがインストールされている（>=2.0.0）
- [ ] `/plugin marketplace add` でマーケットプレイスを追加
- [ ] `/plugin install miyabi` でインストール
- [ ] `/miyabi-status` でプラグインが動作することを確認

---

## 🎉 配布完了！

Miyabi Claude Code Pluginの配布準備が完了しました。

ユーザーは以下のコマンドでインストールできます：

```bash
/plugin marketplace add ShunsukeHayashi/Miyabi
/plugin install miyabi
```

---

🌸 **Miyabi** - Beauty in Autonomous Development
