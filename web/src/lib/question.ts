import { SPREADS, getSpread, type Spread, type TopicKey } from "./spreads";
import { deaccent, tokens } from "./text";

/* ------------------------------------------------------------------ *
 * Câu hỏi mơ hồ
 * ------------------------------------------------------------------ */

export type VagueKind = "ngan" | "chung-chung";

export interface Vague {
  kind: VagueKind;
  /** Nhãn ngắn cho ô nhắc */
  label: string;
  /** Câu nhắc, nói rõ thiếu cái gì chứ không chỉ chê câu hỏi */
  hint: string;
}

const VAGUE: Record<VagueKind, Omit<Vague, "kind">> = {
  ngan: {
    label: "Câu hỏi hơi ngắn",
    hint: "Thêm một câu bối cảnh: chuyện gì, với ai, bạn đang vướng ở chỗ nào. Bài đọc bám sát câu hỏi, câu càng cụ thể thì bài càng trúng.",
  },
  "chung-chung": {
    label: "Câu hỏi còn chung chung",
    hint: "Hỏi kiểu “tương lai em thế nào” thì bài cũng chỉ trả lời chung chung được. Chọn đúng một chuyện đang thật sự vướng rồi hỏi thẳng vào nó.",
  },
};

/** Hỏi kiểu này thì dài mấy vẫn là hỏi chung, không có chuyện nào để bám. */
const LUON_MO_HO = [
  /\b(van menh|so phan|so menh|duong doi|cuoc doi|van han|hau van|tien do cuoc doi)\b/,
  /^(xem|coi|boi|luan|doc)\s+(giup|ho|cho|dum)\b/,
  /^(xem|coi|boi)\s+(bai|tarot|la)\b/,
];

/** Hỏi kiểu này chỉ mơ hồ khi câu trống trơn, không kèm bối cảnh nào. */
const MO_HO_NEU_TRONG = [
  /\b(tuong lai|cuoc song|moi thu|moi chuyen|tat ca|dao nay|thoi gian toi)\b/,
  /\b(the nao|ra sao|nhu the nao|di ve dau|co gi moi)\b/,
];

/** Dưới ngần này từ có nghĩa thì coi như chưa có bối cảnh. */
const DU_BOI_CANH = 4;

/**
 * Dò xem câu hỏi có mơ hồ tới mức bài đọc chỉ trả lời chung chung được không.
 * Đây là lời nhắc chứ không phải cửa chặn: người hỏi vẫn rút được như cũ.
 * Câu rỗng không tính là mơ hồ, chỗ gọi xử lý riêng.
 */
export function detectVague(question: string): Vague | null {
  const raw = question.trim();
  if (!raw) return null;

  const q = deaccent(raw);
  const words = raw.split(/\s+/).length;
  const content = tokens(q).size;

  if (LUON_MO_HO.some((re) => re.test(q))) {
    return { kind: "chung-chung", ...VAGUE["chung-chung"] };
  }
  if (MO_HO_NEU_TRONG.some((re) => re.test(q)) && content < DU_BOI_CANH) {
    return { kind: "chung-chung", ...VAGUE["chung-chung"] };
  }
  if (words < 4 || content < 2) {
    return { kind: "ngan", ...VAGUE.ngan };
  }
  return null;
}

/* ------------------------------------------------------------------ *
 * Gợi ý kiểu trải
 * ------------------------------------------------------------------ */

/**
 * Một tín hiệu đọc được từ câu hỏi. Mỗi tín hiệu tự nói được lý do bằng tiếng
 * người, vì lý do đó hiện thẳng dưới thẻ gợi ý chứ không giấu trong điểm số.
 */
interface Signal {
  test: RegExp[];
  /** Kiểu trải hợp tín hiệu này, kèm điểm cộng */
  weight: Record<string, number>;
  /**
   * Tín hiệu nói về khung câu hỏi — cỡ, thời gian, có mấy bên, có/không —
   * tức là thứ ngoài đời người đọc dựa vào để chọn trải. Tín hiệu lĩnh vực
   * (tình cảm, công việc, tiền bạc) thì không: mọi kiểu trải đều đọc được
   * cho mọi lĩnh vực, đó là việc của ô "lĩnh vực" chứ không phải lý do đổi
   * trải. Chỉ tín hiệu khung mới được phép cắt ngang mời người ta đổi.
   */
  khung: boolean;
  reason: string;
}

