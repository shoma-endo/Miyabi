# Termux環境でのMiyabi使用ガイド

Termux（Android）環境でMiyabiを使用するための完全ガイドです。

## 📱 動作環境

### サポート状況
- ✅ **基本機能**: Agent実行、Issue処理、PR作成
- ⚠️ **対話モード**: 制限あり（自動的にCLIモード優先）
- ✅ **GitHub統合**: 完全サポート
- ✅ **TypeScript**: 完全サポート

### 推奨スペック
- **Android**: 8.0以上
- **RAM**: 4GB以上推奨
- **ストレージ**: 2GB以上の空き容量
- **インターネット**: 安定した接続

## 🚀 インストール手順

### 1. Termuxのセットアップ

```bash
# Termuxアプリをインストール（Google PlayまたはF-Droid）
# https://termux.dev/

# パッケージを更新
pkg update && pkg upgrade -y

# 必要なパッケージをインストール
pkg install -y nodejs git gh
```

### 2. Node.jsバージョン確認

```bash
node --version
# v20以上推奨（v18でも動作可能）

npm --version
# v9以上推奨
```

### 3. GitHub認証

```bash
# GitHub CLIで認証（推奨）
gh auth login

# 画面の指示に従って認証
# - Account: GitHub.com
# - Protocol: HTTPS
# - Authenticate: Browser または Token
```

### 4. Miyabiのインストール

```bash
# グローバルインストール（推奨）
npm install -g miyabi

# または既存プロジェクトに追加
cd your-project
npx miyabi install
```

## 📋 既知の問題と回避方法

### 1. ロケール設定エラー

**問題**:
```bash
warning: setlocale: LC_ALL: cannot change locale (ja_JP.UTF-8)
```

**回避方法**:
```bash
# .bashrcに追加
echo 'export LC_ALL=C' >> ~/.bashrc
source ~/.bashrc

# または環境変数を直接設定
export LC_ALL=C
export LANG=C
```

**影響**: 警告メッセージが表示されるが、機能には影響なし

### 2. 対話モード制限

**問題**: Termux環境では対話形式のプロンプトが正常に動作しない場合があります。

**回避方法**: CLIモードを使用
```bash
# ❌ 対話モード（動作しない場合あり）
miyabi

# ✅ CLIモード（推奨）
miyabi init my-project
miyabi install --dry-run
miyabi status
miyabi docs
```

**Note**: v0.5.0以降、Termux環境を自動検出してCLIモード優先に切り替わります。

### 3. GitHub認証トークンの期限切れ

**問題**:
```bash
HTTP 401: Bad credentials
The token in ~/.config/gh/hosts.yml is invalid
```

**解決方法**:
```bash
# gh CLIで再認証
gh auth refresh

# または新しいトークンで再ログイン
gh auth login

# トークンの状態確認
gh auth status
```

### 4. メモリ不足エラー

**問題**: 大規模なプロジェクトでAgent実行時にメモリ不足が発生

**回避方法**:
```bash
# 並列実行数を減らす
npm run agents:parallel:exec -- --issue 123 --concurrency 1

# または環境変数で制御
export DEFAULT_CONCURRENCY=1
```

### 5. Git push認証エラー

**問題**:
```bash
git: 'credential-!gh' is not a git command
Authentication failed for 'https://github.com/...'
```

**解決方法**:
```bash
# Git credential helperを修正
git config --global --unset-all credential.helper
git config --global credential.helper store

# 認証情報を手動設定
git config --global --unset credential.https://github.com.helper
gh auth setup-git
```

## ⚙️ 推奨設定

### .env ファイル

```bash
# Termux向け設定例
DEVICE_IDENTIFIER=Termux-Android
GITHUB_TOKEN=  # gh CLIを使用するため不要
ANTHROPIC_API_KEY=sk-ant-xxxxx
LOG_DIRECTORY=.ai/logs
REPORT_DIRECTORY=.ai/parallel-reports
DEFAULT_CONCURRENCY=1  # Termuxでは低めに設定
USE_TASK_TOOL=false
USE_WORKTREE=false
```

