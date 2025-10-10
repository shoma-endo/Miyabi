---
description: ドキュメント自動生成
---

# Miyabi ドキュメント自動生成

コード内のコメント、型定義、関数シグネチャからREADME、APIドキュメント、アーキテクチャ図を自動生成します。

## MCPツール

### `miyabi__docs`
ドキュメントを自動生成

**パラメータ**:
- `type`: ドキュメントタイプ（readme/api/architecture/all）
- `format`: 出力形式（markdown/html/pdf）
- `output`: 出力先パス（デフォルト: `./docs`）
- `include`: 対象ファイルパターン（デフォルト: `src/**/*.{ts,js}`）

**使用例**:
```
README自動生成:
miyabi__docs({ type: "readme" })

APIドキュメント生成（HTML形式）:
miyabi__docs({ type: "api", format: "html" })

アーキテクチャ図生成:
miyabi__docs({ type: "architecture", format: "markdown" })

全ドキュメント生成:
miyabi__docs({ type: "all", output: "./docs" })

特定ディレクトリのドキュメント:
miyabi__docs({ type: "api", include: "src/agents/**/*.ts" })
```

## 動作フロー

```
コードベース解析
    ↓
型定義・コメント抽出
    ↓
ドキュメントタイプ別処理
    ↓
├─ README: プロジェクト概要・使い方
├─ API: 関数・クラス・型のリファレンス
├─ Architecture: 構造図・フロー図
└─ All: 上記全て
    ↓
フォーマット変換（Markdown/HTML/PDF）
    ↓
出力先に保存
    ↓
リンク・索引生成
```

## ドキュメントタイプ

### 1. README生成

**対象**: プロジェクト全体

**生成内容**:
- プロジェクト概要
- インストール手順
- 使用方法・コード例
- 設定ファイルの説明
- 環境変数一覧
- 貢献ガイド

**出力**: `README.md`

**例**:
```bash
npx miyabi docs readme
```

生成されるREADME.md:
```markdown
# Project Name

## 概要
このプロジェクトは...

## インストール
\`\`\`bash
npm install
\`\`\`

## 使い方
\`\`\`typescript
import { Agent } from './agents';
const agent = new Agent();
\`\`\`

## 設定
\`\`\`bash
GITHUB_TOKEN=xxx
ANTHROPIC_API_KEY=xxx
\`\`\`

## ライセンス
MIT
```

### 2. APIドキュメント生成

**対象**: 関数・クラス・型定義

**生成内容**:
- 関数シグネチャ
- パラメータ説明
- 戻り値の型
- 使用例
- 関連型定義

**出力**: `docs/api/`

**例**:
```bash
npx miyabi docs api --format html
```

生成されるAPI.md:
```markdown
# API Reference

## Classes

### CoordinatorAgent

タスクを分析・分解する統括Agent

**コンストラクタ**:
\`\`\`typescript
constructor(config: AgentConfig)
\`\`\`

**メソッド**:

#### analyze(issueId: number): Promise<TaskDAG>

Issueを分析してタスクDAGを生成

**パラメータ**:
- `issueId`: Issue番号

**戻り値**:
- `Promise<TaskDAG>`: タスク依存関係グラフ

**使用例**:
\`\`\`typescript
const coordinator = new CoordinatorAgent(config);
const dag = await coordinator.analyze(123);
\`\`\`

## Functions

### executeAgent(agent: string, target: string): Promise<void>

指定したAgentを実行

**パラメータ**:
- `agent`: Agent名
- `target`: 対象リソース

**使用例**:
\`\`\`typescript
await executeAgent('codegen', '123');
\`\`\`
```

### 3. アーキテクチャ図生成

**対象**: プロジェクト構造・依存関係

**生成内容**:
- ディレクトリ構造図
- モジュール依存関係図
- データフロー図
- Agent階層図
- クラス図

**出力**: `docs/architecture/`

**例**:
```bash
npx miyabi docs architecture
```

生成されるARCHITECTURE.md:
```markdown
# Architecture

## ディレクトリ構造

\`\`\`
Miyabi/
├── agents/
│   ├── coordinator/
│   ├── codegen/
│   └── review/
├── packages/
│   └── cli/
├── scripts/
└── docs/
\`\`\`

## Agent階層

\`\`\`mermaid
graph TD
  A[Water Spider Agent] --> B[CoordinatorAgent]
  B --> C[CodeGenAgent]
  B --> D[ReviewAgent]
  B --> E[PRAgent]
\`\`\`

## データフロー

\`\`\`mermaid
sequenceDiagram
  WaterSpider->>GitHub: Issue取得
  GitHub->>CoordinatorAgent: Issue情報
  CoordinatorAgent->>CodeGenAgent: タスク依頼
  CodeGenAgent->>GitHub: コードコミット
\`\`\`
```

