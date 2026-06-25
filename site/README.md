# 公開教材サイト (site/)

エンジニア入門研修の公開サイトのソースです。
[Astro](https://astro.build/) を土台に、ツールチェーンの入口として [Vite+](https://viteplus.dev/)（`vp`）を使います。
テキスト資料（`../textbook/book/` の章ファイルと `../textbook/glossary.md`）から、検索付きの教材ポータルを生成します。

## 技術スタック

- ランタイム: Node.js 26 / パッケージマネージャ: Bun（`mise.toml` で固定）
- フレームワーク: Astro
- ツールチェーン入口: Vite+（`vp`）= Oxlint（lint）/ Oxfmt（format）/ Vitest（test）/ Vite Task（タスク実行）
- 検索: Pagefind（ビルド後に `dist` を索引化。外部サービス不要）

## 前提

[mise](https://mise.jdx.dev/) があれば、`site/` に入るだけで Node 26 と Bun が有効になります（`mise.toml`）。
mise を使わない場合は Node 26 と Bun 1.3 系を用意してください。

## セットアップと開発

```sh
bun install          # 依存をインストール
bun run dev          # 本文を分割し、開発サーバを起動 (vp run dev でも可)
```

## 主なコマンド（Vite+ 入口）

```sh
bunx vp run build    # 本文分割 → astro build → pagefind 索引化
bunx vp run dev      # 開発サーバ
bunx vp check        # oxfmt + oxlint（型チェックは含まない）
bunx astro check     # 型チェック（= bun run typecheck。CI と同じ）
bunx vp test run     # Vitest（split-book の単体テスト）
bunx vp fmt          # oxfmt で整形
```

`bun run build` / `bun run dev` でも同じスクリプトを実行できます。
型チェックは `bun run typecheck`（= `astro check`）。CI でも `vp check` とは別ステップで実行します。

## 構成

```txt
astro.config.mjs              Astro 設定 (site / base / minifier)
vite.config.ts                Vite+ 設定 (Vitest / Oxfmt)
.oxlintrc.json                Oxlint 設定
scripts/split-book.mjs        textbook/book/・glossary.md・video-scripts/・README.md をサイト用へ変換する生成スクリプト
scripts/split-book.test.ts    分割ロジック・動画表パースの単体テスト
src/pages/index.astro         ランディング (CSS Carousel 等の最新Web標準のショーケース)
src/pages/[...slug].astro     章ページのルーティング
src/pages/videos/index.astro  動画一覧 (Part 別カード + 視聴進捗メーター)
src/pages/videos/[slug].astro 各動画の埋め込みページ (ファサード再生 + 台本全文 + 教材導線)
src/pages/404.astro           404 ページ (主要導線 + 検索案内)
src/layouts/                  BaseLayout / DocsLayout
src/components/                ヘッダー、サイドバー、目次、検索、進捗スクリプト 等
src/lib/                      ナビ構築(content.ts)・サイトメタ定数(site.ts)・動画メタ(videos.ts) のアクセサ
src/styles/custom.css         デザイントークンと最新CSS (@layer / 尖り機能 + フォールバック)
src/assets/fonts/             ブランド見出し専用フォント (タイトル9文字だけサブセット。出所/再生成は同梱README参照)
src/content/docs/             生成された章Markdown (gitignore。コミットしない)
src/content/scripts/          生成された動画台本Markdown (gitignore。コミットしない)
src/data/videos.json          README.md の動画表から生成した動画メタ (gitignore。コミットしない)
```

## 生成物の扱い

`src/content/docs/textbook/` と `src/content/docs/glossary/` は `../textbook/book/` / `../textbook/glossary.md` から生成される派生物です。
正本は `../textbook/` 側なので、章ページを手で編集せず、本文を直してビルドし直してください。

`src/content/scripts/` は `../video-scripts/` の台本から生成される派生物です（各動画ページに埋め込んで描画。単独ページにはしない）。
正本は `../video-scripts/` 側なので、台本を直す場合はそちらを編集してビルドし直してください。

`src/data/videos.json` は `../README.md` の「チャプター一覧」表から生成される派生物です。
動画リンク・章タイトル・台本/課題への対応は README が正本なので、動画情報を変える場合は README の表を直してビルドし直してください。

## 動画ページと視聴進捗

`src/pages/videos/` は動画一覧と各動画の埋め込みページです。
クリックするまで動画の iframe（`youtube-nocookie.com`）は読み込みません。サムネイル画像のみ `i.ytimg.com` から取得し、`referrerpolicy="no-referrer"` で参照元は送りません。
README の動画列が個別 URL（`watch?v=` 等）の章はその動画を、`Playlist` リンクのみの章は再生リスト全体（`videoseries`）をフォールバック表示します。
各動画ページには、その章のナレーション台本全文（`../video-scripts/` の「## 台本」配下）も折りたたみで埋め込みます。
「視聴済み」の状態はブラウザの `localStorage`（キー `eb:videos:watched:v1`）にのみ保存し、サーバには送信しません。
進捗の反映は [src/components/VideoProgressScript.astro](src/components/VideoProgressScript.astro) が `astro:page-load` で行います。

## デプロイ

`main` への push で GitHub Actions（[../.github/workflows/deploy.yml](../.github/workflows/deploy.yml)）がビルドし、GitHub Pages へ公開します。
初回のみ、リポジトリの Settings → Pages で Source を「GitHub Actions」に設定する必要があります（管理者操作）。

## 最新Web標準について

このサイトは「説明できる最新技術」を体現するショーケースを兼ねています。
View Transitions、CSS Carousel（`::scroll-button` / `::scroll-marker`、現状 Chromium 系のみ）、anchor positioning、container queries、`:has()`、`color-mix()`、`light-dark()`、`interpolate-size`、scroll-driven animations を使います。
最先端機能は `@supports` で機能検出し、未対応ブラウザでは素直なフォールバック表示に落ちます。基盤の配色トークン（`light-dark()`）も非対応時はライト配色へフォールバックします（`prefers-reduced-motion` も尊重）。

## このスタックは「意図的な例外」です

このリポジトリ全体の方針（[../AGENTS.md](../AGENTS.md)）は「最小・安定構成」「依存は必要な範囲」です。
一方この `site/` は **Node 26 / Bun / Vite+（alpha）/ Astro / 先端CSS** という意図的に攻めた構成で、上記方針の **意図的な例外**です。
受講者が学ぶ判断基準は教材本文（安定を選ぶ・小さく戻れる・公式で検証する）であり、この `site/` を starter-apps や本番プロジェクトのテンプレートとして模倣しないでください。
alpha 依存（vite-plus）は exact 固定し、本番ビルドは vp を経由しない素のスクリプト（`bun run build`）でも生成できる脱出ハッチを残しています。
