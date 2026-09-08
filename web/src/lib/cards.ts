import rawCards from "../../data/cards.source.json" with { type: "json" };

export type AspectKey = "love" | "work" | "money" | "mind" | "study";
export type Suit = "coc" | "gay" | "kiem" | "tien";
export type Lean = "yes" | "no" | "mixed";
/** Trọng lượng lá, lấy nguyên năm mức của bộ dữ liệu gốc. */
export type Weight = "rất nhẹ" | "nhẹ" | "vừa" | "nặng" | "rất nặng";
/** Chiều của lá, rút gọn từ sac_thai để so hai nhánh trong trải chọn hướng. */
export type Motion = "tien" | "giu" | "lui";

/** Ba cách đọc riêng của 16 lá hoàng gia. */
export interface CourtReading {
  asPerson: string;
  asEnergy: string;
  asSituation: string;
}

export interface TarotCard {
  /** Mã trong bộ dữ liệu gốc, ví dụ cup_03 */
  id: string;
  /** Đường dẫn tiếng Việt, giữ cố định để không đổi URL */
  slug: string;
  vi: string;
  en: string;
  arcana: "major" | "minor";
  suit?: Suit;
  num: number;
  court: boolean;
  element: string;
  astro: string;
  astroHd?: string;
  core: string;
  upright: string[];
  reversed: string[];
  aspects: Record<AspectKey, string>;
  imagery: string[];
  sayings: string[];
  skewed: string;
  weight: Weight;
  /** Nguyên văn sac_thai.huong, ví dụ "khoanh tay ngó lơ" */
  heading: string;
  motion: Motion;
  lean: Lean;
  courtReading?: CourtReading;
}

interface RawCard {
  id: string;
  ten_vi: string;
  ten_en: string;
  arcana: "chinh" | "phu";
  so: number | null;
  chat: string;
  hoang_gia: boolean;
  bieu_tuong: string[];
  cot_loi: string;
  tu_khoa_xuoi: string[];
  tu_khoa_nguoc: string[];
  canh_bao: string;
  nguyen_to: string;
  chiem_tinh_gd: string | null;
  chiem_tinh_hd: string | null;
  sac_thai: { trong_luong: Weight; dong_tinh: string; huong: string };
  lang_kinh: Record<
    "tinh_cam" | "cong_viec" | "tien_bac" | "tam_ly" | "hoc_hanh",
    string
  >;
  cach_noi_viet: string[];
  ba_cach_doc?: {
    la_nguoi: string;
    la_nang_luong: string;
    la_tinh_huong: string;
  } | null;
}

export const ASPECT_LABEL: Record<AspectKey, string> = {
  love: "Tình cảm",
  work: "Công việc",
  money: "Tiền bạc",
  mind: "Tâm lý",
  study: "Học hành",
};

export const ASPECT_ORDER: AspectKey[] = [
  "love",
  "work",
  "money",
  "mind",
  "study",
];

export const SUIT_LABEL: Record<Suit, string> = {
  coc: "Bộ Cốc",
  gay: "Bộ Gậy",
  kiem: "Bộ Kiếm",
  tien: "Bộ Tiền",
};

export const SUIT_ELEMENT: Record<Suit, string> = {
  coc: "Thuỷ",
  gay: "Hoả",
  kiem: "Khí",
  tien: "Thổ",
};

const ELEMENT_LABEL: Record<string, string> = {
  thuy: "Thuỷ",
  hoa: "Hoả",
  khi: "Khí",
  tho: "Thổ",
};

const SUIT_OF_CHAT: Record<string, Suit> = {
  cup: "coc",
  gay: "gay",
  kiem: "kiem",
  tien: "tien",
};

const COURT_NUM: Record<string, number> = {
  page: 11,
  knight: 12,
  queen: 13,
  king: 14,
};

const RANK_VI = [
  "",
  "Át",
  "Hai",
  "Ba",
  "Bốn",
  "Năm",
  "Sáu",
  "Bảy",
  "Tám",
  "Chín",
  "Mười",
  "Tiểu Đồng",
  "Hiệp Sĩ",
  "Hoàng Hậu",
  "Vua",
];

export function rankName(num: number) {
  return RANK_VI[num] ?? String(num);
}

