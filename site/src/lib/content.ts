import { getCollection, type CollectionEntry } from "astro:content";

export type DocEntry = CollectionEntry<"docs">;

// セクションの並び順 (テキスト資料 → 用語解説)。
const sectionRank: Record<string, number> = { textbook: 0, glossary: 1 };
const sectionLabel: Record<string, string> = {
  textbook: "テキスト資料",
  glossary: "用語解説",
};

/** base を考慮したドキュメントの URL を作る。 */
export function docHref(id: string): string {
  const base = import.meta.env.BASE_URL.replace(/\/$/, "");
  return `${base}/${id}/`;
}

/** section → part → order の優先度でソートする。 */
export function sortDocs(docs: DocEntry[]): DocEntry[] {
  return [...docs].sort((a, b) => {
    const s = (sectionRank[a.data.section] ?? 99) - (sectionRank[b.data.section] ?? 99);
    if (s !== 0) return s;
    if (a.data.part !== b.data.part) return a.data.part - b.data.part;
    return a.data.order - b.data.order;
  });
}

export interface NavItem {
  id: string;
  title: string;
  href: string;
}
export interface NavGroup {
  section: string;
  label: string;
  items: NavItem[];
}

/** サイドバー用のグループ構造と、prev/next 用のフラット配列を返す。 */
export async function getNav(): Promise<{
  ordered: DocEntry[];
  sections: { id: string; label: string; groups: NavGroup[] }[];
}> {
  const ordered = sortDocs(await getCollection("docs"));
  const sections: { id: string; label: string; groups: NavGroup[] }[] = [];

  for (const d of ordered) {
    const sec = sections.find((s) => s.id === d.data.section);
    const section =
      sec ??
      (sections.push({
        id: d.data.section,
        label: sectionLabel[d.data.section] ?? d.data.section,
        groups: [],
      }),
      sections[sections.length - 1]);

    const label = d.data.partLabel || section.label;
    let group = section.groups.find((g) => g.label === label);
    if (!group) {
      group = { section: d.data.section, label, items: [] };
      section.groups.push(group);
    }
    group.items.push({
      id: d.id,
      title: d.data.title,
      href: docHref(d.id),
    });
  }

  return { ordered, sections };
}
