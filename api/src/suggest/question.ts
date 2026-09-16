/*
 * Gợi ý kiểu trải từ câu hỏi — chuyển từ web/src/lib/question.ts.
 *
 * Trước đây logic này chỉ chạy trong trình duyệt của web, nên ứng dụng ngoài
 * muốn có màn "gõ câu hỏi, máy đề xuất trải" thì phải tự viết lại rồi tự giữ
 * cho khỏi lệch. Chuyển sang đây để hai bên dùng chung một bộ luật.
 *
 * Mọi mẫu regex, trọng số và ngưỡng giữ nguyên từng ký tự so với bản web. Khác
 * một chỗ duy nhất: dữ liệu kiểu trải đọc từ KB chứ không từ mảng viết tay, nên
 * `fits`/`notFor`/`count` ở đây là `hop_voi`/`khong_hop_voi`/`so_la`.
 */
import { Injectable } from "@nestjs/common";
import { KbService } from "../kb/kb.service.js";
import { deaccent, tokens } from "./text.js";

export type TopicKey = "love" | "work" | "money" | "mind" | "study" | "general";

/**
 * Lĩnh vực mặc định của từng kiểu trải. Chỗ duy nhất phải chép tay: KB không
 * có trường này, nó chỉ sống trong bảng kiểu trải viết tay bên web.
 */
const DEFAULT_TOPIC: Record<string, TopicKey> = {
  "mot-la-hom-nay": "general",
  "co-hay-khong": "general",
  "ba-la-thoi-gian": "general",
  "ba-la-tinh-huong": "general",
  "nam-la-tinh-cam": "love",
  "bay-la-mong-ngua": "general",
  "thap-tu-celtic": "general",
  "nam-la-cong-viec": "work",
  "bon-la-tien-bac": "money",
  "ba-la-giua-hai-nguoi": "love",
  "nam-la-chon-huong": "general",
  "ba-la-nhin-lai-minh": "mind",
  "bay-la-tuan-nay": "general",
  "nam-la-thang-toi": "general",
  "muoi-hai-la-nam-toi": "general",
};

/** Một kiểu trải rút gọn còn đúng những gì việc chấm điểm cần. */
interface SpreadMeta {
  slug: string;
  ten_vi: string;
  count: number;
  defaultTopic: TopicKey;
  fits: Set<string>;
  notFor: Set<string>;
}

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
 * Dò từ khoá: có dấu trước, bỏ dấu chỉ là đường lui
 * ------------------------------------------------------------------ */

/**
 * Một mẫu dò, giữ sẵn hai bản: bản có dấu và bản đã bỏ dấu.
 *
 * Trước đây mọi thứ chỉ dò trên bản bỏ dấu, nên "yếu" đọc thành "yêu", "cuối"
 * thành "cưới", "vô" thành "vợ", "thì" thành "thi". Câu hỏi sức khoẻ hay dự án
 * bị đẩy sang tình cảm, rồi kiểu trải chuyên đề mất luôn điểm cộng lĩnh vực.
 *
 * Giữ cả hai bản để câu nào có dấu thì dò theo dấu — người gõ đủ dấu tức là đã
 * nói rõ họ định nói từ nào. Chỉ câu gõ trần không dấu nào mới lui về bản bỏ
 * dấu, và lúc ấy nhập nhằng là không tránh được.
 */
interface Mau {
  coDau: RegExp;
  khongDau: RegExp;
}

/**
 * `\b` của JS chỉ biết `[A-Za-z0-9_]`, nên `\bvợ\b` **không** khớp "vợ tôi":
 * `ợ` không phải chữ theo cách nó hiểu, sau `ợ` gặp dấu cách là hết biên. Ai vá
 * lỗi này bằng cách thêm dấu vào mẫu cũ sẽ làm mấy từ tận cùng bằng nguyên âm
 * có dấu chết lặng. Phải tự khoanh biên bằng `\p{L}`.
 */
function khoanhBien(than: string) {
  return new RegExp(`(?<!\\p{L})(?:${than})(?!\\p{L})`, "u");
}

