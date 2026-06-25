// テキスト資料を Astro の content collection (src/content/docs/) 用 Markdown へ変換する。
//
// 設計方針:
// - textbook の正本は textbook/book/ の章ファイル (1章=1ファイル, frontmatter付き)。
//   ここではそれを glob で読み込み、サイト用に section を付け、見出し正規化・リンク書換をして出力する。
// - glossary は単一ファイル textbook/glossary.md が正本。`## 第N章` 境界で章へ分割する。
// - 生成物 (src/content/docs/) はコミットしない (gitignore)。dev/build の先頭で毎回再生成する。
// - 見出し正規化: ページ見出し(h1)はレイアウトが描画するので、本文の見出しを「最小レベルが h2」に
//   なるよう相対シフトする。コードフェンス内 (``` / ~~~) の `# ...` 等は本文ではないので一切触らない。
// - 相対リンクは GitHub blob URL へ書き換える。
// - 生成が無動作だと空サイトがデプロイされるため、章数が下限未満なら exit 1 で落とす。

import { mkdir, readdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
// Astro (markdown-satteri 経由) が見出し id の採番に使うのと同一ライブラリ。これで本文側から
// 張る #fragment と、用語解説ページに実際に振られる見出し id を必ず一致させる。
// (frozen-lockfile 環境のため package.json は触らず、Astro の推移依存をそのまま使う。)
import GithubSlugger from "github-slugger";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const REPO = path.resolve(HERE, "..", ".."); // site/scripts/ -> repo ルート
const OUT_ROOT = path.resolve(HERE, "..", "src", "content", "docs");
const SCRIPTS_OUT = path.resolve(HERE, "..", "src", "content", "scripts");
const DATA_DIR = path.resolve(HERE, "..", "src", "data");
const BOOK_DIR = path.join(REPO, "textbook", "book");
const GLOSSARY_SRC = path.join(REPO, "textbook", "glossary.md");
const SCRIPTS_DIR = path.join(REPO, "video-scripts");
const README_SRC = path.join(REPO, "README.md");
const GH_BLOB = "https://github.com/haya-inc/engineering-bootcamp/blob/main/";
const GH_TREE = "https://github.com/haya-inc/engineering-bootcamp/tree/main/";
// 公開サイトの base path。astro.config.mjs の `base` と一致させる (本文→用語解説の自動リンク先に使う)。
const SITE_BASE = "/engineering-bootcamp";
// 個別URL未確認の章で使うフォールバック (README からも検出するが、見つからない場合の保険)。
const PLAYLIST_FALLBACK = "PLhpCGFN2YpZ7DiryhbTWChiynuN86k_X_";

const RE_PART = /^#\s+Part\s+(\d+)\s*[:：]\s*(.+?)\s*$/;
const RE_CHAPTER = /^##\s+第(\d+)章\s+(.+?)\s*$/;
const RE_HEADING = /^(#{1,6})\s+(.*)$/;
const RE_FENCE = /^\s*(```+|~~~+)/;

// 章番号 → トピックスラッグ (video-scripts / assignments と一致)。textbook/glossary 共通の URL に使う。
const TOPIC_SLUGS = [
  "roadmap",
  "feature-value",
  "ai-verification",
  "collaboration",
  "dev-environment",
  "git-github",
  "web",
  "debugging",
  "domain",
  "database",
  "backend-api",
  "frontend-accessibility",
  "testing",
  "security",
  "containers",
  "cloud-cicd",
  "observability-sre",
  "llm-generative-ai",
  "ai-coding-workflow",
  "technical-writing",
  "individual-project",
  "existing-product-improvement",
  "production-readiness",
  "final-presentation",
];
// Part ラベルは 1 箇所だけで管理する (各章 frontmatter には part 番号のみを持たせ、ここで解決)。
const PART_LABELS = {
  0: "テキスト資料",
  1: "Part 1 オリエンテーション",
  2: "Part 2 開発の基本動作",
  3: "Part 3 Webアプリケーション開発",
  4: "Part 4 実行環境と運用",
  5: "Part 5 AIと知識作業",
  6: "Part 6 最終プロジェクト",
  7: "付録",
};

/** YAML 用に文字列を安全にクォートする。 */
function yamlString(s) {
  return `"${s.replace(/\\/g, "\\\\").replace(/"/g, '\\"')}"`;
}

