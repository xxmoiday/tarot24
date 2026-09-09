import rawCards from "../../data/cards.source.json" with { type: "json" };

/** Cụm bị cấm ở mục 1 của system prompt. */
const BANNED_PHRASES = [
  "năng lượng vũ trụ",
  "vũ trụ đang mời gọi",
  "hành trình tâm hồn",
  "mở lòng đón nhận",
  "tần số rung động",
  "chữa lành đứa trẻ bên trong",
  "thông điệp từ vũ trụ",
  "khai mở",
  "bản thể",
  "buông bỏ để đón nhận",
  "trân trọng khoảnh khắc hiện tại",
  "hãy cho phép bản thân",
  "đây là thời điểm để bạn",
  "bạn được mời gọi",
  "điều quan trọng là",
  "quý khách",
  "bạn thân mến",
  "các bạn",
];

/** Từ của luật đọc không được lộ ra bài. */
const LEAK_WORDS = [
  "lá trục",
  "lá then chốt",
  "đọc xuôi",
  "cùng chiều",
  "lăng kính",
  "trọng lượng",
  "vị trí số",
  "cot_loi",
  "canh_bao",
  "tu_khoa",
  "sac_thai",
  "KB",
];

/** Lời hứa chắc chắn bị cấm ở mục 5. */
const CERTAINTY = /\b(chắc chắn|nhất định)\b|(^|[\s,;:"'(])sẽ\s/iu;

const EN_NAMES = (rawCards as { cards: { ten_en: string }[] }).cards.map(
  (c) => c.ten_en,
);

export interface Violation {
  rule: string;
  detail: string;
}

const deaccent = (s: string) =>
  s
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .toLowerCase();

export function countWords(text: string) {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

/**
 * Bộ lọc đầu ra theo mục 9 của system prompt. Trả về danh sách vi phạm để
 * gọi lại một lần với lời nhắc sửa, chứ không tự sửa bài của mô hình.
 */
export function checkEssay(
  text: string,
  length: { min: number; max: number },
): Violation[] {
  const out: Violation[] = [];
  const flat = deaccent(text);

  for (const p of BANNED_PHRASES) {
    if (flat.includes(deaccent(p)))
      out.push({ rule: "mục 1", detail: `dùng cụm cấm "${p}"` });
  }
  for (const w of LEAK_WORDS) {
    if (flat.includes(deaccent(w)))
      out.push({ rule: "mục 1", detail: `lộ từ của luật đọc "${w}"` });
  }
  if (CERTAINTY.test(text))
    out.push({ rule: "mục 5", detail: 'hứa chắc chắn hoặc dùng chữ "sẽ"' });
  if (text.includes("!"))
    out.push({ rule: "mục 1", detail: "có dấu chấm than" });
  if (/^\s*(#{1,6}\s|[-*•]\s|\d+[.)]\s)/m.test(text)) {
    out.push({ rule: "mục 7", detail: "có tiêu đề hoặc gạch đầu dòng" });
  }
  if (/\*\*|__/.test(text))
    out.push({ rule: "mục 7", detail: "có chữ in đậm" });
  const label = text.match(/^[^\n:]{0,24}:\s/m);
  if (label) {
    out.push({
      rule: "mục 7",
      detail: `có nhãn hai chấm đầu đoạn "${label[0].trim()}"`,
    });
  }
  for (const en of EN_NAMES) {
    if (text.includes(en))
      out.push({ rule: "mục 1", detail: `gọi tên lá bằng tiếng Anh "${en}"` });
  }
  /* Mốc ngày cụ thể; khoảng thời gian như "vài tuần tới" thì được. */
  if (/\bngày\s+\d{1,2}\b|\b\d{1,2}\/\d{1,2}\b/.test(text)) {
    out.push({ rule: "mục 5", detail: "có mốc ngày cụ thể" });
  }

  const words = countWords(text);
  const slack = 0.15;
  if (words > length.max * (1 + slack)) {
    const target = Math.round((length.min + length.max) / 2);
    out.push({
      rule: "mục 6",
      detail: `bài đang ${words} tiếng, phải cắt xuống còn khoảng ${target} tiếng, tối đa ${length.max}`,
    });
  }
  if (words < length.min * (1 - slack)) {
    out.push({
      rule: "mục 6",
      detail: `ngắn ${words} tiếng, khung là ${length.min}–${length.max}`,
    });
  }
  return out;
}

/**
 * Vài nhãn hai chấm quen tay mà mô hình hay chèn dù đã dặn. Bỏ đúng những
 * nhãn nêu tên trong mục 1 thì không đụng tới nội dung, nên gỡ luôn thay vì
 * tốn thêm một lượt gọi.
 */
const STOCK_LABELS = [
  "Trả lời thẳng",
  "Trả lời",
  "Lời khuyên",
  "Toàn cảnh",
  "Tóm lại",
  "Kết luận",
  "Việc cần làm",
  "Việc cụ thể",
  "Tổng kết",
];

export function stripStockLabels(text: string) {
  let out = text;
  for (const l of STOCK_LABELS) {
    /* Gỡ nhãn rồi viết hoa lại chữ đầu để câu không cụt đầu dòng. */
    out = out.replace(
      new RegExp(`^${l}\\s*:\\s*(\\p{L})`, "gmiu"),
      (_m, first: string) => first.toUpperCase(),
    );
  }
  return out;
}

export function fixPrompt(violations: Violation[]) {
  const list = violations.map((v) => `- ${v.rule}: ${v.detail}`).join("\n");
  return `Bài vừa rồi vi phạm mấy chỗ sau:\n${list}\n\nViết lại toàn bài theo đúng mục 9, giữ nguyên cách đọc các lá, chỉ sửa những chỗ nêu trên. Chỉ trả về đúng một khối JSON theo khuôn đã dặn, không giải thích, không kèm chữ nào ngoài nó.`;
}
