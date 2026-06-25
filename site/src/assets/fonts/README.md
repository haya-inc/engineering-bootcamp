# ブランド見出し用フォント (セルフホスト)

サイトのブランドワードマーク「エンジニア入門研修」**だけ**に使う日本語ディスプレイ書体です。
適用先は3か所:

- ヘッダーのブランド名（`.brand`）
- トップのヒーロー見出し（`.hero h1`）
- フッターのブランド名（`.site-footer__name`）

本文・UI・他の見出しは従来どおり Inter（欧文）＋システム日本語フォントのままです。

## ファイル

- `ibm-plex-sans-jp-brand-700.woff2` … IBM Plex Sans JP / Bold (700) を、
  ブランド文字列の9文字（エ ン ジ ニ ア 入 門 研 修）だけにサブセットしたもの（約1.7KB）。
- `OFL.txt` … 上記フォントのライセンス（SIL Open Font License 1.1）。

## なぜサブセットしてセルフホストするのか

- ブランド名は固定の短い文字列なので、必要なグリフだけに絞れば数KBで済む。
- 実行時に第三者（Google Fonts 等）へ取りに行かないので、プライバシーと速度に効く
  （欧文 Inter をセルフホストしているのと同じ思想。`../../../astro.config.mjs` 参照）。

## 適用の仕組み

`astro.config.mjs` の Astro Fonts API（`fontProviders.local()`）で `--font-brand` として登録し、
`BaseLayout.astro` の `<Font cssVariable="--font-brand" preload />` で `@font-face` 注入とプリロードを行い、
`src/styles/custom.css` の `.brand` / `.hero h1` / `.site-footer__name` で `var(--font-brand)` を当てています。
CSS 側の `font-weight` も 700 で揃え、合成ボールドではなく実フォントの Bold を使います。
未対応・読み込み失敗時はシステム日本語ゴシックへフォールバックします（`font-display: swap`）。

折り返しは、カタカナ語「エンジニア」を途中で割らないために `word-break: keep-all` で CJK 連続を
不可分にしつつ、`src/lib/site.ts` の `SITE_NAME_PARTS`（意味の切れ目で分割）を使って
描画側で `<wbr>` を1か所だけ挿入しています。

## 再生成手順（書体・ウェイト・文字列を変えたとき）

このサブセットは「エンジニア入門研修」の9文字・700 に固定されています。
`src/lib/site.ts` の `SITE_NAME` を変える場合や、別書体・別ウェイトにする場合は作り直してください。

```sh
# family= に「書体名:wght@ウェイト」、text= に必要な文字を渡すと、その文字だけの woff2 を返す CSS が得られる
UA="Mozilla/5.0"
FAMILY="IBM+Plex+Sans+JP:wght@700"   # 例: 別書体なら "Zen+Kaku+Gothic+New:wght@900" 等
CSS=$(curl -s -A "$UA" \
  "https://fonts.googleapis.com/css2?family=${FAMILY}&text=エンジニア入門研修&display=swap")
URL=$(echo "$CSS" | sed -nE "s/.*src: url\(([^)]+)\).*/\1/p")
curl -s -A "$UA" -o ibm-plex-sans-jp-brand-700.woff2 "$URL"
# 書体やウェイトを変えたら astro.config.mjs の name / src / weight、custom.css の font-weight、
# ライセンス表記 (OFL.txt / LICENSE.txt) も合わせて差し替える
```

> `text=` は実際にはURLエンコードして渡す（curl が未エンコードでも通ることが多いが、確実にするなら
> `%E3%82%A8...` のように百分率エンコードする）。
> 提供ウェイトは書体ごとに違う。存在しないウェイトを `:wght@` で要求すると HTTP 400 になる
> （例: Kosugi は Regular(400) のみ、Dela Gothic One は単一ウェイト。IBM Plex Sans JP は 100〜700）。

## 帰属・ライセンス

- 書体: **IBM Plex Sans JP** — Copyright © 2017 IBM Corp. with Reserved Font Name "Plex"
  (<https://github.com/IBM/plex>)
- ライセンス: SIL Open Font License 1.1（`OFL.txt`）。サブセット（改変）と再配布が許諾されています。
  予約名 "Plex" を持つため、独自フォントへ改名する派生は名前を変える必要があります（グリフ削減のみの
  サブセットは Google Fonts も同名で配信しており、ここではその運用に従っています）。
  リポジトリ本体の `LICENSE`（source-available）とは別に、このフォントは OFL に従います。
