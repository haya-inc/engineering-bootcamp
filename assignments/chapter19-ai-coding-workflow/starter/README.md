# スターター

このディレクトリには、この章の提出用の記入ファイルを置いています。
Claude Codeを中心例にしていますが、Codexなど別のAI coding agentを使った場合も、使ったtool、権限、検証結果を同じ形式で記録してください。

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

- `ai-assisted-pr-description.md`
- `ai-context-pack.md`
- `ai-diff-review.md`
- `ai-feature-brief.md`
- `ai-work-log.md`
- `claude-code-session-plan.md`
