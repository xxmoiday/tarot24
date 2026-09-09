import rawCards from "../../data/cards.source.json" with { type: "json" };
import type { ReadingParts } from "./parse.js";

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

/*
  Mấy danh sách dưới đây soát trên chữ còn nguyên dấu, khác các danh sách ở
  trên. Bỏ dấu thì "lười" đụng "lưỡi", mà lưỡi kiếm nằm đầy trong KB, nên soát
  không dấu là tự bắt oan mình.
*/

/** Câu tự bào chữa về chính bài đọc, cấm ở luật 6 của mục 10. */
const META_PHRASES = [
  "không trả lời thẳng",
  "không trả lời được câu hỏi",
  "lá bài không cho biết",
  "lá không cho biết",
  "khó nói chắc",
  "không thể nói chắc",
  "chỉ có thể gợi ý",
  "bài này không đủ",
];

/** Chữ quy về phẩm chất người hỏi, cấm ở luật 5. */
const JUDGMENT_WORDS = [
  "lười",
  "xoàng",
  "qua loa",
  "hời hợt",
  "thiếu bản lĩnh",
  "làm dở",
  "không ai công nhận bạn",
];

/** Cụm ý mơ hồ; luật 2 cho nhiều nhất một vị trí được mang nó. */
const VAGUE = [
  "chưa rõ",
  "còn mờ",
  "lửng lơ",
  "lấp lửng",
  "mơ hồ",
  "chưa chọn được",
  "chưa quyết được",
];

/** Kết bỏ lửng, cấm ở luật 1 khi câu hỏi là câu hỏi đóng. */
const NON_ANSWERS = [
  "chưa nên quyết",
  "chưa nên vội",
  "chưa vội quyết",
  "chờ cho rõ",
  "tùy bạn",
  "tuỳ bạn",
  "cần thêm thời gian",
];

/**
 * Câu nghiêng về một phía mà luật 1 đòi. "ngã ngũ" nằm đây vì trải một lá có
 * hay không kết luận bằng ba mức của riêng nó, trong đó có "chưa ngã ngũ", và
 * `luat_doc` của kiểu trải thắng luật chung theo mục 4.
 */
const LEANING = ["nghiêng về", "thiên về", "ngả về", "ngã ngũ"];

/**
 * Câu hỏi đóng, tức câu đòi một quyết định có hay không. Dò trên chữ đã bỏ
 * dấu vì người rút gõ vội, nhiều người không bỏ dấu. Câu hỏi mở thì luật 1
 * không áp dụng, nên mấy mẫu này cố tình hẹp, thà sót còn hơn bắt oan.
 */
const CLOSED_QUESTION: RegExp[] = [
  /\bco nen\b/,
  /\bcon nen\b/,
  /\bco dang\b/,
  /\bnen\b[^?]{0,60}\bhay\b/,
  /\bhay (khong|thoi)\b/,
  /\bco\b[^.?!]{0,60}\bkhong\b\s*\??$/,
];

export function laCauHoiDong(question: string) {
  const q = deaccent(question.trim());
  return !!q && CLOSED_QUESTION.some((re) => re.test(q));
}

export interface EssayContext {
  /** Câu hỏi của người rút; không có thì bỏ qua luật 1. */
  question?: string;
  /** Bài đã tách theo vị trí; không có thì đếm theo đoạn của văn xuôi. */
  parts?: ReadingParts | null;
  /** Câu chạm chủ đề cấm: ở đó mục 5 thắng, không đòi bài phải nghiêng về đâu. */
  guard?: boolean;
}

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
  ctx: EssayContext = {},
): Violation[] {
  const out: Violation[] = [];
  const flat = deaccent(text);
  const thuong = text.toLowerCase();

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

  for (const w of JUDGMENT_WORDS) {
    if (thuong.includes(w))
      out.push({ rule: "luật 5", detail: `phán về phẩm chất người hỏi "${w}"` });
  }
  /* Câu chạm chủ đề cấm buộc phải nói rõ bài không đọc chuyện đó, mục 5 cho
     phép; chỗ khác mới là tự bào chữa. */
  if (!ctx.guard) {
    for (const m of META_PHRASES) {
      if (thuong.includes(m))
        out.push({ rule: "luật 6", detail: `bình luận về chính bài đọc "${m}"` });
    }
  }

  const doan = ctx.parts
    ? ctx.parts.theoViTri.map((p) => p.doan)
    : text.split(/\n{2,}/);
  const moHo = doan.filter((d) => {
    const s = d.toLowerCase();
    return VAGUE.some((v) => s.includes(v));
  });
  if (moHo.length > 1) {
    out.push({
      rule: "luật 2",
      detail: `${moHo.length} chỗ cùng nói một ý chưa rõ, còn mờ, lửng lơ; cả bài chỉ được một chỗ, các chỗ kia phải đổi góc`,
    });
  }

  /* Luật 1 chỉ bật với câu hỏi đóng, và tắt khi câu hỏi chạm chủ đề cấm vì ở
     đó mục 5 cấm kết luận có hay không. Khuôn hỏng thì soát trên cả bài, chứ
     bỏ qua là bài né câu hỏi lọt luôn. */
  if (!ctx.guard && ctx.question && laCauHoiDong(ctx.question)) {
    /* Trải một hai lá đặt kết luận ngay câu đầu theo luat_doc của nó, và ngắn
       tới mức nhét thêm một mệnh đề điều kiện là hỏng bài; ở đó chỉ soát xem
       bài có nghiêng về đâu không và có kết bỏ lửng không. */
    const nhieuViTri = (ctx.parts?.theoViTri.length ?? 3) >= 3;
    const ket = (ctx.parts?.ket || text).toLowerCase();
    const vungNghieng = nhieuViTri ? ket : text.toLowerCase();

    if (!LEANING.some((l) => vungNghieng.includes(l))) {
      out.push({
        rule: "luật 1",
        detail: nhieuViTri
          ? 'câu hỏi đóng mà đoạn kết không nghiêng rõ về phía nào, thiếu câu dạng "nghiêng về", "thiên về", "ngả về"'
          : 'câu hỏi đóng mà cả bài không nghiêng rõ về phía nào, thiếu câu dạng "nghiêng về", "thiên về", "ngả về"',
      });
    }
    if (nhieuViTri && !/\bnếu\b/u.test(ket)) {
      out.push({
        rule: "luật 1",
        detail: 'đoạn kết thiếu điều kiện "nếu... thì" để lật lại lựa chọn vừa nghiêng về',
      });
    }
    for (const n of NON_ANSWERS) {
      if (ket.includes(n))
        out.push({ rule: "luật 1", detail: `kết bằng câu bỏ lửng "${n}"` });
    }
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
  return `Bài vừa rồi vi phạm mấy chỗ sau:\n${list}\n\nViết lại toàn bài theo đúng mục 9 và mục 10, giữ nguyên cách đọc các lá, chỉ sửa những chỗ nêu trên. Chỉ trả về đúng một khối JSON theo khuôn đã dặn, không giải thích, không kèm chữ nào ngoài nó.`;
}