/** 章番号を 2 桁ゼロ詰めにする。 */
function pad2(n) {
  return String(n).padStart(2, "0");
}

/**
 * 相対 Markdown リンクを GitHub blob URL へ書き換える。
 * 本文は textbook/ 配下にあるので、リンクは textbook/ 基準で解決する。
 */
function rewriteLinks(md) {
  return md.replace(/\]\(([^)]+)\)/g, (whole, target) => {
    const trimmed = target.trim();
    if (/^(https?:|mailto:|#|\/)/.test(trimmed)) return whole;
    const hashIndex = trimmed.indexOf("#");
    const filePart = hashIndex >= 0 ? trimmed.slice(0, hashIndex) : trimmed;
    const hashPart = hashIndex >= 0 ? trimmed.slice(hashIndex) : "";
    if (!filePart) return whole;
    const resolved = path.posix.normalize(path.posix.join("textbook", filePart));
    return `](${GH_BLOB}${resolved}${hashPart})`;
  });
}

/**
 * コードフェンスの開閉を追跡しながら各行を処理するヘルパ。
 * cb(line, inFence) を呼び、その戻り値を新しい行とする。
 */
function mapOutsideFences(lines, cb) {
  let inFence = false;
  let marker = "";
  return lines.map((line) => {
    const f = line.match(RE_FENCE);
    if (f) {
      const ch = f[1][0];
      if (!inFence) {
        inFence = true;
        marker = ch;
      } else if (line.trim().startsWith(marker)) {
        inFence = false;
      }
      return line; // フェンス行自体は変更しない
    }
    return cb(line, inFence);
  });
}

/**
 * 本文の見出しを「最小レベルが h2」になるよう相対シフトして正規化する。
 * コードフェンス内の `# ...`(ファイル名・テンプレート例など) は本文ではないので触らない。
 */
function normalizeHeadings(lines) {
  // pass 1: フェンス外の最小見出しレベルを求める
  let inFence = false;
  let marker = "";
  let min = 7;
  for (const line of lines) {
    const f = line.match(RE_FENCE);
    if (f) {
      const ch = f[1][0];
      if (!inFence) {
        inFence = true;
        marker = ch;
      } else if (line.trim().startsWith(marker)) {
        inFence = false;
      }
      continue;
    }
    if (inFence) continue;
    const m = line.match(RE_HEADING);
    if (m) min = Math.min(min, m[1].length);
  }
  if (min === 7) return lines; // フェンス外に見出しが無い
  const delta = 2 - min;
  if (delta === 0) return lines;

  // pass 2: フェンス外の見出しだけシフト
  return mapOutsideFences(lines, (line) => {
    const m = line.match(RE_HEADING);
    if (!m) return line;
    const level = Math.min(6, Math.max(1, m[1].length + delta));
    return `${"#".repeat(level)} ${m[2]}`;
  });
}

/** 前後の空行を畳む。 */
function trimBlank(lines) {
  let start = 0;
  let end = lines.length;
  while (start < end && lines[start].trim() === "") start++;
  while (end > start && lines[end - 1].trim() === "") end--;
  return lines.slice(start, end);
}

/** 簡易 frontmatter パーサ (title / part / partLabel / order のみ扱う)。 */
function parseFrontmatter(text) {
  const m = text.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/);
  if (!m) return { data: {}, body: text };
  const data = {};
  for (const line of m[1].split(/\r?\n/)) {
    const mm = line.match(/^(\w+):\s*(.*)$/);
    if (!mm) continue;
    let v = mm[2].trim();
    if (/^".*"$/.test(v)) {
      v = v.slice(1, -1).replace(/\\"/g, '"').replace(/\\\\/g, "\\");
    } else if (/^-?\d+$/.test(v)) {
      v = Number(v);
    }
    data[mm[1]] = v;
  }
  return { data, body: text.slice(m[0].length) };
}

/**
 * 1 ページ分の Markdown を書き出す (見出し正規化・空行畳み・リンク書換を適用)。
 * transformLines を渡すと、正規化済み行列に対して書き出し前の追加変換を施せる
 * (本文への用語自動リンクなど。見出しが ## 起点に揃った後・リンク書換の前に走る)。
 */