/**
 * Kết luận có hay không lấy thẳng từ trọng lượng: lá nhẹ nghiêng về có,
 * lá nặng nghiêng về không, lá vừa thì chưa ngã ngũ.
 */
const LEAN_OF_WEIGHT: Record<Weight, Lean> = {
  "rất nhẹ": "yes",
  nhẹ: "yes",
  vừa: "mixed",
  nặng: "no",
  "rất nặng": "no",
};

/**
 * Tài liệu xếp hướng thành hai phía: đi ra, tiến tới, đứng giữ thì hơn
 * ngồi yên, ngó lơ, rơi xuống. Vài hướng tuy có chuyển động vẫn thuộc phía
 * dưới, ví dụ rơi xuống, nên dò chữ trước rồi mới xét tới động hay tĩnh.
 */
const STALLED = [
  "ngó lơ",
  "nằm yên",
  "giậm chân",
  "chạm đáy",
  "rơi xuống",
  "ghì xuống",
  "lộn ngược",
  "xoáy trong đầu",
  "ngồi hưởng",
];

function motionOf(sac: RawCard["sac_thai"]): Motion {
  if (STALLED.some((w) => sac.huong.includes(w))) return "lui";
  return sac.dong_tinh === "tĩnh" ? "giu" : "tien";
}

export const MOTION_RANK: Record<Motion, number> = { tien: 2, giu: 1, lui: 0 };

export const MOTION_LABEL: Record<Motion, string> = {
  tien: "đi ra, tiến tới",
  giu: "đứng giữ",
  lui: "ngồi yên, ngó lơ hoặc rơi xuống",
};

/** Lá ngược làm đích đến dở dang, nên hạ chiều xuống một bậc. */
export function motionOfCard(card: TarotCard, reversed = false): Motion {
  if (!reversed) return card.motion;
  return card.motion === "tien" ? "giu" : "lui";
}

/** Nặng hay nhẹ, dùng khi hai nhánh cùng chiều thì mới xét tới trọng lượng. */
export const WEIGHT_RANK: Record<Weight, number> = {
  "rất nhẹ": 4,
  "nhẹ": 3,
  "vừa": 2,
  "nặng": 1,
  "rất nặng": 0,
};

/** Giữ nguyên đường dẫn tiếng Việt đã có, không đổi theo mã nguồn gốc. */
const ID_TO_SLUG: Record<string, string> = {
  major_00: "ke-kho",
  major_01: "phap-su",
  major_02: "nu-tu-te",
  major_03: "nu-hoang",
  major_04: "hoang-de",
  major_05: "giao-hoang",
  major_06: "tinh-nhan",
  major_07: "co-xe",
  major_08: "suc-manh",
  major_09: "an-si",
  major_10: "banh-xe-so-phan",
  major_11: "cong-ly",
  major_12: "nguoi-treo-nguoc",
  major_13: "than-chet",
  major_14: "tiet-che",
  major_15: "ac-quy",
  major_16: "toa-thap",
  major_17: "ngoi-sao",
  major_18: "mat-trang",
  major_19: "mat-troi",
  major_20: "phan-xet",
  major_21: "the-gioi",
  wand_01: "at-gay",
  wand_02: "hai-gay",
  wand_03: "ba-gay",
  wand_04: "bon-gay",
  wand_05: "nam-gay",
  wand_06: "sau-gay",
  wand_07: "bay-gay",
  wand_08: "tam-gay",
  wand_09: "chin-gay",
  wand_10: "muoi-gay",
  wand_page: "tieu-dong-gay",
  wand_knight: "hiep-si-gay",
  wand_queen: "hoang-hau-gay",
  wand_king: "vua-gay",
  cup_01: "at-coc",
  cup_02: "hai-coc",
  cup_03: "ba-coc",
  cup_04: "bon-coc",
  cup_05: "nam-coc",
  cup_06: "sau-coc",
  cup_07: "bay-coc",
  cup_08: "tam-coc",
  cup_09: "chin-coc",
  cup_10: "muoi-coc",
  cup_page: "tieu-dong-coc",
  cup_knight: "hiep-si-coc",
  cup_queen: "hoang-hau-coc",
  cup_king: "vua-coc",
  sword_01: "at-kiem",
  sword_02: "hai-kiem",
  sword_03: "ba-kiem",
  sword_04: "bon-kiem",
  sword_05: "nam-kiem",
  sword_06: "sau-kiem",
  sword_07: "bay-kiem",
  sword_08: "tam-kiem",
  sword_09: "chin-kiem",
  sword_10: "muoi-kiem",
  sword_page: "tieu-dong-kiem",
  sword_knight: "hiep-si-kiem",
  sword_queen: "hoang-hau-kiem",
  sword_king: "vua-kiem",
  coin_01: "at-tien",
  coin_02: "hai-tien",
  coin_03: "ba-tien",
  coin_04: "bon-tien",
  coin_05: "nam-tien",
  coin_06: "sau-tien",
  coin_07: "bay-tien",
  coin_08: "tam-tien",
  coin_09: "chin-tien",
  coin_10: "muoi-tien",
  coin_page: "tieu-dong-tien",
  coin_knight: "hiep-si-tien",
  coin_queen: "hoang-hau-tien",
  coin_king: "vua-tien",
};

