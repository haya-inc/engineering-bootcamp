import { defineConfig } from "vite-plus";

// Vite+ の統合設定 (Vitest / Oxlint / Oxfmt / Vite Task をまとめる)。
// 注意: Astro 本体のビルド設定は astro.config.mjs 側で、Astro は本ファイルを読み込まない。
// ここは主に `vp test` (Vitest) のスコープ指定に使う。
export default defineConfig({
  fmt: {
    ignorePatterns: [],
  },
  test: {
    include: ["scripts/**/*.test.ts"],
    environment: "node",
  },
});
