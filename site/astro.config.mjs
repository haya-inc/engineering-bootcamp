// @ts-check
import { defineConfig, fontProviders } from "astro/config";
import sitemap from "@astrojs/sitemap";
import icon from "astro-icon";

// GitHub Pages + カスタムドメイン (ルート配信) 用の公開設定。
// 想定URL: https://bootcamp.haya-inc.co.jp/
export default defineConfig({
  site: "https://bootcamp.haya-inc.co.jp",
  base: "/",
  trailingSlash: "always",
  integrations: [icon(), sitemap()],

  // 先読み (prefetch)。教材は内部リンク遷移 (サイドバー/目次/ページャ/動画カード)
  // が多い。BaseLayout の <ClientRouter/> により prefetchAll は既に「暗黙で」有効
  // なので、ここで明示し、戦略を既定の hover から viewport (リンクが視界に入った
  // 時点で先読み) へ意図的に引き上げる。Astro が省データ/低速回線を自動検出して
  // 抑制し、未対応環境では通常のリンク遷移に素直に落ちる。
  prefetch: {
    prefetchAll: true,
    defaultStrategy: "viewport",
  },

  // 欧文 (見出し/UI) の Inter だけをビルド時に latin サブセットでセルフホストする。
  // 第三者 (Google Fonts) へ取りに行かないのでプライバシー・速度に効き、
  // optimizedFallbacks (既定 true) によりメトリクス調整フォールバックが自動生成され
  // CLS をほぼ 0 にする。日本語本文は従来どおりシステムフォント (Hiragino/Yu Gothic)
  // に委ねる (= custom.css の --font-sans フォールバック)。
  fonts: [
    {
      provider: fontProviders.fontsource(),
      name: "Inter",
      cssVariable: "--font-sans-web",
      // 400 と 700 のみ。custom.css のウェイト (500→400, 620以上→700 に CSS フォント照合で
      // 解決) では 600 が選ばれないため、生成も preload もしない (無駄な高優先フェッチを避ける)。
      weights: [400, 700],
      styles: ["normal"],
      subsets: ["latin"],
      display: "swap",
    },
    // ブランドワードマーク「エンジニア入門研修」だけに使う日本語ディスプレイ書体。
    // ブランド名は固定の短い文字列なので、その9文字 (エ ン ジ ニ ア 入 門 研 修) だけに
    // サブセット済みの woff2 (約1.7KB) をセルフホストし、実行時に第三者へ取りに行かない。
    // 適用先は custom.css の .brand / .hero h1 / .site-footer__name のみ (var(--font-brand))。
    // 出所・再生成手順は src/assets/fonts/README.md、ライセンス (OFL 1.1) は OFL.txt を参照。
    // IBM Plex Sans JP の Bold (700) を採用 (CSS 側も 700 で揃え、合成ボールドを避ける)。
    {
      provider: fontProviders.local(),
      name: "IBM Plex Sans JP",
      cssVariable: "--font-brand",
      display: "swap",
      // 失敗・未読込時はシステム日本語ゴシックへ素直に落とす。optimizedFallbacks で
      // サブセットフォントのメトリクスから size-adjust 等を生成し見出しの CLS を抑える。
      fallbacks: ["Hiragino Sans", "Yu Gothic", "sans-serif"],
      optimizedFallbacks: true,
      options: {
        variants: [
          {
            weight: 700,
            style: "normal",
            src: ["./src/assets/fonts/ibm-plex-sans-jp-brand-700.woff2"],
          },
        ],
      },
    },
  ],

  vite: {
    // 既定の lightningcss は ::scroll-button 等の最先端疑似要素を「未知」と警告する
    // (ルール自体は保持されるが警告が騒がしい)。esbuild minifier はそのまま通す。
    build: { cssMinify: "esbuild" },
  },
  markdown: {
    shikiConfig: {
      themes: { light: "github-light", dark: "github-dark" },
      wrap: true,
    },
  },

  experimental: {
    // [意図的な例外] Speculation Rules API による事前「描画」。ホバー/インテント時に
    // 次ページをレンダリングまで進め、対応ブラウザ (Chromium 系) では遷移を瞬間化する。
    // prefetch が「データを先取り」なのに対し、こちらは「ページを描画まで先取り」する。
    // experimental フラグである点に注意: 非対応 (Firefox/Safari) では Astro が通常の
    // prefetch へ自動フォールバックする。このリポジトリで唯一の experimental 採用であり、
    // 「説明できる最新技術」ショーケースの意図的な例外。受講者のテンプレ (安定機能から
    // 積む) として模倣しないこと。
    clientPrerender: true,
  },
});