### ストレージアクセス

```bash
# 内部ストレージへのアクセスを許可
termux-setup-storage

# ホームディレクトリ
~/storage/shared/

# プロジェクト作業は ~/storage/shared/projects/ を推奨
mkdir -p ~/storage/shared/projects
cd ~/storage/shared/projects
```

## 🔧 トラブルシューティング

### バッテリー最適化を無効化

Androidの設定でTermuxのバッテリー最適化を無効にすると、バックグラウンド実行が安定します。

1. 設定 → アプリ → Termux
2. バッテリー → 最適化しない

### ウェイクロックの取得

長時間実行するAgentの場合:
```bash
# Termux APIをインストール
pkg install termux-api

# ウェイクロックを取得
termux-wake-lock

# 実行後に解放
termux-wake-unlock
```

### ログの確認

```bash
# Agent実行ログ
cat .ai/logs/*.md

# 並列実行レポート
cat .ai/parallel-reports/*.json

# システムログ
logcat | grep miyabi
```

## 📊 パフォーマンス最適化

### 並列実行の調整

```bash
# 低スペック端末（RAM 2-4GB）
export DEFAULT_CONCURRENCY=1

# 中スペック端末（RAM 4-6GB）
export DEFAULT_CONCURRENCY=2

# 高スペック端末（RAM 6GB以上）
export DEFAULT_CONCURRENCY=3
```

### スワップファイルの作成

```bash
# スワップ領域を作成（root権限必要）
# Termuxではrootアクセスが制限されているため非推奨
# 代わりにメモリ使用量を最適化
```

### 不要なプロセスの停止

```bash
# 他のアプリを終了してメモリを確保
# バックグラウンドタスクを最小限に
```

## 💡 ベストプラクティス

### 1. バッテリー管理
- 充電中に長時間実行タスクを実行
- ウェイクロックを活用

### 2. ネットワーク
- Wi-Fi接続推奨（モバイルデータの場合は注意）
- 安定した接続環境で実行

### 3. ストレージ
- 定期的に `.ai/logs/` をクリーンアップ
- ログファイルが肥大化しないよう監視

```bash
# 古いログを削除（7日以上前）
find .ai/logs -name "*.md" -mtime +7 -delete
```

### 4. セキュリティ
- `.env` ファイルにトークンを保存しない
- `gh auth login` を使用
- Termuxアプリにロックを設定

## 🆘 サポート

### コミュニティ
- GitHub Discussions: https://github.com/ShunsukeHayashi/Miyabi/discussions
- Issues: https://github.com/ShunsukeHayashi/Miyabi/issues

### よくある質問

**Q: Termuxで完全に動作しますか？**
A: はい、コアな機能はすべて動作します。対話モードに制限がありますが、CLIモードで代替可能です。

**Q: バッテリー消費は？**
A: Agent実行中はCPU/ネットワークを使用するため、バッテリー消費は多めです。充電中の実行を推奨します。

**Q: 他のAndroidターミナルアプリは？**
A: Termux以外（Userland、Linux Deployなど）では未検証ですが、Node.js 18+とgh CLIがあれば動作する可能性があります。

**Q: rootは必要？**
A: 不要です。通常のTermux環境で動作します。

## 📚 関連ドキュメント

- [README](../README.md) - プロジェクト概要
- [GETTING_STARTED](../GETTING_STARTED.md) - セットアップガイド
- [SECURITY](../SECURITY.md) - セキュリティベストプラクティス
- [FOR_NON_PROGRAMMERS](../FOR_NON_PROGRAMMERS.md) - 初心者向けガイド

---

**最終更新**: 2025-10-09
**対応バージョン**: Miyabi v2.0.0+
**プラットフォーム**: Termux on Android 8.0+
