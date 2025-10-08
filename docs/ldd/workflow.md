# Log-Driven Development (LDD) Workflow Template

LDDは、思考プロセスと作業結果を完全にログへ記録することを目的とした運用手法です。以下のテンプレートを基に各タスクで必要情報を整理してください。

## 1. codex_prompt_chain
```yaml
intent: "タスクの目的を1文で記載"
plan:
  - "主要ステップを列挙"
  - "..."
implementation:
  - "編集/追加したファイルを記録"
verification:
  - "実行したテスト or 検証ステップ"
```

## 2. tool_invocations
```yaml
- command: "実行コマンド"
  workdir: "実行ディレクトリ"
  timestamp: "ISO8601"
  status: "passed/failed"
  notes: "補足"
```

## 3. memory_bank_updates
```yaml
- section: "@memory-bank.mdc の更新セクション"
  summary: "追記内容の概要"
  timestamp: "ISO8601"
```

## 4. Workflow Steps
1. **状況認識**: `.ai/` ドキュメントと `@memory-bank.mdc` を確認。
2. **タスク計画**: codex_prompt_chainの`intent`と`plan`を定義。
3. **実装/編集**: 密結合な変更を避け、既存スタイルに合わせる。
4. **検証**: `make fmt` → `make lint` → `make test` を優先的に実行（存在する場合）。
5. **報告**: 変更要約、テスト結果、次のアクションをユーザーに報告。

## 5. Logging Policy
- ログファイル命名規則: `.ai/logs/YYYYMMDD-HHMM-{task}.yaml`
- 更新タイミング: タスク開始時、重要イベント後、タスク完了時。
- 保持期間: 最低90日（削除ポリシーは今後定義）。

## 6. Quality Gates
| ゲート | 条件 | 承認者 |
| ------ | ---- | ------ |
| PRD承認 | `.ai/prd.md` チェックボックスが全てON | ユーザー |
| ARCH承認 | `.ai/arch.md` チェックボックスが全てON | ユーザー |
| テストパス | 主要テストが成功 | コードオーナー |

## 7. Handoff Summary Template
```markdown
## Handoff Summary
- 状態:
- 対象ブランチ/コミット:
- 未完了作業:
- 推奨次ステップ:
```

> 実タスクでのすべての入力例は `.ai/logs/` に保存してください。