const SIGNALS: Signal[] = [
  {
    /* Cân giữa hai hướng phải đứng trước dạng có/không, vì "nhận hay ở lại"
       thường viết kèm chữ "không" ở cuối và sẽ bị dạng kia nhận nhầm. */
    test: [
      /\bhay la\b/,
      /\b(nen|chon|di|nhan|o lai|theo)\b[^?]{0,40}\bhay\b/,
      /\bgiua hai\b/,
      /\b(hai lua chon|hai huong|hai ben|hai duong|ngã ba)\b/,
    ],
    weight: { "nam-la-chon-huong": 5, "ba-la-tinh-huong": 1 },
    khung: true,
    reason: "Câu hỏi đang cân giữa hai hướng, nên xem cả hai nhánh rồi so.",
  },
  {
    test: [/\bco nen\b/, /\bnen\b[^?]{0,30}\bkhong\b/, /\blieu\b[^?]{0,40}\bkhong\b/],
    weight: { "co-hay-khong": 4, "ba-la-tinh-huong": 1 },
    khung: true,
    reason: "Câu hỏi dạng có hoặc không, một lá trả lời là đủ.",
  },
  {
    test: [
      /\b(anh ay|co ay|nguoi do|nguoi kia|nguoi ta|em ay|ban ay|crush|nguoi yeu|ban trai|ban gai|chong|vo)\b/,
    ],
    weight: { "ba-la-giua-hai-nguoi": 4, "nam-la-tinh-cam": 3 },
    khung: true,
    reason: "Có một người cụ thể trong câu hỏi, nên đọc cả phía bên kia.",
  },
  {
    test: [
      /\b(tinh cam|yeu|quay lai|chia tay|tan vo|hen ho|cuoi|ket hon|thich|tinh yeu|moi quan he)\b/,
    ],
    weight: { "nam-la-tinh-cam": 3, "ba-la-giua-hai-nguoi": 2 },
    khung: false,
    reason: "Chuyện tình cảm, cần nhìn cả hai phía và chỗ hai bên gặp nhau.",
  },
  {
    test: [
      /\b(cong viec|cong ty|sep|di lam|nghi viec|nhay viec|offer|du an|thang chuc|dong nghiep|phong van|nghe nghiep|deal|khoi nghiep)\b/,
    ],
    weight: { "nam-la-cong-viec": 4, "ba-la-tinh-huong": 1 },
    khung: false,
    reason: "Chuyện công việc, xem chỗ đứng và đường đi cùng lúc.",
  },
  {
    test: [
      /\b(tien|luong|thu nhap|chi tieu|tiet kiem|tai chinh|no nan|mon no|tra no|tien nong)\b/,
    ],
    weight: { "bon-la-tien-bac": 4 },
    khung: false,
    reason: "Chuyện tiền bạc, xem dòng vào dòng ra.",
  },
  {
    test: [
      /\b(ket|be tac|vuong|mac ket|tro ngai|kho khan|lam sao|phai lam gi|nen lam gi|xu ly|go ra|roi ren)\b/,
    ],
    weight: { "ba-la-tinh-huong": 4 },
    khung: true,
    reason: "Đang vướng, cần biết trở ngại nằm ở đâu và gỡ từ đâu.",
  },
  {
    test: [
      /\b(sap toi|toi day|tuong lai gan|dien bien|di toi dau|ket qua ra sao|truoc mat|thoi gian toi)\b/,
    ],
    weight: { "ba-la-thoi-gian": 4 },
    khung: true,
    reason: "Muốn nhìn một mạch từ trước tới sau.",
  },
  {
    test: [/\b(hom nay|bua nay|ngay hom nay)\b/],
    weight: { "mot-la-hom-nay": 5 },
    khung: true,
    reason: "Chuyện gói gọn trong hôm nay.",
  },
  {
    test: [/\b(tuan nay|tuan toi|tuan sau|bay ngay)\b/],
    weight: { "bay-la-tuan-nay": 5 },
    khung: true,
    reason: "Câu hỏi trải theo từng ngày trong tuần.",
  },
  {
    test: [/\b(thang nay|thang toi|thang sau|thang truoc mat)\b/],
    weight: { "nam-la-thang-toi": 5 },
    khung: true,
    reason: "Câu hỏi nhìn trọn một tháng.",
  },
  {
    test: [/\b(nam nay|nam toi|sang nam|nam sau|ca nam|muoi hai thang|12 thang)\b/],
    weight: { "muoi-hai-la-nam-toi": 5 },
    khung: true,
    reason: "Câu hỏi nhìn trọn một năm, đi theo từng tháng.",
  },
  {
    test: [
      /\b(ban than|nhin lai minh|con nguoi minh|minh la ai|gia tri cua minh|tu tin|minh muon gi|hieu minh)\b/,
    ],
    weight: { "ba-la-nhin-lai-minh": 4 },
    khung: true,
    reason: "Câu hỏi hướng vào chính bạn chứ không vào ai khác.",
  },
  {
    test: [/\b(toan bo|tong the|ca chuyen|moi mat|goc re|sau xa|day du|can ke)\b/],
    weight: { "thap-tu-celtic": 4, "bay-la-mong-ngua": 3 },
    khung: true,
    reason: "Chuyện lớn, cần nhìn nhiều tầng cùng lúc.",
  },
];