async function writePage(relPath, frontmatter, bodyLines, root = OUT_ROOT, transformLines) {
  const fmLines = Object.entries(frontmatter).map(([k, v]) =>
    typeof v === "number" ? `${k}: ${v}` : `${k}: ${yamlString(v)}`,
  );
  let lines = trimBlank(normalizeHeadings(bodyLines));
  if (transformLines) lines = transformLines(lines);
  const body = rewriteLinks(lines.join("\n"));
  const content = `---\n${fmLines.join("\n")}\n---\n\n${body}\n`;
  const outPath = path.join(root, relPath);
  await mkdir(path.dirname(outPath), { recursive: true });
  await writeFile(outPath, content, "utf8");
}

/**
 * textbook/book/ の章ファイル (正本) をサイト用ページへ変換する。
 * partLabel は frontmatter ではなく part 番号から PART_LABELS で解決する (ラベル重複を避ける)。
 * termIndex (章スラッグ→用語表) が渡された章では、本文の専門用語の初出を同じ章の
 * 用語解説アンカーへ自動リンクする (WCAG AAA 3.1.3 / 3.1.6)。
 */
async function buildTextbook(termIndex = {}) {
  await rm(path.join(OUT_ROOT, "textbook"), { recursive: true, force: true });

  const files = (await readdir(BOOK_DIR))
    .filter((f) => f.endsWith(".md") && f !== "README.md")
    .sort();
  let chapters = 0;
  let linkedChapters = 0;
  for (const file of files) {
    const { data, body } = parseFrontmatter(await readFile(path.join(BOOK_DIR, file), "utf8"));
    const slug = file.replace(/\.md$/, "");
    const part = data.part ?? 0;
    if (part >= 1 && part <= 6) chapters++;
    const terms = termIndex[slug];
    if (terms && terms.length) linkedChapters++;
    await writePage(
      `textbook/${slug}.md`,
      {
        title: data.title ?? slug,
        section: "textbook",
        part,
        partLabel: PART_LABELS[part] ?? data.partLabel ?? "テキスト資料",
        order: data.order ?? 0,
      },
      body.split(/\r?\n/),
      OUT_ROOT,
      terms && terms.length ? (lines) => linkifyGlossaryTerms(lines, terms, slug) : undefined,
    );
  }
  return { pages: files.length, chapters, linkedChapters };
}

/**
 * 用語解説1章ぶんの (正規化後=見出しが ## の) 行から、用語の見出し語・アンカー・読みを取り出す。
 * - アンカーは Astro (Sätteri) と同じ github-slugger でページ単位に採番する (出現順も同じ → 実 id と一致)。
 * - 読みは各用語直下の「- **読み**：…」から拾う (本文側からリンクすると 3.1.6 の発音手段になる)。
 * 本文→用語解説の自動リンク (linkifyGlossaryTerms) が使う用語表の素になる。
 */
