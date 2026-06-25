import { defineCollection, reference } from "astro:content";
// z は astro:schema 経由だと deprecated 警告 (ts6385) が出るため、正規の astro/zod から取る。
import { z } from "astro/zod";
import { glob } from "astro/loaders";
import videosData from "./data/videos.json";

// textbook/book/ の章ファイルと glossary.md を split-book.mjs がサイト用へ変換して
// src/content/docs/ 配下に生成する。その Markdown 群を 1 コレクションとして読む。
// frontmatter にサイドバー構築用のメタ (section / part / order) を持たせる。
const docs = defineCollection({
  loader: glob({ base: "./src/content/docs", pattern: "**/*.md" }),
  schema: z.object({
    title: z.string(),
    // どの教材セクションに属するか
    section: z.enum(["textbook", "glossary"]).default("textbook"),
    // Part 番号 (0=前付け/ガイド, 1..6=各Part, 7=付録)。サイドバーのグループ順に使う。
    part: z.number().default(0),
    // サイドバーに表示するグループ見出し
    partLabel: z.string().default(""),
    // グループ内の並び順 (章番号など)
    order: z.number().default(0),
    description: z.string().optional(),
  }),
});

// video-scripts/ の台本を split-book.mjs が src/content/scripts/ へ生成する。
// ルーティングはせず、各動画ページ (src/pages/videos/[slug].astro) に埋め込んで描画する。
const scripts = defineCollection({
  // glob の既定 ID は root 直下ファイルの順序プレフィックス (NN-) を落としてしまうため、
  // ファイル名 (NN-<slug>) をそのまま ID にして videos.json の scriptId と一致させる。
  loader: glob({
    base: "./src/content/scripts",
    pattern: "**/*.md",
    generateId: ({ entry }) => entry.replace(/\.md$/, ""),
  }),
  schema: z.object({
    title: z.string(),
    chapter: z.number().default(0),
    slug: z.string().default(""),
  }),
});

// 動画メタは README.md の「チャプター一覧」表から split-book.mjs が
// src/data/videos.json に生成する。それを 1 コレクションとして読み込み、
// 各動画が指すテキスト/用語解説/台本の content id を reference() で型付けする。
// 参照先が docs / scripts に存在しなければビルドが失敗するので、章の増減で
// 対応がずれても「IDの手書き一致」に頼らず本番前に必ず気づける。
// (生 JSON 直読みへ戻したいときは lib/videos.ts を data 直読みに差し戻すだけ。)
const videos = defineCollection({
  loader: {
    name: "videos-json",
    load: async ({ store, parseData }) => {
      store.clear();
      for (const item of videosData.items) {
        const data = await parseData({ id: item.slug, data: item });
        store.set({ id: item.slug, data });
      }
    },
  },
  schema: z.object({
    chapter: z.number(),
    part: z.number(),
    partLabel: z.string(),
    title: z.string(),
    slug: z.string(),
    youtubeId: z.string().nullable(),
    // 章ページ (docs コレクション) への参照。例: "textbook/01-roadmap"
    textbookId: reference("docs"),
    // 用語解説ページ (docs コレクション) への参照。例: "glossary/01-roadmap"
    glossaryId: reference("docs"),
    // 動画台本 (scripts コレクション) への参照。例: "01-roadmap"
    scriptId: reference("scripts"),
    scriptUrl: z.url(),
    assignmentUrl: z.url(),
  }),
});

export const collections = { docs, scripts, videos };
