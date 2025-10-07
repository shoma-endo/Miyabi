# YAML Context Engineering Agent

## Overview
YAML Context Engineering Agentは、多様な情報ソースから階層的な文脈データを抽出し、YAMLベースのナレッジとして永続化する自律型ワークフローを構築する実験用リポジトリです。本プロジェクトでは、AIエージェントによるドキュメント整備・集約・活用の標準手順を確立することを目指します。

## Repository Structure
| Path | Description |
| ---- | ----------- |
| `.ai/` | プロダクトドキュメント、仕様、計画、ログテンプレート等の中枢管理ディレクトリ |
| `.ai/logs/` | ログ駆動開発 (LDD) のプロンプト連鎖・ツール実行ログを保存 |
| `docs/` | アーキテクチャ、ワークフロー、インテグレーション等の基礎ドキュメント群 |
| `AGENTS.md` | 参加エージェントの役割・権限・ハンドオフ手順 |
| `@memory-bank.mdc` | 進行中タスクの共有メモおよび意思決定ログ |

## Operational Workflow
1. `.ai/prd.md` と `.ai/arch.md` がユーザー承認されるまで実装着手禁止。
2. `.ai/logs/` に codex_prompt_chain / tool_invocations / memory_bank_updates を逐次記録。
3. 実装タスクは PR を Draft 状態で作成し、検証手順とテスト結果を明記。
4. ハンドオフ時に `@memory-bank.mdc` を更新し、次エージェントへ状況を共有。

## Getting Started
- **Python**: 3.9 系 (`.ai/requirements.txt` を参照)
- **セットアップ例**:
  ```bash
  python -m venv .venv
  source .venv/bin/activate
  pip install -r .ai/requirements.txt
  ```
- **推奨ツール**: `make fmt`, `make lint`, `make test` が存在しない場合は README/PRD 記載のコマンドを参照。

## Logging & Compliance
- ログ駆動開発 (LDD): codex_prompt_chain → tool_invocations → memory updates を各タスクで記録。
- 機密情報管理: リモートURLやログにアクセストークンを含めない。誤って共有した場合は即時ローテーション。

## Governance
| Area | Guideline |
| ---- | --------- |
| ブランチ運用 | `devin/{timestamp}-{feature}` 命名。`main` 直接作業は禁止。 |
| コミット規約 | Conventional Commits を厳守。1コミット1責務。 |
| レビュー | Draft PR で提出し、承認後スクワッシュマージ。 |
| セキュリティ | URLアクセス前の安全確認とファイル権限管理を徹底。 |

## Next Steps
- `.ai/prd.md` と `.ai/arch.md` のドラフト内容を補完し、承認を得る。
- `docs/` 配下テンプレートへ具体的なアーキテクチャ・運用情報を追記。
- LDDログ運用とメモリバンク更新の習慣化。