function extractGlossaryTerms(lines) {
  const slugger = new GithubSlugger(); // ページ単位 (Astro はファイルごとに採番する)
  const terms = [];
  let inFence = false;
  let marker = "";
  let current = null;
  for (const line of lines) {
    const f = line.match(RE_FENCE);
    if (f) {
      const ch = f[1][0];
      if (!inFence) {
        inFence = true;
        marker = ch;
      } else if (line.trim().startsWith(marker)) {
        inFence = false;
      }
      continue;
    }
    if (inFence) continue;
    const h = line.match(/^##\s+(.+?)\s*$/);
    if (h) {
      current = { term: h[1].trim(), anchor: slugger.slug(h[1].trim()), reading: "" };
      terms.push(current);
      continue;
    }
    if (current && !current.reading) {
      const r = line.match(/^[-*]\s*\*\*読み\*\*\s*[：:]\s*(.+?)\s*$/);
      if (r) current.reading = r[1].trim();
    }
  }
  return terms;
}

// 本文→用語解説の自動リンク (WCAG 2.2 AAA: 3.1.3 Unusual Words / 3.1.6 Pronunciation)。
// 方針は site/README とコメント参照: 章スコープ・初出のみ・英数字を含むジャーゴンだけ・安全側マッチ。

const TERM_WORD = /[A-Za-z0-9]/;
// 行内でリンクを入れてはいけない断片 (verbatim で残す): インラインコード / Markdownリンク・画像 / 生HTMLタグ。
const PROTECTED_SPAN = /(`{1,3}[^`]*`{1,3}|!?\[[^\]]*\]\([^)]*\)|!?\[[^\]]*\]\[[^\]]*\]|<[^>]+>)/g;

/**
 * 見出し語から「本文中で実際に書かれる形」の別名を導く。
 * - 末尾の注記 (（…）/ (…)) を落とす: "MoSCoW（Must / …）" → "MoSCoW"
 * - " / " 区切りを別名へ割る: "HttpOnly / Secure / SameSite" → 3語
 * - 2文字以上かつ英数字を含むものだけ残す (和文一般語・1文字は誤リンクしやすいので対象外)。
 */
function deriveAliases(term) {
  const core = term.replace(/[（(].*$/s, "").trim();
  return core
    .split(/\s*\/\s*/)
    .map((s) => s.trim())
    .filter((s) => s.length >= 2 && TERM_WORD.test(s));
}

/** 用語表 → 別名リスト [{alias, anchor, reading}] (同名は最初を優先, 長い順)。 */
function buildAliasList(terms) {
  const byAlias = new Map();
  for (const t of terms) {
    for (const alias of deriveAliases(t.term)) {
      if (!byAlias.has(alias)) byAlias.set(alias, { anchor: t.anchor, reading: t.reading || "" });
    }
  }
  return [...byAlias.entries()]
    .map(([alias, v]) => ({ alias, ...v }))
    .sort((a, b) => b.alias.length - a.alias.length);
}

/** 語境界を考慮して needle の出現位置を返す (英字端のみ境界要求 / 大文字小文字は区別)。無ければ -1。 */
function indexOfTerm(hay, needle) {
  const headWord = TERM_WORD.test(needle[0]);
  const tailWord = TERM_WORD.test(needle[needle.length - 1]);
  let from = 0;
  for (;;) {
    const i = hay.indexOf(needle, from);
    if (i < 0) return -1;
    const before = i > 0 ? hay[i - 1] : "";
    const after = i + needle.length < hay.length ? hay[i + needle.length] : "";
    if ((!headWord || !TERM_WORD.test(before)) && (!tailWord || !TERM_WORD.test(after))) return i;
    from = i + 1;
  }
}

/** HTML 属性値用の最小エスケープ。 */
function escapeAttr(s) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

/** 用語解説アンカーへの raw HTML リンクを作る。 */
function termAnchor(alias, text, chapterSlug) {
  const href = `${SITE_BASE}/glossary/${chapterSlug}/#${alias.anchor}`;
  const title = alias.reading ? ` title="${escapeAttr(alias.reading)}"` : "";
  return `<a class="term-link" href="${href}"${title}>${text}</a>`;
}

/** プレーンなテキスト断片の中で、未リンク用語の初出 (左優先・長い順) を <a> へ置換する。 */
function linkifyPlain(text, aliases, linked, chapterSlug) {
  if (!text) return text;
  let out = "";
  let rest = text;
  let guard = 0;
  for (;;) {
    if (guard++ > 5000) {
      out += rest;
      break;
    }
    let best = null;
    for (const a of aliases) {
      if (linked.has(a.alias)) continue;
      const idx = indexOfTerm(rest, a.alias);
      if (idx < 0) continue;
      if (!best || idx < best.index) best = { index: idx, a };
      if (best.index === 0) break;
    }
    if (!best) {
      out += rest;
      break;
    }
    const { index, a } = best;
    out +=
      rest.slice(0, index) + termAnchor(a, rest.slice(index, index + a.alias.length), chapterSlug);
    linked.add(a.alias);
    rest = rest.slice(index + a.alias.length);
  }
  return out;
}

