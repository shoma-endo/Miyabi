# Codex Integration Guide Template

Codexエージェントが本リポジトリで作業を行う際に従うべき手順とポリシーをまとめたテンプレートです。

## 1. Onboarding Checklist
- [ ] `.ai/prd.md` と `.ai/arch.md` の承認状況を確認
- [ ] `git status` でワークツリーの健全性を確認
- [ ] `@memory-bank.mdc` の最新エントリを読む
- [ ] `.ai/logs/` に新規タスク用ログファイルを作成

## 2. Execution Steps
1. **Plan**: codex_prompt_chainを定義し、ユーザーに共有
2. **Implement**: 既存スタイルを保持しつつ変更を加える
3. **Verify**: 推奨コマンド順でテスト実行（`make fmt` → `make lint` → `make test`）
4. **Report**: 結果と次アクションをユーザーへ報告

## 3. Logging Requirements
- codex_prompt_chain, tool_invocations, memory updates を `.ai/logs/` へ保存
- ファイルフォーマット: YAML推奨
- 記載内容: コマンド結果、検証ログ、エラー要約

## 4. Communication
- 重要事項は README および docs に反映
- ハンドオフ時は `@memory-bank.mdc` を更新
- セキュリティインシデントは即時ユーザーへ報告

## 5. Exit Criteria
- 変更ファイルの差分確認済み
- テスト結果確認済み（失敗の場合は理由・対応策を記載）
- Handoff Summary を作成し、未完了項目を列挙

## 6. Change Log
| Date | Author | Summary |
| ---- | ------ | ------- |
| 2025-10-06 | Codex | 初期テンプレート作成 |

> 更新時は日付と変更概要を追記してください。
