# スターター

このディレクトリには、この章の提出用の記入ファイルを置いています。

## 使い方

1. 章ディレクトリから、`submission/<github-account>/` を作る。
2. 必要なファイルを `submission/<github-account>/` にコピーする。
3. コピーした提出物を自分の回答で埋める。
4. `README.md` のチェックリストを確認する。

`<github-account>` は自分のGitHubアカウント、または講師が指定した一意なIDに置き換えてください。
提出物には、秘密情報、実在の個人情報、実在の顧客情報、本番データ、本番ログ、社内限定リンクを入れないでください。
AIを使った場合は、影響範囲の候補を検索、差分、テスト、手動確認で検証し、採用した提案と採用しなかった提案を残してください。

例:

```bash
mkdir -p submission/<github-account>
find starter -maxdepth 1 -type f ! -name README.md ! -name .gitkeep -exec cp {} submission/<github-account>/ \;
```

## ファイル

- `change-impact-analysis.md`
- `existing-behavior-inventory.md`
- `improvement-pr-summary.md`
- `migration-note.md`
- `regression-test-plan.md`
- `release-note.md`
- `safe-change-plan.md`
