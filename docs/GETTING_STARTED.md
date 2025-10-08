# 🌟 Getting Started — 超初心者向けガイド

**Agentic OS**へようこそ！

このガイドは、**プログラミング初心者**や**Claude Code/AI Agentを初めて使う方**向けに、
**誰でも簡単にAIと一緒に開発できる**ように作られています。

専門知識は一切不要です！質問に答えるだけで、AIが自動的に作業を進めます。

---

## 🎯 このガイドでできること

- AIエージェントに仕事を依頼する方法がわかる
- Claude Code Task Toolの使い方がわかる
- 自分のタスクを自動実行できるようになる
- GitHub Issueから自動的に開発が進む仕組みがわかる

---

## 📋 必要なもの

以下のツールをインストールしてください（全部無料です）:

| ツール | 説明 | インストール |
|--------|------|--------------|
| **Node.js** | JavaScriptの実行環境 | [nodejs.org](https://nodejs.org/) |
| **Git** | バージョン管理ツール | [git-scm.com](https://git-scm.com/) |
| **GitHub CLI** | GitHubをコマンドで操作 | [cli.github.com](https://cli.github.com/) |
| **Claude Code** | AI開発アシスタント | [Anthropic](https://www.anthropic.com/) |

### インストール確認

以下のコマンドでインストールを確認できます:

```bash
node --version   # v20以上
git --version    # 任意のバージョン
gh --version     # 任意のバージョン
```

---

## 🚀 3ステップで始める

### Step 1: プロジェクトをセットアップ

```bash
# リポジトリをクローン
git clone https://github.com/ShunsukeHayashi/Autonomous-Operations.git
cd Autonomous-Operations

# 依存関係をインストール
npm install

# GitHub CLIでログイン
gh auth login
```

### Step 2: 初心者ガイドを起動

```bash
npm start
```

このコマンドを実行すると、**対話型ガイド**が起動します。

質問に答えるだけで、自動的に:
- GitHub Issueが作成される
- タスクの準備が整う
- 次にやることが表示される

### Step 3: Claude CodeでTaskを実行

ガイドが表示する指示に従って、Claude Codeのチャットで:

```
Issue #<番号>を実行してください
```

と送信するだけ！

AIエージェントが自動的に:
- コードを生成
- テストを実行
- Pull Requestを作成

してくれます。

---

## 📖 使い方の例

### 例1: 最初のタスクを作成する

```bash
# 初心者ガイドを起動
npm start
```

**対話が始まります:**

```
🌍 Agentic OS へようこそ！

Step 1: 環境をチェックしています...
✔ Node.js: v20.10.0
✔ npm: 10.2.0
✔ Git: 2.42.0
⚠ GitHub CLI: インストールされていません (オプション)

すべての環境チェックに合格しました！

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Step 2: Claude Codeとは？

Claude Codeは、AIがコードを書いてくれる強力なツールです。

特徴:
• コードの自動生成
• バグの自動修正
• ドキュメントの自動作成
• テストの自動実行

あなたは「何をしたいか」を伝えるだけ！
Claude Codeが自動的に作業を進めます。

理解できましたか？ (yes/no): yes

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Step 5: 最初のタスクを作成しましょう！

質問 1/5: 何を作りたいですか？
例: ログイン機能、ダッシュボード、APIエンドポイント など
>> ログイン機能

質問 2/5: もう少し詳しく教えてください
例: ユーザー名とパスワードでログインできるようにしたい
>> ユーザー名とパスワードでログインできるようにしたい

質問 3/5: どのくらい急ぎですか？
1: すぐやりたい / 2: できれば早めに / 3: 時間があるとき
>> 2

質問 4/5: どのくらい時間がかかりそうですか？
1: 1時間以内 / 2: 数時間 / 3: 1日くらい / 4: わからない
>> 2

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📋 タスク内容

タイトル: ログイン機能

説明: ユーザー名とパスワードでログインできるようにしたい

優先度: high

推定時間: 180分

この内容でGitHub Issueを作成しますか？ (yes/no): yes

🚀 GitHub Issueを作成しています...
✔ Issue作成完了！

Issue URL: https://github.com/ShunsukeHayashi/Autonomous-Operations/issues/7

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🎉 完成！次のステップ

おめでとうございます！
最初のIssueが作成されました！

次にやること:

1️⃣ Claude Codeを起動
2️⃣ 以下のコマンドを実行:

   npm run task -- --issue 7

3️⃣ Agentが自動的に作業を開始します！

あとは待つだけです。
Agentが完了したら通知が来ます。
```

### 例2: 既存のIssueを実行する

```bash
# Issue #4を実行
npm run task -- --issue 4
```

**画面に表示される内容:**

```
🤖 Agentic OS — Task Executor

📥 Issue #4を読み込んでいます...
✔ Issue取得完了

📋 Issue #4
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
[FEATURE] Implement rich CLI output styling system

• Add color scheme
• Add progress bars
• Add spinners
• Add boxes
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🔍 タスクを分析しています...

Agent種類: general-purpose
推定時間: 180分
複雑度: high
状態: OPEN

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

⚡ Task Tool実行の準備完了

これから、Claude Code Task Toolを使って
このタスクを自動実行します。

Agentが自動的に:
• コードを生成・修正
• テストを実行
• Pull Requestを作成

所要時間: 約180分

実行しますか？ (yes/no): yes

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📝 コピー用テキスト

Claude Codeのチャットで、以下をコピー&ペーストしてください:

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Issue #4を実行してください。

タスク詳細:
タイトル: Implement rich CLI output styling system

説明:
[Issue本文]

推定時間: 180分
複雑度: high

以下の手順で実行してください:
1. Issue #4の要件を確認
2. 必要なファイルを作成・修正
3. TypeScript strict modeでコードを書く
4. ユニットテストを作成（カバレッジ>80%）
5. 全テストがパスすることを確認
6. Pull Requestを作成

参考資料:
- .github/WORKFLOW_RULES.md
- docs/CLAUDE_CODE_TASK_TOOL.md

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

これをコピーして、Claude Codeに送信してください！

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✨ 実行後の流れ

• 1. Claude Codeがタスクを解析
• 2. 適切なAgentが自動起動
• 3. Agentがコードを生成・テスト実行
• 4. Pull Requestが自動作成される
• 5. Guardianがレビュー
• 6. 承認されたらマージ

✅ 準備完了！Claude Codeでタスクを実行してください！
```

---

## 🤖 Claude Code Task Toolとは？

**Task Tool**は、AIエージェントに仕事を依頼する仕組みです。

### 仕組み

```
あなた
  ↓ 「ログイン機能を作って」
Claude Code
  ↓ Task Toolを起動
AI Agent
  ↓ コードを自動生成
  ↓ テストを自動実行
  ↓ PRを自動作成
完成！
```

### 使い方

1. **npm run task -- --issue <番号>** を実行
2. 画面に表示される**コピー用テキスト**をコピー
3. Claude Codeのチャットに**ペースト**
4. 送信するだけ！

後はAIが全部やってくれます。

---

## 📊 よくある質問（FAQ）

### Q1: プログラミング初心者でも使えますか？

**A:** はい！このツールは初心者向けに設計されています。
質問に答えるだけで、AIが自動的にコードを書いてくれます。

### Q2: 何か壊してしまわないか心配です

**A:** 安心してください！
- すべての作業はGitで管理されているので、いつでも元に戻せます
- Pull Requestで変更内容を確認してからマージできます
- Guardianが最終チェックをするので安全です

### Q3: Claude Codeって何ですか？

**A:** AnthropicのAI開発アシスタントです。
コードを書いたり、バグを直したり、ドキュメントを作ったりできます。

### Q4: エージェントって何ですか？

**A:** 特定の仕事を自動的にやってくれるAIです。
例えば、CodeGenAgentはコードを書く専門家です。

### Q5: Task Toolって何ですか？

**A:** エージェントに仕事を依頼する仕組みです。
「〇〇を作って」と頼むと、自動的にエージェントが作業を開始します。

### Q6: どのくらい時間がかかりますか？

**A:** タスクの複雑さによります。
- 簡単なタスク: 30分〜1時間
- 中程度のタスク: 2〜3時間
- 複雑なタスク: 半日〜1日

画面に推定時間が表示されます。

### Q7: エラーが出たらどうすればいいですか？

**A:** 慌てずに:
1. エラーメッセージを読む
2. docs/フォルダのガイドを確認
3. GitHub Issuesで質問する
4. Guardian (@ShunsukeHayashi) に連絡

### Q8: 費用はかかりますか？

**A:** Claude CodeのAPIは有料ですが、
このプロジェクトでは予算管理機能があるので安心です。
`BUDGET.yml`で上限を設定できます。

---

## 📚 次に読むべきドキュメント

初心者向け（必読）:
- ✅ **このガイド (GETTING_STARTED.md)** ← 今ココ！
- 📖 **[CLAUDE_CODE_TASK_TOOL.md](./CLAUDE_CODE_TASK_TOOL.md)** — Task Toolの詳しい使い方
- 📖 **[WORKFLOW_RULES.md](../.github/WORKFLOW_RULES.md)** — Issue-Driven Development

中級者向け:
- 📖 **[PARALLEL_WORK_ARCHITECTURE.md](./PARALLEL_WORK_ARCHITECTURE.md)** — 並行作業の仕組み
- 📖 **[AGENTS.md](../AGENTS.md)** — エージェントの詳細
- 📖 **[GITHUB_OS_INTEGRATION_PLAN.md](./GITHUB_OS_INTEGRATION_PLAN.md)** — GitHub OS化計画

上級者向け:
- 📖 **[AGENTIC_OS.md](./AGENTIC_OS.md)** — Agentic OSのビジョン
- 📖 **[OSS_DEVELOPMENT_SYSTEM.md](./OSS_DEVELOPMENT_SYSTEM.md)** — OSS開発システム設計

---

## 🆘 困ったときは

### サポートチャンネル

| 方法 | 説明 |
|------|------|
| **GitHub Issues** | バグ報告・機能要望 |
| **Guardian** | @ShunsukeHayashi に連絡 |
| **Twitter/X** | [@The_AGI_WAY](https://x.com/The_AGI_WAY) |
| **Note** | [https://note.ambitiousai.co.jp/](https://note.ambitiousai.co.jp/) |

### よくあるエラーと解決方法

#### エラー1: "gh: command not found"

**原因:** GitHub CLIがインストールされていない

**解決方法:**
```bash
# macOS
brew install gh

# Windows
winget install GitHub.cli

# Linux
sudo apt install gh
```

#### エラー2: "Permission denied"

**原因:** GitHub CLIでログインしていない

**解決方法:**
```bash
gh auth login
```

画面の指示に従ってログインしてください。

#### エラー3: "Issue not found"

**原因:** 指定したIssue番号が存在しない

**解決方法:**
```bash
# 存在するIssueを確認
gh issue list
```

#### エラー4: "npm install failed"

**原因:** Node.jsのバージョンが古い

**解決方法:**
```bash
# Node.jsをアップデート
# macOS
brew upgrade node

# Windows/Linux: nodejs.orgから最新版をダウンロード
```

---

## 🎉 次のステップ

おめでとうございます！これで基本的な使い方がわかりました！

**次にやること:**

1. **npm start** で最初のタスクを作成
2. Claude Codeでタスクを実行
3. Pull Requestを確認
4. マージして完成！

楽しんでください！🚀

---

## 📝 チートシート（よく使うコマンド）

```bash
# 初心者ガイドを起動
npm start

# タスクを実行
npm run task -- --issue <番号>

# デモを見る
npm run demo

# Issueを一覧表示
gh issue list

# Pull Requestを一覧表示
gh pr list

# プロジェクトの状態を確認
npm run agents:status
```

---

**Document Status:** ✅ Complete
**Target Audience:** 超初心者
**Next Steps:** npm start で始めよう！
