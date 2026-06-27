# Engineering Bootcamp

動画、テキスト、課題、スターターアプリを使って、配属直後のエンジニアがWebアプリケーション開発を、目的から検証まで説明できるようになるための教材です。

この研修では、技術用語の暗記ではなく、次の一連の動きを練習します。

- 誰の何を良くするのかを確認する
- 手元で動かし、観察し、変更する
- データ、API、画面、テスト、セキュリティをつなげて考える
- AIを補助に使い、出力を自分で検証する
- 判断、確認結果、残課題をチームに説明する

## 入口

- [チャプター一覧](#チャプター一覧)
- [動画プレイリスト](https://www.youtube.com/playlist?list=PLhpCGFN2YpZ7DiryhbTWChiynuN86k_X_)
- [動画スクリプト](video-scripts/README.md)
- [テキスト資料](textbook/README.md)
- [課題](assignments/README.md)
- [スターターアプリ](starter-apps/README.md)
- [公開サイト](https://haya-inc.github.io/engineering-bootcamp/)
- [貢献ルール](CONTRIBUTING.md)
- [ライセンス](LICENSE)

## 対象者

- 新卒、第二新卒、配属直後の若手エンジニア
- Web開発、チーム開発、クラウド、AI利用を一続きの仕事として学び直したい人
- AIを使いながらも、根拠、差分、検証結果を自分で説明したい人

## 受講の流れ

1. [チャプター一覧](#チャプター一覧)で章の位置づけを確認する。
2. [動画プレイリスト](https://www.youtube.com/playlist?list=PLhpCGFN2YpZ7DiryhbTWChiynuN86k_X_)で該当章を視聴する。
3. [動画スクリプト](video-scripts/README.md)で聞き逃した箇所や用語を確認する。
4. [テキスト資料](textbook/README.md)で、実務上の考え方と概念のつながりを読む。
5. [課題](assignments/README.md)で成果物を作り、観察、判断、確認結果を残す。

AIに相談する場合は、[AGENTS.md](AGENTS.md)の方針に従ってください。
AIは説明、問い返し、デバッグ、レビューの補助に使えますが、提出物の判断理由と検証結果は受講者自身の言葉で残します。

## 構成

```txt
README.md         研修全体の入口、章一覧、動画リンク
textbook/         研修全体を読み物として再構成したテキスト資料
video-scripts/    各章の動画ナレーション台本
assignments/      章ごとのワークブック、starter、submission置き場
starter-apps/     複数章で使う演習用アプリ
site/             公開教材サイト (Astro + Vite+) のソース
AGENTS.md         AI学習支援のためのリポジトリ方針
```

## チャプター一覧

章構成、受講順、動画リンクはこのREADMEを正本にします。
動画リンク確認日: 2026-06-25
個別URLを確認できた章は直接リンクを置き、未確認の章はプレイリストへリンクしています。

| 章 | Part | テーマ | 動画 | 台本 | 課題 |
| --- | --- | --- | --- | --- | --- |
| 01 | Part 1: オリエンテーション | 研修ロードマップ | [YouTube](https://www.youtube.com/watch?v=VGFokDPmqyI) | [台本](video-scripts/chapter01-roadmap.md) | [課題](assignments/chapter01-roadmap/) |
| 02 | Part 1: オリエンテーション | 作る前に価値を見る | [YouTube](https://www.youtube.com/watch?v=N1ch5oHyjLs) | [台本](video-scripts/chapter02-feature-value.md) | [課題](assignments/chapter02-feature-value/) |
| 03 | Part 1: オリエンテーション | AIを使い、検証して進める | [YouTube](https://www.youtube.com/watch?v=5X_GUCZSwOI) | [台本](video-scripts/chapter03-ai-verification.md) | [課題](assignments/chapter03-ai-verification/) |
| 04 | Part 1: オリエンテーション | チームに情報を渡す | [YouTube](https://www.youtube.com/watch?v=-JkFNsLuXoY) | [台本](video-scripts/chapter04-collaboration.md) | [課題](assignments/chapter04-collaboration/) |
| 05 | Part 2: 開発の基本動作 | 開発環境とCLIの入口 | [YouTube](https://www.youtube.com/watch?v=dJIQgYZjZ0s) | [台本](video-scripts/chapter05-dev-environment.md) | [課題](assignments/chapter05-dev-environment/) |
| 06 | Part 2: 開発の基本動作 | 変更をレビューにつなげる | [YouTube](https://www.youtube.com/watch?v=VciWC1S7IXQ) | [台本](video-scripts/chapter06-git-github.md) | [課題](assignments/chapter06-git-github/) |
| 07 | Part 2: 開発の基本動作 | Webの仕組みを観察する | [YouTube](https://www.youtube.com/watch?v=JUlPLEvHQ_w) | [台本](video-scripts/chapter07-web.md) | [課題](assignments/chapter07-web/) |
| 08 | Part 2: 開発の基本動作 | 既存コードを小さく読む | [YouTube](https://www.youtube.com/watch?v=Bac_9W9shcE) | [台本](video-scripts/chapter08-debugging.md) | [課題](assignments/chapter08-debugging/) |
| 09 | Part 3: Webアプリケーション開発 | 要件からドメインを整理する | [YouTube](https://www.youtube.com/watch?v=WTmbYt06xSU) | [台本](video-scripts/chapter09-domain.md) | [課題](assignments/chapter09-domain/) |
| 10 | Part 3: Webアプリケーション開発 | データを保存できる形にする | [YouTube](https://www.youtube.com/watch?v=vxW2V8m-Wfg) | [台本](video-scripts/chapter10-database.md) | [課題](assignments/chapter10-database/) |
| 11 | Part 3: Webアプリケーション開発 | APIで画面と業務をつなぐ | [YouTube](https://www.youtube.com/watch?v=0tldpWrEHAI) | [台本](video-scripts/chapter11-backend-api.md) | [課題](assignments/chapter11-backend-api/) |
| 12 | Part 3: Webアプリケーション開発 | フロントエンドとアクセシビリティ | [YouTube](https://www.youtube.com/watch?v=wAy_cnEvaCg) | [台本](video-scripts/chapter12-frontend-accessibility.md) | [課題](assignments/chapter12-frontend-accessibility/) |
| 13 | Part 3: Webアプリケーション開発 | テストとコード品質 | [YouTube](https://www.youtube.com/watch?v=LsNlAVn2FD0) | [台本](video-scripts/chapter13-testing.md) | [課題](assignments/chapter13-testing/) |
| 14 | Part 3: Webアプリケーション開発 | セキュリティの基本 | [YouTube](https://www.youtube.com/watch?v=yhjkNwj2peY) | [台本](video-scripts/chapter14-security.md) | [課題](assignments/chapter14-security/) |
| 15 | Part 4: 実行環境と運用 | コンテナと実行環境 | [YouTube](https://www.youtube.com/watch?v=0En-JTVTZ0o) | [台本](video-scripts/chapter15-containers.md) | [課題](assignments/chapter15-containers/) |
| 16 | Part 4: 実行環境と運用 | クラウドとCI/CD | [YouTube](https://www.youtube.com/watch?v=s0zjzlcgaus) | [台本](video-scripts/chapter16-cloud-cicd.md) | [課題](assignments/chapter16-cloud-cicd/) |
| 17 | Part 4: 実行環境と運用 | オブザーバビリティとSRE | [YouTube](https://www.youtube.com/watch?v=U9wpEuTV70Y) | [台本](video-scripts/chapter17-observability-sre.md) | [課題](assignments/chapter17-observability-sre/) |
| 18 | Part 5: AIと知識作業 | LLMと生成AIの基礎 | [YouTube](https://www.youtube.com/watch?v=WZEwsYJ0y5A) | [台本](video-scripts/chapter18-llm-generative-ai.md) | [課題](assignments/chapter18-llm-generative-ai/) |
| 19 | Part 5: AIと知識作業 | AIコーディングの実務ワークフロー | [YouTube](https://www.youtube.com/watch?v=O88W3gUe0oA) | [台本](video-scripts/chapter19-ai-coding-workflow.md) | [課題](assignments/chapter19-ai-coding-workflow/) |
| 20 | Part 5: AIと知識作業 | テクニカルライティングと知識共有 | [YouTube](https://www.youtube.com/watch?v=oWLKP_0n_fo) | [台本](video-scripts/chapter20-technical-writing.md) | [課題](assignments/chapter20-technical-writing/) |
| 21 | Part 6: 最終プロジェクト | 個人開発プロジェクト | [YouTube](https://www.youtube.com/watch?v=rMWr144DzLU) | [台本](video-scripts/chapter21-individual-project.md) | [課題](assignments/chapter21-individual-project/) |
| 22 | Part 6: 最終プロジェクト | 既存プロダクト改善 | [YouTube](https://www.youtube.com/watch?v=1v-2Vhnk_1E) | [台本](video-scripts/chapter22-existing-product-improvement.md) | [課題](assignments/chapter22-existing-product-improvement/) |
| 23 | Part 6: 最終プロジェクト | 本番リリース判定 | [YouTube](https://www.youtube.com/watch?v=x0qZyDC_0nA) | [台本](video-scripts/chapter23-production-readiness.md) | [課題](assignments/chapter23-production-readiness/) |
| 24 | Part 6: 最終プロジェクト | 最終発表と次の学習計画 | [YouTube](https://www.youtube.com/watch?v=V7h1XVgtrhk) | [台本](video-scripts/chapter24-final-presentation.md) | [課題](assignments/chapter24-final-presentation/) |

## 課題の進め方

各章の課題は `assignments/chapterXX-*/README.md` から始めます。
提出物は次のように受講者ごとのディレクトリへ置きます。

```txt
assignments/chapter08-debugging/submission/<github-account>/
```

`starter/` に記入用ファイルがある章では、必要なファイルを自分の `submission/<github-account>/` にコピーしてから記入します。

## 公開教材としての注意

- 実在の顧客情報、個人情報、APIキー、パスワード、トークンを提出物やIssueに書かないでください。
- AIに相談するときも、秘密情報や社外秘の仕様を入力しないでください。
- スターターアプリは研修用の最小構成です。本番サービスの設計例ではありません。
- 動画、台本、テキスト、課題は相互に補完する教材です。どれか一つだけを正本として扱わず、章の目的に合わせて参照してください。

## 問い合わせと報告先

サポート窓口はこのREADMEにまとめます。

| 種別 | 使う場所 | 注意 |
| --- | --- | --- |
| 学習質問 | GitHub Discussions、または研修で指定された連絡先 | 課題の解答全文、個人情報、秘密情報は書かない |
| 教材不備 | GitHub Issue | 誤字、リンク切れ、説明不足、古い技術情報、starter app不具合を報告できる |
| セキュリティ報告 | 公開Issueではなく、リポジトリ管理者またはhaya, Inc.の指定窓口 | 脆弱性、secret混入、個人情報混入は公開Issueに詳細を書かない |
| ライセンス相談 | リポジトリ管理者またはhaya, Inc.の指定窓口 | 再配布、商用利用、派生教材化、本番利用、AI学習利用は事前許可が必要 |

IssueやPull Requestを作る前に、[CONTRIBUTING.md](CONTRIBUTING.md) を確認してください。

## GitHub Pages

公開サイトは `site/`（Astro + Vite+）のソースから生成し、テキスト資料（[textbook/book/](textbook/book/) の章ファイルと [textbook/glossary.md](textbook/glossary.md)）から、検索付きの教材ポータルとして公開します。
デプロイは GitHub Actions（[.github/workflows/deploy.yml](.github/workflows/deploy.yml)）で行い、`main` への push で自動更新されます。
想定URLは `https://haya-inc.github.io/engineering-bootcamp/` です。

GitHub Pages の Source は「GitHub Actions」を使います（リポジトリの Settings → Pages で設定）。
ローカルでの開発・ビルド手順は [site/README.md](site/README.md) を参照してください。

## ライセンス

このリポジトリは [Haya Engineering Bootcamp Source-Available License](LICENSE) で公開します。
これはオープンソースライセンスではありません。
閲覧、clone、fork、個人学習、haya, Inc. が実施または承認する研修での利用は許可します。
再配布、商用利用、教材化、派生物の公開、本番利用、機械学習モデルやデータセット作成への利用は、事前の書面許可なしには認めません。