/** Từ khoá lĩnh vực, chỉ để cộng thêm cho trải chuyên đề đúng mảng. */
const TOPIC_HINTS: Record<Exclude<TopicKey, "general">, RegExp> = {
  love: /\b(tinh cam|yeu|nguoi yeu|crush|hen ho|cuoi|chia tay|vo|chong|ban trai|ban gai)\b/,
  work: /\b(cong viec|cong ty|sep|di lam|nghi viec|du an|dong nghiep|nghe nghiep|offer)\b/,
  money: /\b(tien|luong|thu nhap|chi tieu|tiet kiem|tai chinh|no nan)\b/,
  mind: /\b(lo lang|met moi|buon|stress|ap luc|hoang mang|tam trang|mat phuong huong)\b/,
  study: /\b(hoc|thi|truong|luan van|du hoc|chuyen nganh|tot nghiep|bai vo)\b/,
};

function detectTopic(q: string): TopicKey {
  for (const [key, re] of Object.entries(TOPIC_HINTS)) {
    if (re.test(q)) return key as TopicKey;
  }
  return "general";
}

/**
 * Câu mẫu của từng kiểu trải, tách sẵn thành từ. `fits` kéo điểm lên, `notFor`
 * kéo xuống — và vì câu "không hợp" của trải này thường đúng là câu "hợp" của
 * trải khác, hai vế tự đẩy câu hỏi về đúng chỗ.
 */
const LEXICON = new Map(
  SPREADS.map((s) => [
    s.slug,
    {
      fits: tokens(deaccent(s.fits.join(" "))),
      notFor: tokens(deaccent(s.notFor.join(" "))),
    },
  ]),
);

/** Mỗi từ trùng đáng bấy nhiêu điểm, và nhiều nhất chỉ tính ba từ. */
const LEX_EACH = 0.6;
const LEX_CAP = 3;

/** Dài cỡ này thì câu hỏi đang mang nhiều tầng, hợp trải rộng. */
const CAU_DAI = 14;

function overlap(a: Set<string>, b: Set<string>) {
  let n = 0;
  for (const w of a) if (b.has(w)) n++;
  return Math.min(n, LEX_CAP);
}

interface Score {
  score: number;
  reason: string;
  /** Điểm của tín hiệu nặng cân nhất đã đóng góp, dùng để chọn lý do hiện ra */
  top: number;
}

const REASON_CHUNG = "Hợp với cỡ câu hỏi bạn vừa gõ.";

/**
 * Chấm điểm cả mười lăm kiểu trải cho một câu hỏi.
 * `khungOnly` bỏ hết tín hiệu lĩnh vực, chữ trùng và điểm cộng theo lĩnh vực,
 * chỉ còn khung câu hỏi — dùng khi đang cân nhắc có nên mời đổi trải không.
 */
