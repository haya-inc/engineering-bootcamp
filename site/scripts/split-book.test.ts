import { describe, expect, it } from "vitest";
import {
  deriveAliases,
  deriveDescription,
  extractGlossaryTerms,
  indexOfTerm,
  linkifyGlossaryTerms,
  normalizeHeadings,
  pad2,
  parseFrontmatter,
  parseVideoTable,
  rewriteLinks,
  stripInlineMarkdown,
  trimBlank,
  truncateForMeta,
  yamlString,
} from "./split-book.mjs";

describe("rewriteLinks", () => {
  it("相対リンク (../) を GitHub blob URL へ書き換える", () => {
    expect(rewriteLinks("[課題](../assignments/README.md)")).toBe(
      "[課題](https://github.com/haya-inc/engineering-bootcamp/blob/main/assignments/README.md)",
    );
  });

  it("同ディレクトリの glossary.md は textbook/ 基準で解決する", () => {
    expect(rewriteLinks("[用語](glossary.md#はじめに)")).toBe(
      "[用語](https://github.com/haya-inc/engineering-bootcamp/blob/main/textbook/glossary.md#はじめに)",
    );
  });

  it("絶対URL・ページ内アンカーはそのまま", () => {
    expect(rewriteLinks("[x](https://example.com)")).toBe("[x](https://example.com)");
    expect(rewriteLinks("[x](#section)")).toBe("[x](#section)");
  });
});

describe("normalizeHeadings", () => {
  it("最小見出しが h2 になるよう相対シフトする", () => {
    expect(normalizeHeadings(["### A", "#### B", "本文"])).toEqual(["## A", "### B", "本文"]);
  });

  it("コードフェンス内の見出しは触らない", () => {
    expect(normalizeHeadings(["### A", "```", "# .env.example", "```", "#### B"])).toEqual([
      "## A",
      "```",
      "# .env.example",
      "```",
      "### B",
    ]);
  });

  it("既に h2 起点なら変えない", () => {
    expect(normalizeHeadings(["## A", "### B"])).toEqual(["## A", "### B"]);
  });

  it("入れ子フェンス (4連の中の3連) の内側 # はシフトしない", () => {
    // 旧実装は内側の ``` で外側の ```` を誤って閉じ、# を本文見出し扱いしていた (回帰防止)。
    expect(
      normalizeHeadings([
        "### 章",
        "````md",
        "```dockerfile",
        "# syntax",
        "```",
        "````",
        "#### 節",
      ]),
    ).toEqual(["## 章", "````md", "```dockerfile", "# syntax", "```", "````", "### 節"]);
  });

  it("情報文字列付きの行ではフェンスを閉じない (閉じは記号+空白のみ)", () => {
    expect(
      normalizeHeadings(["### A", "```", "# inside", "```ruby", "# also", "```", "#### B"]),
    ).toEqual(["## A", "```", "# inside", "```ruby", "# also", "```", "### B"]);
  });

  it("空見出し `# ` だけの行は見出し扱いせず全体シフトを起こさない", () => {
    expect(normalizeHeadings(["## A", "# ", "### B"])).toEqual(["## A", "# ", "### B"]);
  });
});

describe("pad2", () => {
  it("1桁をゼロ詰めする", () => {
    expect(pad2(1)).toBe("01");
    expect(pad2(24)).toBe("24");
  });
});

describe("yamlString", () => {
  it("ダブルクォートをエスケープする", () => {
    expect(yamlString('a"b')).toBe('"a\\"b"');
  });
});

describe("trimBlank", () => {
  it("前後の空行を畳む", () => {
    expect(trimBlank(["", "本文", "", ""])).toEqual(["本文"]);
  });
});

describe("parseFrontmatter", () => {
  it("frontmatter を data と body に分ける", () => {
    const { data, body } = parseFrontmatter(
      '---\ntitle: "第1章 研修の地図を持つ"\npart: 1\norder: 1\n---\n\n本文です。\n',
    );
    expect(data).toEqual({ title: "第1章 研修の地図を持つ", part: 1, order: 1 });
    expect(body.trim()).toBe("本文です。");
  });

  it("frontmatter が無ければ body をそのまま返す", () => {
    expect(parseFrontmatter("見出しなし本文").data).toEqual({});
  });
});

