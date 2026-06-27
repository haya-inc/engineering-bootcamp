# スターター

このディレクトリには、この章の提出用の記入ファイルを置いています。

## 使い方

1. 章ディレクトリから、`submission/<github-account>/` を作る。
2. 必要なファイルを `submission/<github-account>/` にコピーする。
3. コピーした提出物を自分の回答で埋める。
4. `README.md` のチェックリストを確認する。

`<github-account>` は自分のGitHubアカウント、または講師が指定した一意なIDに置き換えてください。
提出物、AI入力、PR説明には、secret、実在の個人情報、本番データ、AWSアカウントID、内部URL、実ログのrequest idを含めないでください。
AIの提案は抜け漏れ確認として使い、実施 / 条件付き実施 / 見送りの判断は実行結果、差分、ログ、公式資料で自分が確認して書きます。

例:

```bash
mkdir -p submission/<github-account>
find starter -maxdepth 1 -type f ! -name README.md ! -name .gitkeep -exec cp {} submission/<github-account>/ \;
```

## ファイル

- `follow-up-issues.md`
- `performance-observability-readiness.md`
- `production-readiness-checklist.md`
- `release-candidate-summary.md`
- `release-decision.md`
- `release-runbook.md`
- `security-accessibility-readiness.md`
- `smoke-test-plan.md`
