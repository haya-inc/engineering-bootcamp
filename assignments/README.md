# 課題

章ごとのワークブックと記入用ファイルです。
動画とテキスト資料で学んだ内容を、観察、判断、確認結果として残すために使います。

## 使い方

1. 該当章の `README.md` を読む。
2. `starter/` に記入用ファイルがある場合は、自分の `submission/<github-account>/` にコピーする。
3. 課題で求められているファイルを埋める。
4. チェックリスト、検証ログ、秘密情報の有無を確認する。

例:

```bash
cd assignments/chapter08-debugging
mkdir -p submission/<github-account>
find starter -maxdepth 1 -type f ! -name README.md ! -name .gitkeep -exec cp {} submission/<github-account>/ \;
```

## チャプター一覧

| 章 | 課題 |
| --- | --- |
| 01 | [ロードマップ](chapter01-roadmap/) |
| 02 | [機能価値](chapter02-feature-value/) |
| 03 | [AI検証](chapter03-ai-verification/) |
| 04 | [コラボレーション](chapter04-collaboration/) |
| 05 | [開発環境](chapter05-dev-environment/) |
| 06 | [GitとGitHub](chapter06-git-github/) |
| 07 | [Web](chapter07-web/) |
| 08 | [デバッグ](chapter08-debugging/) |
| 09 | [ドメイン](chapter09-domain/) |
| 10 | [データベース](chapter10-database/) |
| 11 | [バックエンドAPI](chapter11-backend-api/) |
| 12 | [フロントエンドとアクセシビリティ](chapter12-frontend-accessibility/) |
| 13 | [テスト](chapter13-testing/) |
| 14 | [セキュリティ](chapter14-security/) |
| 15 | [コンテナ](chapter15-containers/) |
| 16 | [クラウドとCI/CD](chapter16-cloud-cicd/) |
| 17 | [オブザーバビリティとSRE](chapter17-observability-sre/) |
| 18 | [LLMと生成AI](chapter18-llm-generative-ai/) |
| 19 | [AIコーディングワークフロー](chapter19-ai-coding-workflow/) |
| 20 | [技術文書](chapter20-technical-writing/) |
| 21 | [個人開発](chapter21-individual-project/) |
| 22 | [既存プロダクト改善](chapter22-existing-product-improvement/) |
| 23 | [本番準備](chapter23-production-readiness/) |
| 24 | [最終発表](chapter24-final-presentation/) |

## 提出ルール

提出物は、章ごとの `submission/<github-account>/` に置きます。
`<github-account>` は自分のGitHubアカウント、または講師が指定したIDに置き換えてください。

```txt
assignments/chapter08-debugging/submission/
  <github-account>/
    reproduction-log.md
    code-reading-note.md
    hypothesis-log.md
    fix-verification-log.md
    bug-fix-pr-note.md
```

## レビュー観点

- 課題の目的と提出物がつながっているか。
- 観察、推測、判断が分かれているか。
- 動作確認や検証ログがあるか。
- AIを使った場合、受講者自身の確認結果が残っているか。
- 残課題や不確実な点を隠していないか。