### 4. 全ドキュメント生成

**対象**: プロジェクト全体

**生成内容**:
- README.md
- API Reference
- Architecture
- CONTRIBUTING.md
- CHANGELOG.md（既存commitから生成）

**出力**: `docs/`

**例**:
```bash
npx miyabi docs all
```

## コマンドライン実行

MCPツールの代わりにコマンドラインでも実行可能:

```bash
# README生成
npx miyabi docs readme

# APIドキュメント生成（Markdown形式）
npx miyabi docs api --format markdown

# APIドキュメント生成（HTML形式）
npx miyabi docs api --format html --output ./public/docs

# アーキテクチャ図生成
npx miyabi docs architecture

# 全ドキュメント生成
npx miyabi docs all

# 特定ディレクトリのみ
npx miyabi docs api --include "src/agents/**/*.ts"

# PDF出力（要Pandoc）
npx miyabi docs api --format pdf

# ウォッチモード（変更時に自動再生成）
npx miyabi docs api --watch
```

## 環境変数

`.env` ファイルに以下を設定（オプション）:

```bash
# GitHub統合（Issueからドキュメント生成）
GITHUB_TOKEN=ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
REPOSITORY=owner/repo

# PDF生成用（Pandoc使用時）
PANDOC_PATH=/usr/local/bin/pandoc
```

## 出力形式

### Markdown形式（デフォルト）

```bash
npx miyabi docs api --format markdown
```

出力:
```
docs/
├── README.md
├── api/
│   ├── agents.md
│   ├── utils.md
│   └── types.md
└── architecture/
    └── overview.md
```

### HTML形式

```bash
npx miyabi docs api --format html
```

出力:
```
docs/
├── index.html
├── api/
│   ├── agents.html
│   ├── utils.html
│   └── types.html
├── css/
│   └── style.css
└── js/
    └── search.js
```

機能:
- 検索機能
- シンタックスハイライト
- レスポンシブデザイン
- ナビゲーションメニュー

### PDF形式（要Pandoc）

```bash
npx miyabi docs api --format pdf
```

出力:
```
docs/
└── api-reference.pdf
```

要件:
```bash
# Pandocインストール（macOS）
brew install pandoc

# Pandocインストール（Linux）
sudo apt-get install pandoc

# Pandocインストール（Termux）
pkg install pandoc
```

## コメント記法

ドキュメント生成に使用されるコメント形式:

### TSDoc形式（推奨）

```typescript
/**
 * Issueを分析してタスクDAGを生成
 *
 * @param issueId - Issue番号
 * @param options - 分析オプション
 * @returns タスク依存関係グラフ
 * @throws {APIError} API呼び出し失敗時
 *
 * @example
 * ```typescript
 * const coordinator = new CoordinatorAgent(config);
 * const dag = await coordinator.analyze(123);
 * ```
 */
async analyze(issueId: number, options?: AnalyzeOptions): Promise<TaskDAG> {
  // 実装
}
```

### JSDoc形式

```javascript
/**
 * ユーザーを認証
 * @function authenticate
 * @param {string} email - メールアドレス
 * @param {string} password - パスワード
 * @returns {Promise<User>} 認証済みユーザー
 */
async function authenticate(email, password) {
  // 実装
}
```

### クラス説明

```typescript
/**
 * タスクを統括するCoordinator Agent
 *
 * @class
 * @implements {IAgent}
 *
 * @remarks
 * このAgentはIssueを分析し、サブタスクへ分解します。
 * 識学理論に基づき、明確な責任と権限を持ちます。
 */
export class CoordinatorAgent implements IAgent {
  // 実装
}
```

## カスタマイズ

`.miyabi.yml` でドキュメント設定をカスタマイズ:

```yaml
docs:
  # 出力先
  output: "./docs"

  # 対象ファイル
  include:
    - "src/**/*.ts"
    - "agents/**/*.ts"

  # 除外ファイル
  exclude:
    - "**/*.test.ts"
    - "**/*.spec.ts"
    - "**/node_modules/**"

  # README設定
  readme:
    template: "./.templates/README.template.md"
    sections:
      - overview
      - installation
      - usage
      - configuration
      - contributing

  # API設定
  api:
    format: "markdown"
    groupBy: "module" # or "kind"
    includePrivate: false

  # Architecture設定
  architecture:
    diagrams:
      - directory-tree
      - dependency-graph
      - class-diagram
      - sequence-diagram
```

## 使用例

### 例1: プロジェクト初期セットアップ