function thoat(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/** Mẫu từ một danh sách cụm từ viết đủ dấu. */
function cum(...ds: string[]): Mau {
  const than = ds.map(thoat).join("|");
  return { coDau: khoanhBien(than), khongDau: khoanhBien(deaccent(than)) };
}

/**
 * Mẫu dạng "A rồi trong vòng n ký tự có B", cho những câu như "nên nhận hay ở
 * lại" — hai vế cách nhau nhưng vẫn thuộc một ý.
 */
function keo(dau: string[], n: number, sau: string[]): Mau {
  const dung = (a: string[], b: string[]) =>
    `(?<!\\p{L})(?:${a.map(thoat).join("|")})(?!\\p{L})[^?]{0,${n}}(?<!\\p{L})(?:${b.map(thoat).join("|")})(?!\\p{L})`;
  return {
    coDau: new RegExp(dung(dau, sau), "u"),
    khongDau: new RegExp(dung(dau.map(deaccent), sau.map(deaccent)), "u"),
  };
}

/** Câu có mang dấu tiếng Việt nào không. */
function coDauTiengViet(q: string) {
  return deaccent(q) !== q.toLowerCase();
}

/** Dò một mẫu: câu có dấu thì dò bản có dấu, câu gõ trần mới lui về bản kia. */
function khop(m: Mau, q: string) {
  return coDauTiengViet(q)
    ? m.coDau.test(q.toLowerCase())
    : m.khongDau.test(deaccent(q));
}

/**
 * "chồng" người và "chồng" chồng chất viết y hệt nhau kể cả đủ dấu, "vợ" cũng
 * đứng cạnh "vợ chồng" trong đủ thứ câu. Bỏ dấu hay không đều không cứu được —
 * đây là chuyện nghĩa, nên hai từ này chỉ tính khi có người đứng cạnh.
 */
const VO_CHONG = cum(
  "chồng tôi",
  "chồng em",
  "chồng mình",
  "chồng cũ",
  "chồng cô",
  "ông chồng",
  "lấy chồng",
  "có chồng",
  "chồng con",
  "vợ tôi",
  "vợ em",
  "vợ mình",
  "vợ cũ",
  "ông xã",
  "bà xã",
  "lấy vợ",
  "có vợ",
  "vợ chồng",
);

/**
 * "yêu" đủ dấu vẫn còn một chỗ hụt: "yêu cầu" chẳng liên quan gì tình cảm, mà
 * câu hỏi công việc thì đầy chữ đó. Cắt riêng trường hợp ấy ra.
 */
const YEU: Mau = {
  coDau: new RegExp("(?<!\\p{L})yêu(?! cầu)(?!\\p{L})", "u"),
  khongDau: new RegExp("(?<!\\p{L})yeu(?! cau)(?!\\p{L})", "u"),
};

/**
 * Một tín hiệu đọc được từ câu hỏi. Mỗi tín hiệu tự nói được lý do bằng tiếng
 * người, vì lý do đó hiện thẳng dưới thẻ gợi ý chứ không giấu trong điểm số.
 */
interface Signal {
  test: Mau[];
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
      cum("hay là"),
      keo(["nên", "chọn", "đi", "nhận", "ở lại", "theo"], 40, ["hay"]),
      cum("giữa hai"),
      cum("hai lựa chọn", "hai hướng", "hai bên", "hai đường", "ngã ba"),
    ],
    weight: { "nam-la-chon-huong": 5, "ba-la-tinh-huong": 1 },
    khung: true,
    reason: "Câu hỏi đang cân giữa hai hướng, nên xem cả hai nhánh rồi so.",
  },
  {
    test: [
      cum("có nên"),
      keo(["nên"], 30, ["không"]),
      keo(["liệu"], 40, ["không"]),
    ],
    weight: { "co-hay-khong": 4, "ba-la-tinh-huong": 1 },
    khung: true,
    reason: "Câu hỏi dạng có hoặc không, một lá trả lời là đủ.",
  },
  {
    test: [
      cum(
        "anh ấy",
        "cô ấy",
        "người đó",
        "người kia",
        "người ta",
        "em ấy",
        "bạn ấy",
        "crush",
        "người yêu",
        "bạn trai",
        "bạn gái",
      ),
      VO_CHONG,
    ],
    weight: { "ba-la-giua-hai-nguoi": 4, "nam-la-tinh-cam": 3 },
    khung: true,
    reason: "Có một người cụ thể trong câu hỏi, nên đọc cả phía bên kia.",
  },
  {
    test: [
      cum(
        "tình cảm",
        "quay lại",
        "chia tay",
        "tan vỡ",
        "hẹn hò",
        "cưới",
        "kết hôn",
        "thích",
        "tình yêu",
        "mối quan hệ",
      ),
      YEU,
      VO_CHONG,
    ],
    weight: { "nam-la-tinh-cam": 3, "ba-la-giua-hai-nguoi": 2 },
    khung: false,
    reason: "Chuyện tình cảm, cần nhìn cả hai phía và chỗ hai bên gặp nhau.",
  },
  {
    test: [
      cum(
        "công việc",
        "công ty",
        "sếp",
        "đi làm",
        "nghỉ việc",
        "nhảy việc",
        "offer",
        "dự án",
        "thăng chức",
        "đồng nghiệp",
        "phỏng vấn",
        "nghề nghiệp",
        "deal",
        "khởi nghiệp",
      ),
    ],
    weight: { "nam-la-cong-viec": 4, "ba-la-tinh-huong": 1 },
    khung: false,
    reason: "Chuyện công việc, xem chỗ đứng và đường đi cùng lúc.",
  },
  {
    test: [
      cum(
        "tiền",
        "lương",
        "thu nhập",
        "chi tiêu",
        "tiết kiệm",
        "tài chính",
        "nợ nần",
        "món nợ",
        "trả nợ",
        "tiền nong",
      ),
    ],
    weight: { "bon-la-tien-bac": 4 },
    khung: false,
    reason: "Chuyện tiền bạc, xem dòng vào dòng ra.",
  },
  {
    test: [
      cum(
        "kẹt",
        "bế tắc",
        "vướng",
        "mắc kẹt",
        "trở ngại",
        "khó khăn",
        "làm sao",
        "phải làm gì",
        "nên làm gì",
        "xử lý",
        "gỡ ra",
        "rối ren",
      ),
    ],
    weight: { "ba-la-tinh-huong": 4 },
    khung: true,
    reason: "Đang vướng, cần biết trở ngại nằm ở đâu và gỡ từ đâu.",
  },
  {
    test: [
      cum(
        "sắp tới",
        "tới đây",
        "tương lai gần",
        "diễn biến",
        "đi tới đâu",
        "kết quả ra sao",
        "trước mắt",
        "thời gian tới",
      ),
    ],
    weight: { "ba-la-thoi-gian": 4 },
    khung: true,
    reason: "Muốn nhìn một mạch từ trước tới sau.",
  },
  {
    test: [cum("hôm nay", "bữa nay", "ngày hôm nay")],
    weight: { "mot-la-hom-nay": 5 },
    khung: true,
    reason: "Chuyện gói gọn trong hôm nay.",
  },
  {
    test: [cum("tuần này", "tuần tới", "tuần sau", "bảy ngày")],
    weight: { "bay-la-tuan-nay": 5 },
    khung: true,
    reason: "Câu hỏi trải theo từng ngày trong tuần.",
  },
  {
    test: [cum("tháng này", "tháng tới", "tháng sau", "tháng trước mắt")],
    weight: { "nam-la-thang-toi": 5 },
    khung: true,
    reason: "Câu hỏi nhìn trọn một tháng.",
  },
  {
    test: [
      cum(
        "năm nay",
        "năm tới",
        "sang năm",
        "năm sau",
        "cả năm",
        "mười hai tháng",
        "12 tháng",
      ),
    ],
    weight: { "muoi-hai-la-nam-toi": 5 },
    khung: true,
    reason: "Câu hỏi nhìn trọn một năm, đi theo từng tháng.",
  },
  {
    test: [
      cum(
        "bản thân",
        "nhìn lại mình",
        "con người mình",
        "mình là ai",
        "giá trị của mình",
        "tự tin",
        "mình muốn gì",
        "hiểu mình",
      ),
    ],
    weight: { "ba-la-nhin-lai-minh": 4 },
    khung: true,
    reason: "Câu hỏi hướng vào chính bạn chứ không vào ai khác.",
  },
  {
    test: [
      cum(
        "toàn bộ",
        "tổng thể",
        "cả chuyện",
        "mọi mặt",
        "gốc rễ",
        "sâu xa",
        "đầy đủ",
        "cặn kẽ",
      ),
    ],
    weight: { "thap-tu-celtic": 4, "bay-la-mong-ngua": 3 },
    khung: true,
    reason: "Chuyện lớn, cần nhìn nhiều tầng cùng lúc.",
  },
];

