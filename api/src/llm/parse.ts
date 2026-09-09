/**
 * Bóc bài luận có cấu trúc từ đầu ra của mô hình.
 *
 * Bài vẫn là văn xuôi liền mạch khi đọc, nhưng gói trong JSON để giao diện
 * biết đoạn nào nói lá nào và đâu là câu chốt. Mô hình thỉnh thoảng bọc JSON
 * trong dấu nháy ba hoặc dặm thêm một câu ngoài ngoặc, nên phần bóc này phải
 * chịu được mấy kiểu đó chứ không được đổ vỡ — hỏng thì rơi về văn xuôi thuần
 * y như trước, không ai mất bài.
 */

export interface ReadingPart {
  /** Số thứ tự vị trí trong kiểu trải, bắt đầu từ 1 */
  stt: number;
  doan: string;
}

export interface ReadingParts {
  toanCanh: string;
  theoViTri: ReadingPart[];
  ket: string;
}

/** Cắt lấy khối JSON đầu tiên nằm trong chuỗi, kể cả khi bị bọc nháy ba. */
function carveJson(text: string): string | null {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const body = fenced ? fenced[1] : text;
  const open = body.indexOf("{");
  const close = body.lastIndexOf("}");
  if (open === -1 || close <= open) return null;
  return body.slice(open, close + 1);
}

function str(v: unknown): string {
  return typeof v === "string" ? v.trim() : "";
}

/**
 * Trả về phần có cấu trúc, hoặc null nếu đầu ra không đúng khuôn. Đòi hỏi tối
 * thiểu: có câu chốt và có ít nhất một đoạn theo vị trí — thiếu một trong hai
 * thì coi như mô hình đã trả văn xuôi, đừng cố ghép cho có.
 */
export function parseParts(text: string): ReadingParts | null {
  const raw = carveJson(text);
  if (!raw) return null;

  let obj: Record<string, unknown>;
  try {
    obj = JSON.parse(raw) as Record<string, unknown>;
  } catch {
    return null;
  }
  if (!obj || typeof obj !== "object") return null;

  const theoViTri = Array.isArray(obj.theo_vi_tri)
    ? obj.theo_vi_tri
        .map((p, i) => {
          const o = (p ?? {}) as Record<string, unknown>;
          return { stt: Number(o.stt) || i + 1, doan: str(o.doan) };
        })
        .filter((p) => p.doan)
    : [];

  const ket = str(obj.ket);
  if (!ket || !theoViTri.length) return null;

  return { toanCanh: str(obj.toan_canh), theoViTri, ket };
}

/** Ghép lại thành văn xuôi liền, đúng thứ tự đọc, để lưu và để chia sẻ. */
export function flatten(parts: ReadingParts): string {
  return [parts.toanCanh, ...parts.theoViTri.map((p) => p.doan), parts.ket]
    .filter(Boolean)
    .join("\n\n");
}