describe("parseVideoTable", () => {
  const README = [
    "# Engineering Bootcamp",
    "",
    "| 章 | Part | テーマ | 動画 | 台本 | 課題 |",
    "| --- | --- | --- | --- | --- | --- |",
    "| 01 | Part 1: オリエンテーション | 研修ロードマップ | [YouTube](https://www.youtube.com/watch?v=VGFokDPmqyI) | [台本](video-scripts/chapter01-roadmap.md) | [課題](assignments/chapter01-roadmap/) |",
    "| 06 | Part 2: 開発の基本動作 | 変更をレビューにつなげる | [Playlist](https://www.youtube.com/playlist?list=PLhpCGFN2YpZ7DiryhbTWChiynuN86k_X_) | [台本](video-scripts/chapter06-git-github.md) | [課題](assignments/chapter06-git-github/) |",
  ].join("\n");

  it("watch URL から youtubeId・スラッグ・各URLを組み立てる", () => {
    const { items } = parseVideoTable(README);
    expect(items).toHaveLength(2);
    expect(items[0]).toEqual({
      chapter: 1,
      part: 1,
      partLabel: "Part 1 オリエンテーション",
      title: "研修ロードマップ",
      slug: "roadmap",
      youtubeId: "VGFokDPmqyI",
      textbookId: "textbook/01-roadmap",
      glossaryId: "glossary/01-roadmap",
      scriptId: "01-roadmap",
      scriptUrl:
        "https://github.com/haya-inc/engineering-bootcamp/blob/main/video-scripts/chapter01-roadmap.md",
      assignmentUrl:
        "https://github.com/haya-inc/engineering-bootcamp/tree/main/assignments/chapter01-roadmap/",
    });
  });

  it("Playlist 行は youtubeId を null にし、playlistId を検出する", () => {
    const { items, playlistId, playlistUrl } = parseVideoTable(README);
    expect(items[1].youtubeId).toBeNull();
    expect(items[1].slug).toBe("git-github");
    expect(playlistId).toBe("PLhpCGFN2YpZ7DiryhbTWChiynuN86k_X_");
    expect(playlistUrl).toContain("list=PLhpCGFN2YpZ7DiryhbTWChiynuN86k_X_");
  });

  it("表以外の行 (見出し・区切り) は無視する", () => {
    expect(parseVideoTable("# タイトル\n本文だけ\n").items).toEqual([]);
  });

  it("youtu.be / embed 形式の動画URLからも ID を取り出す", () => {
    const md = [
      "| 02 | Part 1: オリエンテーション | 短縮URL | [YouTube](https://youtu.be/N1ch5oHyjLs) | [台本](video-scripts/chapter02-feature-value.md) | [課題](assignments/chapter02-feature-value/) |",
      "| 03 | Part 1: オリエンテーション | 埋め込みURL | [YouTube](https://www.youtube.com/embed/5X_GUCZSwOI) | [台本](video-scripts/chapter03-ai-verification.md) | [課題](assignments/chapter03-ai-verification/) |",
    ].join("\n");
    const { items } = parseVideoTable(md);
    expect(items[0].youtubeId).toBe("N1ch5oHyjLs");
    expect(items[1].youtubeId).toBe("5X_GUCZSwOI");
  });
});

describe("extractGlossaryTerms", () => {
  it("## 用語名 から見出し語・アンカー・読みを取り出す (アンカーは github-slugger 採番)", () => {
    const lines = [
      "## HTTP",
      "- **読み**：エイチティーティーピー（HyperText Transfer Protocol）",
      "- **一言で言うと**：約束ごと。",
      "",
      "## query string",
      "- **読み**：クエリ",
    ];
    expect(extractGlossaryTerms(lines)).toEqual([
      {
        term: "HTTP",
        anchor: "http",
        reading: "エイチティーティーピー（HyperText Transfer Protocol）",
      },
      { term: "query string", anchor: "query-string", reading: "クエリ" },
    ]);
  });

  it("複数語見出しのアンカーは Astro(Sätteri) と同じく ' / ' を二重ダッシュにする", () => {
    const [t] = extractGlossaryTerms(["## HttpOnly / Secure / SameSite", "- **読み**：…"]);
    expect(t.anchor).toBe("httponly--secure--samesite");
  });

  it("コードフェンス内の ## は用語として拾わない", () => {
    const lines = ["## API", "```", "## これはコード", "```"];
    expect(extractGlossaryTerms(lines).map((t) => t.term)).toEqual(["API"]);
  });
});

describe("deriveAliases", () => {
  it("末尾の注記 (（…）) を落とす", () => {
    expect(deriveAliases("MoSCoW（Must / Should / Could / Won't）")).toEqual(["MoSCoW"]);
  });
  it("' / ' 区切りを別名へ割る", () => {
    expect(deriveAliases("HttpOnly / Secure / SameSite")).toEqual([
      "HttpOnly",
      "Secure",
      "SameSite",
    ]);
  });
  it("英数字を含まない和文一般語は対象外", () => {
    expect(deriveAliases("検証")).toEqual([]);
  });
  it("英数字を含めば和文混じり・空白入りも残す", () => {
    expect(deriveAliases("Networkタブ")).toEqual(["Networkタブ"]);
    expect(deriveAliases("query string")).toEqual(["query string"]);
  });
});