/** Từ khoá lĩnh vực, chỉ để cộng thêm cho trải chuyên đề đúng mảng. */
const TOPIC_HINTS: Record<Exclude<TopicKey, "general">, Mau[]> = {
  love: [
    cum(
      "tình cảm",
      "người yêu",
      "crush",
      "hẹn hò",
      "cưới",
      "chia tay",
      "bạn trai",
      "bạn gái",
    ),
    YEU,
    VO_CHONG,
  ],
  work: [
    cum(
      "công việc",
      "công ty",
      "sếp",
      "đi làm",
      "nghỉ việc",
      "dự án",
      "đồng nghiệp",
      "nghề nghiệp",
      "offer",
    ),
  ],
  money: [
    cum(
      "tiền",
      "lương",
      "thu nhập",
      "chi tiêu",
      "tiết kiệm",
      "tài chính",
      "nợ nần",
    ),
  ],
  mind: [
    cum(
      "lo lắng",
      "mệt mỏi",
      "buồn",
      "stress",
      "áp lực",
      "hoang mang",
      "tâm trạng",
      "mất phương hướng",
    ),
  ],
  study: [
    cum(
      "học",
      "thi",
      "trường",
      "luận văn",
      "du học",
      "chuyên ngành",
      "tốt nghiệp",
      "bài vở",
    ),
  ],
};

