# スターター

このディレクトリには、この章の提出用の記入ファイルを置いています。

## 使い方

1. 章ディレクトリから、`submission/<github-account>/` を作る。
2. 必要なファイルを `submission/<github-account>/` にコピーする。
3. コピーした提出物を自分の回答で埋める。
4. `README.md` のチェックリストを確認する。

`<github-account>` は自分のGitHubアカウント、または講師が指定した一意なIDに置き換えてください。
発表資料、提出物、AI入力には、secret、実在の個人情報、本番データ、AWSアカウントID、内部URL、実ログ全文を含めないでください。
見せられない情報は、架空データ、伏せ字、集計、手順、テスト結果など安全な代替証拠に置き換えます。

例:

```bash
mkdir -p submission/<github-account>
find starter -maxdepth 1 -type f ! -name README.md ! -name .gitkeep -exec cp {} submission/<github-account>/ \;
```

## ファイル

- `final-demo-script.md`
- `final-evidence-index.md`
- `final-presentation-brief.md`
- `learning-reflection.md`
- `next-90-days-plan.md`
