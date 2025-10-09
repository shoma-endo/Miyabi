---
title: "Prompt Template"
category: "template"
version: "1.0.0"
updated: "2025-10-09"
author: "AI Operations Lead"
tags: ["template", "scaffold"]
---

# {Prompt Title}

**Agent**: {AgentName}
**用途**: {何のためのプロンプトか}
**バージョン**: {semantic version}

---

## Intent (意図)

{5-7語で何を達成するか明確に記述}

---

## Plan (計画)

1. **{ステップ1}** - {5-7語の説明}
2. **{ステップ2}** - {5-7語の説明}
3. **{ステップ3}** - {5-7語の説明}

---

## Implementation (実装詳細)

### 前提条件

```yaml
prerequisites:
  - {必要な環境変数}
  - {必要なツール}
  - {必要な権限}
```

### 実行手順

```typescript
// コード例
```

### 期待される出力

```yaml
output:
  type: "{出力形式}"
  location: "{保存先パス}"
  format: "{JSON/YAML/Markdown等}"
```

---

## Verification (検証)

### 完了条件

- [ ] {数値化可能な条件1}
- [ ] {数値化可能な条件2}
- [ ] {数値化可能な条件3}

### 品質基準

```yaml
quality_criteria:
  threshold: 80
  scoring:
    - metric: "{メトリクス名}"
      weight: {重み}
      target: {目標値}
```

---

## Escalation (エスカレーション)

### エスカレーション条件

| 条件 | Target | アクション |
|------|--------|-----------|
| {条件1} | TechLead | {具体的なアクション} |
| {条件2} | CISO | {具体的なアクション} |
| {条件3} | PO | {具体的なアクション} |

---

## Examples (実行例)

### 成功例

```bash
# コマンド
{実行コマンド}

# 出力
{成功時の出力}
```

### 失敗例・リトライ

```bash
# エラー
{エラーメッセージ}

# 解決策
{対処方法}
```

---

## Related Documents (関連ドキュメント)

- {関連ドキュメント1}
- {関連ドキュメント2}

---

## 変更履歴

### v1.0.0 (2025-10-09)
- 初版作成
- テンプレート構造確定

---

🤖 Generated with Claude Code
Co-Authored-By: Claude <noreply@anthropic.com>