/**
 * Đoán lĩnh vực từ chính câu hỏi. Ngoài đời không ai hỏi "bạn muốn xem mảng
 * nào", người đọc nghe chuyện rồi tự biết. Không đọc ra gì thì trả null để
 * chỗ gọi giữ mặc định của kiểu trải chứ đừng đoán bừa.
 */
export function detectTopic(question: string): Exclude<TopicKey, "general"> | null {
  for (const [key, ds] of Object.entries(TOPIC_HINTS)) {
    if (ds.some((m) => khop(m, question))) {
      return key as Exclude<TopicKey, "general">;
    }
  }
  return null;
}

/**
 * Câu mẫu của từng kiểu trải, tách sẵn thành từ. `fits` kéo điểm lên, `notFor`
 * kéo xuống — và vì câu "không hợp" của trải này thường đúng là câu "hợp" của
 * trải khác, hai vế tự đẩy câu hỏi về đúng chỗ.
 */
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
export interface Suggestion {
  slug: string;
  ten_vi: string;
  so_la: number;
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

const CACH_BIET = 2.5;

@Injectable()
export class SuggestService {
  private readonly metas: SpreadMeta[];
  private readonly theoSlug = new Map<string, SpreadMeta>();

  constructor(private readonly kb: KbService) {
    this.metas = this.kb.tatCaTrai().map((s) => {
      const hop = (s.hop_voi as string[] | undefined) ?? [];
      const khong = (s.khong_hop_voi as string[] | undefined) ?? [];
      return {
        slug: s.slug,
        ten_vi: s.ten_vi,
        count: (s.so_la as number) ?? 0,
        defaultTopic: DEFAULT_TOPIC[s.slug] ?? "general",
        fits: tokens(deaccent(hop.join(" "))),
        notFor: tokens(deaccent(khong.join(" "))),
      };
    });
    for (const m of this.metas) this.theoSlug.set(m.slug, m);
  }

