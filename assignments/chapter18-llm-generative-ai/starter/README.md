# スターター

このディレクトリには、この章の提出用の記入ファイルを置いています。

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

- `agent-boundary-note.md`
- `ai-evaluation-note.md`
- `ai-task-fit-note.md`
- `prompt-context-design.md`
- `rag-grounding-note.md`