describe("indexOfTerm", () => {
  it("英字端は語境界を要求する (body が everybody の一部に当たらない)", () => {
    expect(indexOfTerm("everybody knows", "body")).toBe(-1);
    expect(indexOfTerm("the body here", "body")).toBe(4);
  });
  it("大文字小文字を区別する", () => {
    expect(indexOfTerm("Body text", "body")).toBe(-1);
  });
  it("和文に接する端は境界を要求しない (Networkタブ が直後の和字に続いても当たる)", () => {
    expect(indexOfTerm("Networkタブを開く", "Networkタブ")).toBe(0);
  });
});

describe("stripInlineMarkdown", () => {
  it("リンクはラベルだけ残し、画像・コード・強調記号を外す", () => {
    expect(stripInlineMarkdown("本文 [book/](book/) の別冊である。")).toBe(
      "本文 book/ の別冊である。",
    );
    expect(stripInlineMarkdown("`commit` と **太字** と *斜体*")).toBe("commit と 太字 と 斜体");
    expect(stripInlineMarkdown("図 ![alt](x.png) を消す")).toBe("図  を消す");
  });

  it("snake_case のアンダースコアは壊さない", () => {
    expect(stripInlineMarkdown("api_key を使う")).toBe("api_key を使う");
  });
});

describe("truncateForMeta", () => {
  it("maxLen 以下はそのまま返す", () => {
    expect(truncateForMeta("短い文。", 120)).toBe("短い文。");
  });

  it("句点で完全文を詰め、超える文は落とす", () => {
    const text = "一文目です。二文目です。三文目です。";
    expect(truncateForMeta(text, 8)).toBe("一文目です。"); // 2 文目を足すと 8 字超なので 1 文で止める
    expect(truncateForMeta(text, 13)).toBe("一文目です。二文目です。"); // 2 文 (12 字) は収まる
  });

  it("1 文目が長すぎるときは字数で丸めて省略記号", () => {
    expect(truncateForMeta("あいうえおかきくけこさしすせそ", 10)).toBe("あいうえおかきくけ…");
  });
});

describe("deriveDescription", () => {
  it("最初の地の文の段落を 1 文に丸めて返す", () => {
    const lines = ["# 見出し", "", "最初の段落です。続きの文もあります。", "", "次の段落。"];
    expect(deriveDescription(lines, 120)).toBe("最初の段落です。続きの文もあります。");
  });

  it("見出し・箇条書き・コードフェンスを飛ばして地の文を拾う", () => {
    const lines = ["## 用語名", "- **読み**：…", "```", "code", "```", "", "ここが地の文。"];
    expect(deriveDescription(lines, 120)).toBe("ここが地の文。");
  });

  it("地の文が無ければ空文字 (テンプレへフォールバックさせる)", () => {
    expect(deriveDescription(["## 見出しだけ", "- 箇条書き"], 120)).toBe("");
  });

  it("段落内のインライン Markdown は素のテキストへ落とす", () => {
    expect(deriveDescription(["本文 [章](ch.md) と `code` を含む段落。"], 120)).toBe(
      "本文 章 と code を含む段落。",
    );
  });
});

describe("linkifyGlossaryTerms", () => {
  const terms = [
    { term: "HTTP", anchor: "http", reading: "エイチティーティーピー" },
    { term: "API", anchor: "api", reading: "エーピーアイ" },
  ];
  const run = (lines: string[]) => linkifyGlossaryTerms(lines, terms, "07-web").join("\n");

  it("初出だけをリンクし、2回目以降はそのまま残す", () => {
    const out = run(["HTTPで取りに行き、続いてHTTPで返す。"]);
    expect(out).toBe(
      '<a class="term-link" href="/glossary/07-web/#http" title="エイチティーティーピー">HTTP</a>で取りに行き、続いてHTTPで返す。',
    );
  });

  it("インラインコード内・既存リンク内は対象にしない", () => {
    expect(run(["`HTTP` は素のまま、本文の HTTP だけ貼る"])).toBe(
      '`HTTP` は素のまま、本文の <a class="term-link" href="/glossary/07-web/#http" title="エイチティーティーピー">HTTP</a> だけ貼る',
    );
    expect(run(["[HTTP入門](https://example.com) は触らない"])).toBe(
      "[HTTP入門](https://example.com) は触らない",
    );
  });

  it("見出し行・コードフェンス内はリンクしない", () => {
    expect(run(["## HTTP の話", "```", "HTTP", "```"])).toEqual(
      ["## HTTP の話", "```", "HTTP", "```"].join("\n"),
    );
  });

  it("用語表が空なら素通りする", () => {
    expect(linkifyGlossaryTerms(["HTTP を使う"], [], "07-web")).toEqual(["HTTP を使う"]);
  });
});