/** 1行を、保護断片 (コード/リンク/生HTML) を避けてリンク化する。 */
function linkifyLine(line, aliases, linked, chapterSlug) {
  let out = "";
  let last = 0;
  PROTECTED_SPAN.lastIndex = 0;
  let m;
  while ((m = PROTECTED_SPAN.exec(line)) !== null) {
    out += linkifyPlain(line.slice(last, m.index), aliases, linked, chapterSlug);
    out += m[0]; // 保護断片はそのまま
    last = m.index + m[0].length;
    if (m[0].length === 0) PROTECTED_SPAN.lastIndex++; // 0幅マッチで無限ループしない
  }
  out += linkifyPlain(line.slice(last), aliases, linked, chapterSlug);
  return out;
}

/**
 * テキスト本文の行列に、同じ章の用語解説への自動リンクを差し込む (初出のみ)。
 * コードフェンス内と見出し行はスキップする。terms が空なら素通り。
 */
function linkifyGlossaryTerms(lines, terms, chapterSlug) {
  const aliases = buildAliasList(terms ?? []);
  if (!aliases.length) return lines;
  const linked = new Set(); // 文書内で初出のみ
  let inFence = false;
  let marker = "";
  return lines.map((line) => {
    const f = line.match(RE_FENCE);
    if (f) {
      const ch = f[1][0];
      if (!inFence) {
        inFence = true;
        marker = ch;
      } else if (line.trim().startsWith(marker)) {
        inFence = false;
      }
      return line;
    }
    if (inFence) return line; // コードブロックは触らない
    if (RE_HEADING.test(line)) return line; // 見出しにはリンクを入れない
    if (linked.size >= aliases.length) return line; // 全用語リンク済みなら以降は素通り
    return linkifyLine(line, aliases, linked, chapterSlug);
  });
}

/**
 * 単一ファイル (glossary.md) を章へ分割してサイト用ページへ変換する。
 * `# Part N` と最初の `## 第N章` の間にある Part 導入文は、その Part 先頭章の冒頭へ前置して保全する。
 * URL スラッグは textbook と揃える (NN-topic)。
 * あわせて、本文→定義の自動リンク用に用語索引 (src/data/glossary-terms.json) を生成する。
 */
async function splitGlossary() {
  const section = "glossary";
  const raw = await readFile(GLOSSARY_SRC, "utf8");
  const lines = raw.split(/\r?\n/);

  let phase = "front";
  const front = [];
  const chapters = [];
  let cur = null;
  let pendingPartIntro = null; // Part 見出し直後〜最初の章までの導入文

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (i === 0 && /^#\s+/.test(line)) continue; // 本タイトルは捨てる

    if (RE_PART.test(line)) {
      phase = "part";
      pendingPartIntro = []; // 次の章へ前置する導入文を集め始める
      cur = null;
      continue;
    }
    if (phase === "part") {
      const mCh = line.match(RE_CHAPTER);
      if (mCh) {
        const lead =
          pendingPartIntro && pendingPartIntro.length ? [...trimBlank(pendingPartIntro), ""] : [];
        pendingPartIntro = null; // 同 Part の2章目以降には前置しない
        const ch = { num: Number(mCh[1]), title: `第${mCh[1]}章 ${mCh[2]}`, lines: lead };
        chapters.push(ch);
        cur = ch.lines;
        continue;
      }
    }
    if (phase === "front") front.push(line);
    else if (pendingPartIntro)
      pendingPartIntro.push(line); // Part 導入文を保全
    else if (cur) cur.push(line);
  }

  await rm(path.join(OUT_ROOT, section), { recursive: true, force: true });

  await writePage(
    `${section}/intro.md`,
    { title: "用語解説について", section, part: 0, partLabel: "用語解説", order: 0 },
    front,
  );

  const seen = new Set();
  const termIndex = {}; // { "07-web": [{ term, anchor, reading }, ...], ... }
  for (const ch of chapters) {
    if (seen.has(ch.num)) continue;
    seen.add(ch.num);
    const slug = `${pad2(ch.num)}-${TOPIC_SLUGS[ch.num - 1] ?? "chapter"}`;
    // 見出しレベルを先に正規化 (## 起点) してから索引と本文の両方に使う。索引のアンカーは
    // この正規化後の見出しテキストから採番するので、生成ページの実 id と一致する。
    const normalized = trimBlank(normalizeHeadings(ch.lines));
    termIndex[slug] = extractGlossaryTerms(normalized);
    await writePage(
      `${section}/${slug}.md`,
      { title: ch.title, section, part: 0, partLabel: "用語解説", order: ch.num },
      normalized,
    );
  }

  return { chapters: seen.size, termIndex };
}

