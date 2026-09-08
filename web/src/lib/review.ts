import "server-only";
import { readFileSync } from "node:fs";
import path from "node:path";

const REPORTS = path.join(process.cwd(), "resources", "kb", "reports");

export interface ReviewNote {
  /** Mã lá trong KB, ví dụ major_02 */
  cardId: string;
  note: string;
}

export interface ReviewSection {
  heading: string;
  notes: ReviewNote[];
  /** Dòng không gắn với lá cụ thể */
  loose: string[];
}

/**
 * Bóc báo cáo D thành từng mục. Dòng dạng "- <mã lá>: <ghi chú>" là chỗ cần
 * soát cho đúng lá đó; dòng còn lại giữ nguyên làm ghi chú chung của mục.
 */
export function uncertainNotes(): ReviewSection[] {
  let raw: string;
  try {
    raw = readFileSync(path.join(REPORTS, "D_cho_khong_chac.md"), "utf8");
  } catch {
    return [];
  }
  const sections: ReviewSection[] = [];
  let current: ReviewSection | null = null;

  for (const line of raw.split("\n")) {
    const h2 = line.match(/^##\s+(.*)$/);
    if (h2) {
      current = { heading: h2[1].trim(), notes: [], loose: [] };
      sections.push(current);
      continue;
    }
    if (!current) continue;
    const item = line.match(/^-\s+([a-z]+_[0-9a-z]+):\s*(.+)$/);
    if (item) {
      current.notes.push({ cardId: item[1], note: item[2].trim() });
    } else if (/^-\s+\S/.test(line)) {
      current.loose.push(line.replace(/^-\s+/, "").trim());
    }
  }
  return sections.filter((s) => s.notes.length || s.loose.length);
}

export interface SimilarPair {
  rank: number;
  aId: string;
  aName: string;
  bId: string;
  bName: string;
  cosine: string;
  aCore: string;
  bCore: string;
}

/** Bóc bảng 20 cặp cot_loi gần trùng trong báo cáo E. */
export function similarPairs(): SimilarPair[] {
  let raw: string;
  try {
    raw = readFileSync(path.join(REPORTS, "E_top20_cot_loi.md"), "utf8");
  } catch {
    return [];
  }
  const out: SimilarPair[] = [];
  for (const line of raw.split("\n")) {
    if (!/^\|\s*\d+\s*\|/.test(line)) continue;
    const cells = line.split("|").slice(1, -1).map((c) => c.trim());
    if (cells.length < 6) continue;
    const parse = (c: string) => {
      const m = c.match(/^([a-z]+_[0-9a-z]+)\s*\((.+)\)$/);
      return m ? { id: m[1], name: m[2] } : { id: "", name: c };
    };
    const a = parse(cells[1]);
    const b = parse(cells[2]);
    out.push({
      rank: Number(cells[0]),
      aId: a.id,
      aName: a.name,
      bId: b.id,
      bName: b.name,
      cosine: cells[3],
      aCore: cells[4],
      bCore: cells[5],
    });
  }
  return out;
}