  coTrai(slug: string) {
    return this.theoSlug.has(slug);
  }

  /**
   * Chấm điểm cả mười lăm kiểu trải cho một câu hỏi.
   * `khungOnly` bỏ hết tín hiệu lĩnh vực, chữ trùng và điểm cộng theo lĩnh vực,
   * chỉ còn khung câu hỏi — dùng khi đang cân nhắc có nên mời đổi trải không.
   */
  private scoreAll(question: string, khungOnly = false): Map<string, Score> {
    const q = deaccent(question.trim());
    const qt = tokens(q);
    const topic = detectTopic(question);
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
      if (!sig.test.some((m) => khop(m, question))) continue;
      for (const [slug, w] of Object.entries(sig.weight)) bump(slug, w, sig.reason);
    }

    for (const s of this.metas) {
      if (!khungOnly) {
        const plus = overlap(qt, s.fits) * LEX_EACH;
        const minus = overlap(qt, s.notFor) * LEX_EACH;
        if (plus) bump(s.slug, plus);
        if (minus) bump(s.slug, -minus);
        if (topic && s.defaultTopic === topic) bump(s.slug, 1.5);
      }
      /* Cỡ câu hỏi cũng là khung: câu cụt thì đừng đẩy sang trải bảy mười lá. */
      if (words >= CAU_DAI && s.count >= 7) bump(s.slug, 1);
      if (words < 6 && s.count >= 7) bump(s.slug, -1);
    }

    return out;
  }

  private moTa(slug: string, score: number, reason: string): Suggestion {
    const m = this.theoSlug.get(slug)!;
    return { slug, ten_vi: m.ten_vi, so_la: m.count, score, reason };
  }

  /**
   * Gợi ý kiểu trải cho một câu hỏi, xếp theo độ hợp.
   * Câu rỗng hoặc không đọc ra gì thì trả về ba trải nhỏ mặc định.
   */
  suggestSpreads(question: string, limit = 3): Suggestion[] {
    const fallback = () =>
      MAC_DINH.filter(({ slug }) => this.theoSlug.has(slug))
        .map(({ slug, reason }) => this.moTa(slug, 0, reason))
        .slice(0, limit);

    if (!question.trim()) return fallback();

    const ranked = [...this.scoreAll(question)]
      .filter(([slug, v]) => v.score >= NGUONG && this.theoSlug.has(slug))
      .sort((a, b) => b[1].score - a[1].score)
      .slice(0, limit);

    if (!ranked.length) return fallback();

    return ranked.map(([slug, v]) => this.moTa(slug, v.score, v.reason));
  }

  /**
   * Câu hỏi đang gõ có hợp một kiểu trải khác hơn hẳn kiểu đang mở không.
   * Trả về null khi trải đang mở đã là hợp nhất, hoặc khi cách biệt chưa đủ xa —
   * nhắc sai chỗ còn phiền hơn không nhắc.
   */
  betterSpread(question: string, current: string): Suggestion | null {
    const mineMeta = this.theoSlug.get(current);
    if (!mineMeta) return null;
    if (question.trim().split(/\s+/).length < 3) return null;

    /* Hỏi trúng ngay câu mà chính kiểu trải này lấy làm ví dụ thì im lặng.
       Người ta đang dùng đúng thứ mình vừa mời họ dùng, cắt ngang lúc đó là vô
       duyên — và trải nào cũng có vài câu hợp cả hai bên, thà bỏ sót còn hơn
       nhắc bừa. */
    const qt = tokens(deaccent(question));
    if (overlap(qt, mineMeta.fits) >= 2) return null;

    const all = this.scoreAll(question, true);
    const mine = all.get(current)?.score ?? 0;

    let best: { slug: string; v: Score } | null = null;
    for (const [slug, v] of all) {
      if (slug === current) continue;
      if (!this.theoSlug.has(slug)) continue;
      if (!best || v.score > best.v.score) best = { slug, v };
    }

    if (!best || best.v.score < NGUONG || best.v.score - mine < CACH_BIET) return null;

    return this.moTa(best.slug, best.v.score, best.v.reason);
  }
}