```
あなた: "プロジェクトのREADMEを生成して"

Claude: [miyabi__docs({ type: "readme" }) を実行]

✅ README生成完了

生成ファイル:
  - README.md

内容:
  ✓ プロジェクト概要
  ✓ インストール手順
  ✓ 使用方法
  ✓ 設定ガイド
  ✓ 環境変数一覧

次のアクション:
  1. README.mdを確認
  2. 必要に応じて編集
  3. git add README.md
```

### 例2: APIリファレンス生成

```
あなた: "APIドキュメントをHTML形式で生成"

Claude: [miyabi__docs({ type: "api", format: "html" }) を実行]

✅ APIドキュメント生成完了

生成ファイル:
  - docs/index.html
  - docs/api/agents.html
  - docs/api/utils.html
  - docs/css/style.css

機能:
  ✓ 検索機能
  ✓ シンタックスハイライト
  ✓ レスポンシブデザイン

プレビュー:
  open docs/index.html

または:
  npx serve docs
  http://localhost:3000
```

### 例3: アーキテクチャ図生成

```
あなた: "アーキテクチャ図を生成して"

Claude: [miyabi__docs({ type: "architecture" }) を実行]

✅ アーキテクチャ図生成完了

生成ファイル:
  - docs/architecture/overview.md
  - docs/architecture/directory-tree.md
  - docs/architecture/dependency-graph.md

図:
  ✓ ディレクトリ構造図
  ✓ モジュール依存関係図（Mermaid）
  ✓ Agent階層図
  ✓ データフロー図

表示:
  cat docs/architecture/overview.md
```

### 例4: ウォッチモード

```
あなた: "APIドキュメントをウォッチモードで生成"

Claude: [Bashコマンド実行]
npx miyabi docs api --watch

📝 ドキュメント生成（ウォッチモード）

監視中: src/**/*.ts
出力先: docs/api/

[14:30:00] 初回生成完了
[14:32:15] 変更検出: src/agents/coordinator.ts
[14:32:16] 再生成完了

Ctrl+C で停止
```

## トラブルシューティング

### ドキュメント生成失敗

```
❌ Error: No TypeScript files found

解決策:
1. includeパターンを確認
2. src/配下にTypeScriptファイルがあるか確認
3. .miyabi.yml の設定を確認
```

### コメントが認識されない

```
⚠️  Warning: No JSDoc comments found in src/agents/coordinator.ts

解決策:
1. TSDoc/JSDoc形式でコメントを記述
2. /** */ 形式を使用（// は認識されない）
3. @param, @returns タグを追加
```

### PDF生成エラー

```
❌ Error: pandoc not found

解決策:
1. Pandocをインストール
   macOS: brew install pandoc
   Linux: sudo apt-get install pandoc
   Termux: pkg install pandoc
2. PATH環境変数を確認
```

### HTML出力が崩れる

```
⚠️  Warning: CSS not loaded

解決策:
1. docs/css/style.css が存在するか確認
2. 再生成: npx miyabi docs api --format html --force
3. ブラウザのキャッシュをクリア
```

## ベストプラクティス

### 🎯 推奨ワークフロー

**初期セットアップ**:
```bash
# 1. README生成
npx miyabi docs readme

# 2. 全ドキュメント生成
npx miyabi docs all

# 3. GitHub Pagesで公開
npx miyabi docs api --format html --output ./docs
git add docs/
git commit -m "docs: Add API documentation"
git push
```

**継続的更新**:
```bash
# コード変更時に自動更新
npx miyabi docs api --watch
```

### ⚠️ 注意事項

- **コメント必須**: ドキュメント生成にはTSDoc/JSDocコメントが必要
- **型定義**: TypeScriptの型定義が自動的にドキュメント化されます
- **バージョン管理**: `docs/`ディレクトリをgitに含めるか検討（生成物か否か）

### 📝 コメントの書き方

**Good**:
```typescript
/**
 * Issueを分析してタスクDAGを生成
 *
 * @param issueId - Issue番号
 * @returns タスク依存関係グラフ
 *
 * @example
 * ```typescript
 * const dag = await coordinator.analyze(123);
 * ```
 */
async analyze(issueId: number): Promise<TaskDAG> {
  // 実装
}
```

**Bad**:
```typescript
// Issue分析（コメント形式が不適切）
async analyze(issueId: number): Promise<TaskDAG> {
  // 実装
}
```

### 🎨 HTML出力のカスタマイズ

`docs/css/custom.css` を作成してスタイル上書き:

```css
/* カスタムテーマ */
:root {
  --primary-color: #007bff;
  --background-color: #f8f9fa;
  --text-color: #212529;
}

body {
  font-family: 'Inter', sans-serif;
}

.api-section {
  border-left: 4px solid var(--primary-color);
  padding-left: 1rem;
}
```

---

💡 **ヒント**: ドキュメントは「コードの鏡」です。コメントを充実させることで、高品質なドキュメントが自動生成されます。