function toCard(r: RawCard): TarotCard {
  const suit = SUIT_OF_CHAT[r.chat];
  const num = r.so ?? COURT_NUM[r.id.split("_")[1]] ?? 0;
  return {
    id: r.id,
    slug: ID_TO_SLUG[r.id],
    vi: r.ten_vi,
    en: r.ten_en,
    arcana: r.arcana === "chinh" ? "major" : "minor",
    suit,
    num,
    court: r.hoang_gia,
    element: ELEMENT_LABEL[r.nguyen_to] ?? r.nguyen_to,
    astro: r.chiem_tinh_gd ?? "",
    astroHd: r.chiem_tinh_hd ?? undefined,
    core: r.cot_loi,
    upright: r.tu_khoa_xuoi,
    reversed: r.tu_khoa_nguoc,
    aspects: {
      love: r.lang_kinh.tinh_cam,
      work: r.lang_kinh.cong_viec,
      money: r.lang_kinh.tien_bac,
      mind: r.lang_kinh.tam_ly,
      study: r.lang_kinh.hoc_hanh,
    },
    imagery: r.bieu_tuong,
    sayings: r.cach_noi_viet,
    skewed: r.canh_bao,
    weight: r.sac_thai.trong_luong,
    heading: r.sac_thai.huong,
    motion: motionOf(r.sac_thai),
    lean: LEAN_OF_WEIGHT[r.sac_thai.trong_luong],
    courtReading: r.ba_cach_doc
      ? {
          asPerson: r.ba_cach_doc.la_nguoi,
          asEnergy: r.ba_cach_doc.la_nang_luong,
          asSituation: r.ba_cach_doc.la_tinh_huong,
        }
      : undefined,
  };
}

/** Thứ tự duyệt thư viện: Ẩn Chính rồi Gậy, Cốc, Kiếm, Tiền. */
const SUIT_ORDER: Record<string, number> = {
  major: 0,
  wand: 1,
  cup: 2,
  sword: 3,
  coin: 4,
};

export const CARDS: TarotCard[] = (rawCards as { cards: RawCard[] }).cards
  .map(toCard)
  .sort((a, b) => {
    const ga = SUIT_ORDER[a.id.split("_")[0]] ?? 9;
    const gb = SUIT_ORDER[b.id.split("_")[0]] ?? 9;
    return ga === gb ? a.num - b.num : ga - gb;
  });

export const CARD_BY_SLUG = new Map(CARDS.map((c) => [c.slug, c]));
export const CARD_BY_ID = new Map(CARDS.map((c) => [c.id, c]));

export function getCard(slug: string) {
  return CARD_BY_SLUG.get(slug);
}

export function cardSubtitle(c: TarotCard) {
  if (c.arcana === "major") {
    return `${c.en} · Ẩn Chính · Số ${c.num} · Nguyên tố ${c.element}`;
  }
  const rank = c.court ? rankName(c.num) : `Số ${c.num}`;
  return `${c.en} · ${SUIT_LABEL[c.suit!]} · ${rank} · Nguyên tố ${c.element}`;
}

export function neighbours(slug: string) {
  const i = CARDS.findIndex((c) => c.slug === slug);
  if (i < 0) return { prev: undefined, next: undefined };
  return {
    prev: i > 0 ? CARDS[i - 1] : CARDS[CARDS.length - 1],
    next: i < CARDS.length - 1 ? CARDS[i + 1] : CARDS[0],
  };
}