function scoreAll(question: string, khungOnly = false): Map<string, Score> {
  const q = deaccent(question.trim());
  const qt = tokens(q);
  const topic = detectTopic(q);
  const words = question.trim().split(/\s+/).filter(Boolean).length;

  const out = new Map<string, Score>();
  const bump = (slug: string, points: number, reason?: string) => {
    const cur = out.get(slug) ?? { score: 0, reason: REASON_CHUNG, top: 0 };
    /* Lý do hiện ra là lý do của tín hiệu nặng cân nhất. Tín hiệu phụ, kiểu
       trải này chỉ được cộng một hai điểm, thì không được nói thay — nói thay
       là ra câu lý do chẳng ăn nhập với kiểu trải đang đứng cạnh nó. */
    const take = !!reason && points >= 3 && points > cur.top;
    out.set(slug, {
      score: cur.score + points,
      reason: take ? reason! : cur.reason,
      top: take ? points : cur.top,
    });
  };

  for (const sig of SIGNALS) {
    if (khungOnly && !sig.khung) continue;
    if (!sig.test.some((re) => re.test(q))) continue;
    for (const [slug, w] of Object.entries(sig.weight)) bump(slug, w, sig.reason);
  }

  for (const s of SPREADS) {
    if (!khungOnly) {
      const lex = LEXICON.get(s.slug)!;
      const plus = overlap(qt, lex.fits) * LEX_EACH;
      const minus = overlap(qt, lex.notFor) * LEX_EACH;
      if (plus) bump(s.slug, plus);
      if (minus) bump(s.slug, -minus);
      if (topic !== "general" && s.defaultTopic === topic) bump(s.slug, 1.5);
    }
    /* Cỡ câu hỏi cũng là khung: câu cụt thì đừng đẩy sang trải bảy mười lá. */
    if (words >= CAU_DAI && s.count >= 7) bump(s.slug, 1);
    if (words < 6 && s.count >= 7) bump(s.slug, -1);
  }

  return out;
}

export interface Suggestion {
  spread: Spread;
  score: number;
  /** Vì sao gợi ý trải này, một câu hiện ngay dưới tên trải */
  reason: string;
}

/** Không đọc được tín hiệu nào thì đưa ba trải nhỏ, đúng như ngoài đời. */
const MAC_DINH: { slug: string; reason: string }[] = [
  {
    slug: "ba-la-tinh-huong",
    reason: "Ba lá gọn: chuyện đang ra sao, vướng ở đâu, nên làm gì.",
  },
  {
    slug: "ba-la-thoi-gian",
    reason: "Ba lá nhìn một mạch từ trước tới sau.",
  },
  {
    slug: "mot-la-hom-nay",
    reason: "Một lá, nhanh, đủ để biết mình đang đứng ở đâu.",
  },
];

/** Điểm tối thiểu để coi là thật sự đọc ra tín hiệu chứ không phải trùng chữ. */
const NGUONG = 2;

/**
 * Gợi ý kiểu trải cho một câu hỏi, xếp theo độ hợp.
 * Câu rỗng hoặc không đọc ra gì thì trả về ba trải nhỏ mặc định.
 */
export function suggestSpreads(question: string, limit = 3): Suggestion[] {
  const fallback = () =>
    MAC_DINH.map(({ slug, reason }) => ({
      spread: getSpread(slug)!,
      score: 0,
      reason,
    })).slice(0, limit);

  if (!question.trim()) return fallback();

  const ranked = [...scoreAll(question)]
    .filter(([, v]) => v.score >= NGUONG)
    .sort((a, b) => b[1].score - a[1].score)
    .slice(0, limit);

  if (!ranked.length) return fallback();

  return ranked.map(([slug, v]) => ({
    spread: getSpread(slug)!,
    score: v.score,
    reason: v.reason,
  }));
}

/** Hơn trải đang mở ngần này điểm mới đáng cắt ngang để nhắc đổi. */
const CACH_BIET = 2.5;


/**
 * Câu hỏi đang gõ có hợp một kiểu trải khác hơn hẳn kiểu đang mở không.
 * Trả về null khi trải đang mở đã là hợp nhất, hoặc khi cách biệt chưa đủ xa —
 * nhắc sai chỗ còn phiền hơn không nhắc.
 */
export function betterSpread(question: string, current: Spread): Suggestion | null {
  if (question.trim().split(/\s+/).length < 3) return null;

  /* Hỏi trúng ngay câu mà chính kiểu trải này lấy làm ví dụ thì im lặng. Người
     ta đang dùng đúng thứ mình vừa mời họ dùng, cắt ngang lúc đó là vô duyên —
     và trải nào cũng có vài câu hợp cả hai bên, thà bỏ sót còn hơn nhắc bừa. */
  const qt = tokens(deaccent(question));
  if (overlap(qt, LEXICON.get(current.slug)!.fits) >= 2) return null;

  const all = scoreAll(question, true);
  const mine = all.get(current.slug)?.score ?? 0;

  let best: { slug: string; v: Score } | null = null;
  for (const [slug, v] of all) {
    if (slug === current.slug) continue;
    if (!best || v.score > best.v.score) best = { slug, v };
  }

  if (!best || best.v.score < NGUONG || best.v.score - mine < CACH_BIET) return null;

  return { spread: getSpread(best.slug)!, score: best.v.score, reason: best.v.reason };
}