/**
 * video-scripts/chapterNN-<slug>.md (正本) を各動画ページへ埋め込む用のページへ変換する。
 * ページにはタイトル・動画・教材導線が既にあるので、先頭のタイトル(h1)とメタ箇条書き、
 * 「## このファイルについて」を捨て、「## 台本」配下のスライド本文だけを採る。
 * 見出し正規化で各スライド (### Slide…) は h2 起点へ揃う。
 */
async function buildScripts() {
  await rm(SCRIPTS_OUT, { recursive: true, force: true });

  const files = (await readdir(SCRIPTS_DIR)).filter((f) => /^chapter\d+-.+\.md$/.test(f)).sort();
  let count = 0;
  for (const file of files) {
    const m = file.match(/^chapter(\d+)-(.+)\.md$/);
    if (!m) continue;
    const chapter = Number(m[1]);
    const slug = m[2];
    const lines = (await readFile(path.join(SCRIPTS_DIR, file), "utf8")).split(/\r?\n/);

    const h1 = lines.find((l) => /^#\s+/.test(l));
    const title = h1 ? h1.replace(/^#\s+/, "").trim() : `第${chapter}章`;

    // 「## 台本」配下を本文にする。無ければ最初の見出し以降にフォールバック。
    const bodyStart = lines.findIndex((l) => /^##\s+台本\s*$/.test(l));
    const body =
      bodyStart >= 0
        ? lines.slice(bodyStart + 1)
        : (() => {
            const i = lines.findIndex((l) => /^##\s+/.test(l));
            return i >= 0 ? lines.slice(i) : lines;
          })();

    await writePage(`${pad2(chapter)}-${slug}.md`, { title, chapter, slug }, body, SCRIPTS_OUT);
    count++;
  }
  return { scripts: count };
}

/** Markdown のセル ( [ラベル](URL) ) から最初のリンク URL を取り出す。 */
function firstLinkUrl(cell) {
  const m = cell.match(/\]\(([^)]+)\)/);
  return m ? m[1].trim() : "";
}

/**
 * YouTube URL から動画 ID を取り出す (見つからなければ null)。
 * watch?v= だけでなく youtu.be / embed / live / shorts の各形にも対応する
 * (README が正本=人が編集する場所なので、URL 形が変わっても拾えるようにしておく)。
 */
function youtubeIdFromUrl(url) {
  const m = url.match(/(?:[?&]v=|youtu\.be\/|\/embed\/|\/live\/|\/shorts\/)([\w-]{6,})/);
  return m ? m[1] : null;
}

/** YouTube URL からプレイリスト ID を取り出す (見つからなければ null)。 */
function playlistIdFromUrl(url) {
  const m = url.match(/[?&]list=([\w-]+)/);
  return m ? m[1] : null;
}

/**
 * README.md の「チャプター一覧」表 (正本) を解析し、動画メタの配列を作る。
 * 表の各行: | 章 | Part | テーマ | 動画 | 台本 | 課題 |
 * - 動画セルが watch URL なら youtubeId を抽出、Playlist リンクなら youtubeId = null。
 * - スラッグは台本リンクのファイル名 (chapterNN-<slug>.md) から取り、textbook/glossary と揃える。
 * - 相対リンクは GitHub の blob / tree URL へ展開する。
 * README を正本にすることで、動画・台本・テキスト・課題の対応をサイト側で二重管理しない。
 */
function parseVideoTable(readme) {
  const lines = readme.split(/\r?\n/);
  const items = [];
  let playlistId = null;

  for (const line of lines) {
    // 表のデータ行のみ: 行頭が | + 2桁の章番号
    if (!/^\|\s*\d{2}\s*\|/.test(line)) continue;
    const cells = line.split("|").map((c) => c.trim());
    // cells = ["", "01", "Part 1: ...", "テーマ", "動画", "台本", "課題", ""]
    if (cells.length < 7) continue;

    const chapter = Number(cells[1]);
    const partMatch = cells[2].match(/Part\s+(\d+)/);
    const part = partMatch ? Number(partMatch[1]) : 0;
    const title = cells[3];

    const videoUrl = firstLinkUrl(cells[4]);
    const scriptRel = firstLinkUrl(cells[5]); // video-scripts/chapterNN-<slug>.md
    const assignmentRel = firstLinkUrl(cells[6]); // assignments/chapterNN-<slug>/

    const youtubeId = youtubeIdFromUrl(videoUrl);
    const listId = playlistIdFromUrl(videoUrl);
    if (listId && !playlistId) playlistId = listId;

    // スラッグは台本ファイル名から取る。表が崩れても章番号→正本スラッグ (TOPIC_SLUGS) へ
    // フォールバックし、生成済みページ (textbook/glossary は NN-<topic>) と URL が必ず一致するようにする。
    const slugMatch = scriptRel.match(/chapter\d+-(.+?)\.md/);
    const slug = slugMatch ? slugMatch[1] : (TOPIC_SLUGS[chapter - 1] ?? `chapter${chapter}`);
    const pad = pad2(chapter);

    items.push({
      chapter,
      part,
      partLabel: PART_LABELS[part] ?? "",
      title,
      slug,
      youtubeId,
      textbookId: `textbook/${pad}-${slug}`,
      glossaryId: `glossary/${pad}-${slug}`,
      scriptId: `${pad}-${slug}`,
      scriptUrl: /^https?:/.test(scriptRel) ? scriptRel : `${GH_BLOB}${scriptRel}`,
      assignmentUrl: /^https?:/.test(assignmentRel) ? assignmentRel : `${GH_TREE}${assignmentRel}`,
    });
  }

  if (!playlistId) {
    for (const line of lines) {
      const l = playlistIdFromUrl(line);
      if (l) {
        playlistId = l;
        break;
      }
    }
  }
  playlistId = playlistId ?? PLAYLIST_FALLBACK;

  return {
    playlistId,
    playlistUrl: `https://www.youtube.com/playlist?list=${playlistId}`,
    items,
  };
}

/** README の動画表から src/data/videos.json を生成する。 */
async function buildVideos() {
  const readme = await readFile(README_SRC, "utf8");
  const data = parseVideoTable(readme);
  await mkdir(DATA_DIR, { recursive: true });
  await writeFile(path.join(DATA_DIR, "videos.json"), `${JSON.stringify(data, null, 2)}\n`, "utf8");
  return { videos: data.items.length };
}

async function main() {
  // 用語解説を先に分割して用語表 (termIndex) を得る。textbook はそれを使って本文の用語を
  // 同じ章の用語解説アンカーへ自動リンクするので、glossary → textbook の順に走らせる。
  const glossary = await splitGlossary();
  const textbook = await buildTextbook(glossary.termIndex);
  const scripts = await buildScripts();
  const videos = await buildVideos();

  // サニティ: 章数が下限未満 = 生成が壊れている。空サイトを緑でデプロイさせない。
  if (textbook.chapters < 24) {
    throw new Error(`textbook 章数が異常: ${textbook.chapters} (期待 24)`);
  }
  if (glossary.chapters < 24) {
    throw new Error(`glossary 章数が異常: ${glossary.chapters} (期待 24)`);
  }
  if (scripts.scripts < 24) {
    throw new Error(`動画台本が異常: ${scripts.scripts}章 (期待 24)`);
  }
  if (videos.videos < 24) {
    throw new Error(`README の動画表が異常: ${videos.videos}章 (期待 24)`);
  }

  console.log(
    `[split-book] textbook: ${textbook.pages}ページ (${textbook.chapters}章, 用語リンク ${textbook.linkedChapters}章) / glossary: ${glossary.chapters}章 / scripts: ${scripts.scripts}章 / videos: ${videos.videos}章 を生成`,
  );
}

// テストから純粋関数を検証できるように公開する。
export {
  yamlString,
  pad2,
  rewriteLinks,
  normalizeHeadings,
  trimBlank,
  parseFrontmatter,
  parseVideoTable,
  extractGlossaryTerms,
  deriveAliases,
  indexOfTerm,
  linkifyGlossaryTerms,
};

// 直接実行のときだけ生成を走らせる。
if (import.meta.main) {
  main().catch((err) => {
    console.error("[split-book] 失敗:", err);
    process.exit(1);
  });
}
