# スターター

このディレクトリには、この章の提出用の記入ファイルを置いています。
文書は公開リポジトリに置く前提で、secret、個人情報、内部URL、ローカル絶対パスを入れないでください。
AIで文章を整えた場合も、採用した改善と採用しなかった改善を `doc-review-note.md` に残してください。

## 使い方

1. 章ディレクトリから、`submission/<github-account>/` を作る。
2. 必要なファイルを `submission/<github-account>/` にコピーする。
3. コピーした提出物を自分の回答で埋める。
4. `README.md` のチェックリストを確認する。

`<github-account>` は自分のGitHubアカウント、または講師が指定した一意なIDに置き換えてください。

例:

```bash
mkdir -p submission/<github-account>
find starter -maxdepth 1 -type f ! -name README.md ! -name .gitkeep -exec cp {} submission/<github-account>/ \;
```

## ファイル

- `adr-0001-filtering-support-status.md`
- `doc-audience-plan.md`
- `doc-review-note.md`
- `feature-design-note.md`
- `incident-report-draft.md`
- `readme-update-draft.md`
