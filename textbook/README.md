# テキスト資料

このディレクトリは、動画と課題を補完する読み物を置く場所です。

## 配布形式

| ファイル | 役割 | 状態 |
| --- | --- | --- |
| [book/](book/) | 編集用の正本。1章=1ファイルに分割した本文（[book/README.md](book/README.md) が索引） | 配置済み |
| 公開サイト (Web版) | `site/`（Astro + Vite+）が `book/` の章ファイルから検索付きで公開する派生版 | 配置済み |
| `book.html` | ブラウザで読みやすいHTML版 | 追加予定 |
| `book.pdf` | 印刷、配布、オフライン閲覧用のPDF版 | 追加予定 |

`README.md` は本文ではなく、読み方と導線を示す入口です。
本文は `book/` の章ファイル（1章=1ファイル）に分割し、Web版・HTML版・PDF版はそこから作る配布形式として扱います。
Web版はビルドのたびに `book/` から自動生成されるため、生成された章ページ（`site/` 配下）ではなく `book/` の章ファイルを編集します。

## 別冊: 用語解説

[glossary.md](glossary.md) は、本文に出てくる一般的な専門用語を章ごとに詳しく解説する別冊です。
本文を読んで言葉に詰まったとき、または用語を辞書のように引きたいときに使います。
各用語は、読み・一言での定義・くわしい説明・具体例・つまずきやすい点・関連語・本文での登場箇所をそろえています。
本書独自の言い回しや課題の提出ファイル名は載せず、研修の外でも通用する用語に絞っています。

## 位置づけ

動画は、章ごとの流れと導入をつかむために使います。
テキスト資料は、動画を見た後に概念、判断の型、つまずきやすい点を読み返すために使います。
課題は、読んだ内容を自分の観察、判断、検証結果として残すために使います。

## 読み方

1. [動画プレイリスト](https://www.youtube.com/playlist?list=PLhpCGFN2YpZ7DiryhbTWChiynuN86k_X_)で該当チャプターを視聴する。
2. [動画スクリプト](../video-scripts/README.md)で聞き逃した説明を確認する。
3. [book/](book/) の該当章（または公開サイト）で、そのチャプターの考え方を読む。読んでいて言葉に詰まったら、別冊の [glossary.md](glossary.md) で同じ章の用語を確認する。
4. [課題](../assignments/README.md)で成果物を作る。
5. 分からない点は、課題の解答を貼らずに、前提、観察、試したことを分けて相談する。

## チャプター一覧

| 章 | テーマ | 動画台本 | 課題 |
| --- | --- | --- | --- |
| 01 | 研修ロードマップ | [台本](../video-scripts/chapter01-roadmap.md) | [課題](../assignments/chapter01-roadmap/) |
| 02 | 作る前に価値を見る | [台本](../video-scripts/chapter02-feature-value.md) | [課題](../assignments/chapter02-feature-value/) |
| 03 | AIを使い、検証して進める | [台本](../video-scripts/chapter03-ai-verification.md) | [課題](../assignments/chapter03-ai-verification/) |
| 04 | チームに情報を渡す | [台本](../video-scripts/chapter04-collaboration.md) | [課題](../assignments/chapter04-collaboration/) |
| 05 | 開発環境とCLIの入口 | [台本](../video-scripts/chapter05-dev-environment.md) | [課題](../assignments/chapter05-dev-environment/) |
| 06 | 変更をレビューにつなげる | [台本](../video-scripts/chapter06-git-github.md) | [課題](../assignments/chapter06-git-github/) |
| 07 | Webの仕組みを観察する | [台本](../video-scripts/chapter07-web.md) | [課題](../assignments/chapter07-web/) |
| 08 | 既存コードを小さく読む | [台本](../video-scripts/chapter08-debugging.md) | [課題](../assignments/chapter08-debugging/) |
| 09 | 要件からドメインを整理する | [台本](../video-scripts/chapter09-domain.md) | [課題](../assignments/chapter09-domain/) |
| 10 | データを保存できる形にする | [台本](../video-scripts/chapter10-database.md) | [課題](../assignments/chapter10-database/) |
| 11 | APIで画面と業務をつなぐ | [台本](../video-scripts/chapter11-backend-api.md) | [課題](../assignments/chapter11-backend-api/) |
| 12 | フロントエンドとアクセシビリティ | [台本](../video-scripts/chapter12-frontend-accessibility.md) | [課題](../assignments/chapter12-frontend-accessibility/) |
| 13 | テストとコード品質 | [台本](../video-scripts/chapter13-testing.md) | [課題](../assignments/chapter13-testing/) |
| 14 | セキュリティの基本 | [台本](../video-scripts/chapter14-security.md) | [課題](../assignments/chapter14-security/) |
| 15 | コンテナと実行環境 | [台本](../video-scripts/chapter15-containers.md) | [課題](../assignments/chapter15-containers/) |
| 16 | クラウドとCI/CD | [台本](../video-scripts/chapter16-cloud-cicd.md) | [課題](../assignments/chapter16-cloud-cicd/) |
| 17 | オブザーバビリティとSRE | [台本](../video-scripts/chapter17-observability-sre.md) | [課題](../assignments/chapter17-observability-sre/) |
| 18 | LLMと生成AIの基礎 | [台本](../video-scripts/chapter18-llm-generative-ai.md) | [課題](../assignments/chapter18-llm-generative-ai/) |
| 19 | AIコーディングの実務ワークフロー | [台本](../video-scripts/chapter19-ai-coding-workflow.md) | [課題](../assignments/chapter19-ai-coding-workflow/) |
| 20 | テクニカルライティングと知識共有 | [台本](../video-scripts/chapter20-technical-writing.md) | [課題](../assignments/chapter20-technical-writing/) |
| 21 | 個人開発プロジェクト | [台本](../video-scripts/chapter21-individual-project.md) | [課題](../assignments/chapter21-individual-project/) |
| 22 | 既存プロダクト改善 | [台本](../video-scripts/chapter22-existing-product-improvement.md) | [課題](../assignments/chapter22-existing-product-improvement/) |
| 23 | Production Readiness Review | [台本](../video-scripts/chapter23-production-readiness.md) | [課題](../assignments/chapter23-production-readiness/) |
| 24 | 最終発表と次の学習計画 | [台本](../video-scripts/chapter24-final-presentation.md) | [課題](../assignments/chapter24-final-presentation/) |

## 管理方針

- 本文を更新する場合は `book/` の該当する章ファイルを編集する。
- 公開サイト (Web版)・`book.html`・`book.pdf` は `book/` から作る配布版として扱う。
- 章を追加・削除・改名した場合は、`book/README.md` の索引、`../README.md`、`../video-scripts/README.md`、このREADMEの表を合わせて更新する。
- 本文の用語を増やしたり言い換えたりした場合は、別冊 `glossary.md` の該当章も見直す。`glossary.md` には本書独自の言い回しや課題の提出ファイル名を載せず、一般的な専門用語に絞る。
- 課題の解答例や個人提出物を `textbook/` に置かない。
- 秘密情報、個人情報、社内情報を含めない。
