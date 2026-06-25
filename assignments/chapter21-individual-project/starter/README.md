# スターター

このディレクトリには、この章の提出用の記入ファイルを置いています。

## 使い方

1. 章ディレクトリから、`submission/<github-account>/` を作る。
2. 必要なファイルを `submission/<github-account>/` にコピーする。
3. コピーした提出物を自分の回答で埋める。
4. `README.md` のチェックリストを確認する。

`<github-account>` は自分のGitHubアカウント、または講師が指定した一意なIDに置き換えてください。
提出物には、秘密情報、実在の個人情報、実在の顧客情報、本番ログ、社内限定リンクを入れないでください。
AIを使った場合は、採用した提案、採用しなかった提案、検証方法を自分の言葉で残してください。

例:

```bash
mkdir -p submission/<github-account>
find starter -maxdepth 1 -type f ! -name README.md ! -name .gitkeep -exec cp {} submission/<github-account>/ \;
```

## ファイル

- `delivery-plan.md`
- `demo-script.md`
- `mentor-review-request.md`
- `mvp-scope.md`
- `project-brief.md`
- `project-progress-log.md`
- `self-review.md`
