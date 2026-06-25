// 動画一覧 / 各動画ページが使う、動画メタデータのアクセサ。
// 実体は scripts/split-book.mjs が README.md の「チャプター一覧」表から生成する
// src/data/videos.json (gitignore。dev/build の先頭で再生成される派生物)。
// 動画 1 件ごとのメタは videos コレクション (content.config.ts) として読み込み、
// textbook/glossary/script への参照を reference() で型付け・存在検証する。
// (プレイリストのメタだけは json 直読み。)

import { getCollection, getEntry } from "astro:content";
import data from "../data/videos.json";
import { docHref, siteBase } from "./content.ts";

// content.ts と URL 組み立てロジックを共有する (base 正規化・docHref を二重定義しない)。
export { docHref };

/** 1 動画分のメタデータ。 */
export interface VideoMeta {
  /** 章番号 (1..24)。進捗キーにも使う。 */
  chapter: number;
  /** Part 番号 (1..6)。 */
  part: number;
  /** サイドバー等と揃えた Part ラベル。 */
  partLabel: string;
  /** 動画のテーマ (README のテーマ列)。 */
  title: string;
  /** トピックスラッグ (textbook / glossary / 台本 と共通)。URL に使う。 */
  slug: string;
  /** YouTube 動画 ID。個別URL未確認の章は null (プレイリストへ誘導)。 */
  youtubeId: string | null;
  /** テキスト資料ページの content id。 */
  textbookId: string;
  /** 用語解説ページの content id。 */
  glossaryId: string;
  /** 動画台本 (scripts コレクション) の content id。 */
  scriptId: string;
  /** 動画台本 (GitHub) の URL。 */
  scriptUrl: string;
  /** 課題ディレクトリ (GitHub) の URL。 */
  assignmentUrl: string;
}

export interface VideoData {
  playlistId: string;
  playlistUrl: string;
  items: VideoMeta[];
}

const videoData = data as VideoData;

/**
 * 章番号順に並んだ全動画。videos コレクション (content.config.ts) から読み込み、
 * textbook/glossary/script への参照を解決する。参照先が docs / scripts に存在
 * しなければ throw してビルドを止める (reference() の存在検証と二重の安全網)。
 */
export async function getVideos(): Promise<VideoMeta[]> {
  const entries = await getCollection("videos");
  const videos = await Promise.all(
    entries.map(async ({ data: v }): Promise<VideoMeta> => {
      const [textbook, glossary, script] = await Promise.all([
        getEntry(v.textbookId),
        getEntry(v.glossaryId),
        getEntry(v.scriptId),
      ]);
      if (!textbook) {
        throw new Error(
          `videos: 第${v.chapter}章 textbookId「${v.textbookId.id}」が docs に存在しません`,
        );
      }
      if (!glossary) {
        throw new Error(
          `videos: 第${v.chapter}章 glossaryId「${v.glossaryId.id}」が docs に存在しません`,
        );
      }
      if (!script) {
        throw new Error(
          `videos: 第${v.chapter}章 scriptId「${v.scriptId.id}」が scripts に存在しません`,
        );
      }
      return {
        chapter: v.chapter,
        part: v.part,
        partLabel: v.partLabel,
        title: v.title,
        slug: v.slug,
        youtubeId: v.youtubeId,
        textbookId: textbook.id,
        glossaryId: glossary.id,
        scriptId: script.id,
        scriptUrl: v.scriptUrl,
        assignmentUrl: v.assignmentUrl,
      };
    }),
  );
  return videos.sort((a, b) => a.chapter - b.chapter);
}

export const playlistId = videoData.playlistId;
export const playlistUrl = videoData.playlistUrl;

/** 動画一覧ページの URL。 */
export function videosIndexHref(): string {
  return `${siteBase()}/videos/`;
}

/** 各動画ページの URL。 */
export function videoHref(slug: string): string {
  return `${siteBase()}/videos/${slug}/`;
}

/** YouTube サムネイル URL。 */
export function youtubeThumb(id: string): string {
  return `https://i.ytimg.com/vi/${id}/hqdefault.jpg`;
}

/**
 * YouTube 埋め込み iframe の allow 属性 (再生に必要な最小限)。
 * accelerometer / gyroscope / clipboard-write など再生に不要な権限は付与しない。
 * 全画面は iframe の allowfullscreen 属性で別途許可する。
 */
export const youtubeIframeAllow = "autoplay; encrypted-media; picture-in-picture";

/** プライバシー強化モード (youtube-nocookie) の埋め込み URL。 */
export function youtubeEmbed(id: string): string {
  return `https://www.youtube-nocookie.com/embed/${id}?rel=0`;
}

/** プレイリスト全体の埋め込み URL (個別動画が未確認の章で使う)。 */
export function playlistEmbed(): string {
  return `https://www.youtube-nocookie.com/embed/videoseries?list=${playlistId}`;
}

/** その章を YouTube で開く URL (個別動画があればそれ、無ければプレイリスト)。 */
export function watchUrl(video: VideoMeta): string {
  return video.youtubeId ? `https://www.youtube.com/watch?v=${video.youtubeId}` : playlistUrl;
}

export interface VideoPart {
  part: number;
  partLabel: string;
  items: VideoMeta[];
}

/** Part ごとにまとめる (動画一覧のセクション分け用)。 */
export function groupByPart(items: VideoMeta[]): VideoPart[] {
  const parts: VideoPart[] = [];
  for (const v of items) {
    let group = parts.find((p) => p.part === v.part);
    if (!group) {
      group = { part: v.part, partLabel: v.partLabel, items: [] };
      parts.push(group);
    }
    group.items.push(v);
  }
  parts.sort((a, b) => a.part - b.part);
  return parts;
}
