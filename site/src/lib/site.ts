export const SITE_NAME = "エンジニア入門研修";

/**
 * ブランドワードマークを見出し/フッターで折り返すときの「割ってよい位置」。
 * カタカナ語「エンジニア」を途中で改行させないため、意味の切れ目 (カタカナ→漢字)
 * だけで分割する。描画側はこの境界に <wbr> を挟み、CSS は word-break: keep-all で
 * それ以外の CJK 連続を不可分にする。例: "エンジニア入門研修" → ["エンジニア", "入門研修"]。
 * 区切りが無い名前 (全て漢字など) のときは 1 要素のまま = 1 行扱いになる。
 */
export const SITE_NAME_PARTS: string[] = SITE_NAME.split(/(?<=[ァ-ヶー])(?=[一-龠々])/);

export const SITE_ALTERNATE_NAME = "Engineering Bootcamp";
export const SITE_PUBLISHER = "haya株式会社";
export const SITE_PUBLISHER_URL = "https://www.haya.company/";
export const SITE_REPOSITORY_URL = "https://github.com/haya-inc/engineering-bootcamp";
// モバイル SERP のスニペットは先頭〜60文字前後で切れるため、固有の主要語
// (Webアプリ開発 / AI活用 / 24章) を冒頭へ前寄せし、末尾切れでも価値が伝わるようにする。
export const SITE_DESCRIPTION =
  "Webアプリケーション開発からAI活用まで24章で学ぶ、配属直後のエンジニア向け入門研修。Git/GitHub、DB/API、テスト、運用を、目的から検証まで自分の言葉で説明できる状態を目指します。";
export const SITE_OG_IMAGE_ALT = "エンジニア入門研修の学習ロードマップを表すカード画像";
