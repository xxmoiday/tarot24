import { readFileSync } from "node:fs";
import path from "node:path";
import { Injectable, Logger } from "@nestjs/common";
import rawCards from "../../data/cards.source.json" with { type: "json" };
import rawSpreads from "../../data/spreads.source.json" with { type: "json" };
import type { Guard } from "../llm/guard.js";
import type { DrawnCard, TopicKey } from "../readings/share.js";

export interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface RawCard {
  id: string;
  ten_vi: string;
  lang_kinh: Record<string, string>;
  [k: string]: unknown;
}

export interface RawSpread {
  id: string;
  ten_vi: string;
  /* KB còn nhiều trường nữa — mô tả, cách rút, hợp với câu hỏi nào — mà chỗ
     luận bài không đụng tới; khai mở để đường trả KB ra ngoài giữ nguyên chúng. */
  [k: string]: unknown;
  vi_tri: {
    stt: number;
    ten: string;
    cau_hoi: string;
    goi_y_doc: string;
    lang_kinh_uu_tien: string;
  }[];
  luat_doc: string[];
  do_dai: { min: number; max: number };
  vi_du?: ViDu[];
}

/**
 * Bài mẫu của một kiểu trải. `bai_luan` là bản văn xuôi để người đọc file này
 * xem; `parts` là chính bài đó tách theo vị trí, đúng khuôn đầu ra mà mô hình
 * phải trả. Mẫu nào có `parts` thì mới đem làm few-shot được, vì few-shot văn
 * xuôi dạy mô hình phá khuôn JSON.
 */
export interface ViDu {
  cau_hoi: string;
  bai_luan: string;
  ghi_chu?: string;
  parts?: {
    toan_canh: string;
    theo_vi_tri: { stt: number; doan: string }[];
    ket: string;
  };
}

/** Mã lĩnh vực của KB, khác mã dùng trong ứng dụng. */
const KB_TOPIC: Record<TopicKey, string> = {
  love: "tinh_cam",
  work: "cong_viec",
  money: "tien_bac",
  mind: "tam_ly",
  study: "hoc_hanh",
  general: "chung",
};

/** Đường dẫn của web ứng với id nào trong KB. */
const SPREAD_ID: Record<string, string> = {
  "mot-la-hom-nay": "mot_la_hom_nay",
  "co-hay-khong": "mot_la_co_khong",
  "ba-la-thoi-gian": "ba_la_thoi_gian",
  "ba-la-tinh-huong": "ba_la_tinh_huong",
  "nam-la-tinh-cam": "nam_la_tinh_cam",
  "bay-la-mong-ngua": "mong_ngua_7",
  "thap-tu-celtic": "celtic_cross",
  "nam-la-cong-viec": "cong_viec_5",
  "bon-la-tien-bac": "tien_bac_4",
  "ba-la-giua-hai-nguoi": "hai_nguoi",
  "nam-la-chon-huong": "quyet_dinh_ab",
  "ba-la-nhin-lai-minh": "ban_than_3",
  "bay-la-tuan-nay": "tuan_nay_7",
  "nam-la-thang-toi": "thang_toi",
  "muoi-hai-la-nam-toi": "nam_toi_12",
};

/** Đi ngược `SPREAD_ID`: từ id trong KB ra đường dẫn mà mã bài đọc dùng. */
const SLUG_CUA_TRAI = new Map(Object.entries(SPREAD_ID).map(([slug, id]) => [id, slug]));

/**
 * Ảnh lá nằm bên web, đặt tên theo id chứ không theo đường dẫn tiếng Việt.
 * Để ở env vì máy dev và máy thật trỏ về hai nơi khác nhau.
 */
function anhCuaLa(id: string) {
  const goc = process.env.WEB_BASE_URL ?? "https://www.tarot24.online";
  return `${goc.replace(/\/$/, "")}/cards/${id}.webp`;
}

/** Sinh đường dẫn từ tên lá, đúng cùng quy tắc mà web đang dùng. */
export function slugOf(tenVi: string) {
  return tenVi
    .toLowerCase()
    .replace(/đ/g, "d")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

/**
 * Người rút có quyền không đặt câu hỏi. Trước đây chỗ này mượn tạm câu mẫu của
 * vị trí đầu tiên, tức là tự nghĩ hộ một câu hỏi rồi trả lời nó; nói thẳng là
 * không có câu hỏi thì mô hình đọc bàn bài chứ không đoán mò ý người ta.
 */
const KHONG_CAU_HOI =
  "Mình không có câu hỏi cụ thể. Cứ đọc bàn bài này và nói thẳng nó đang nói chuyện gì.";

export interface ReadingRequest {
  spreadSlug: string;
  question: string;
  topic: TopicKey;
  cards: DrawnCard[];
  guard?: Guard | null;
}

@Injectable()
export class KbService {
  private readonly log = new Logger(KbService.name);
  private readonly spreads = (rawSpreads as { spreads: RawSpread[] }).spreads;
  private readonly cards = (rawCards as { cards: RawCard[] }).cards;
  private readonly cardsById = new Map<string, RawCard>();
  private readonly cardsBySlug = new Map<string, RawCard>();
  private systemPrompt: string | null = null;

  constructor() {
    for (const c of this.cards) {
      this.cardsById.set(c.id, c);
      this.cardsBySlug.set(slugOf(c.ten_vi), c);
    }
    this.log.log(
      `nạp ${this.cardsById.size} lá và ${this.spreads.length} kiểu trải`,
    );
  }

  /** Nguyên văn system prompt của KB, đọc một lần rồi giữ lại. */
  systemLuanBai() {
    this.systemPrompt ??= readFileSync(
      path.join(process.cwd(), "data", "system_luan_bai.md"),
      "utf8",
    );
    return this.systemPrompt;
  }

  spread(slug: string) {
    const id = SPREAD_ID[slug];
    return this.spreads.find((s) => s.id === id) ?? null;
  }

  card(slug: string) {
    return this.cardsBySlug.get(slug) ?? null;
  }

  /**
   * Cả bộ bài cho bên ngoài đọc, nguyên vẹn như trong KB, thêm hai thứ mà file
   * gốc không có: đường dẫn tiếng Việt dùng trong mã bài đọc, và ảnh lá.
   */
  moLa(raw: RawCard) {
    return { ...raw, slug: slugOf(raw.ten_vi), anh: anhCuaLa(raw.id) };
  }

  tatCaLa() {
    return this.cards.map((c) => this.moLa(c));
  }

  /** Kiểu trải nguyên vẹn, thêm đường dẫn vì trong KB nó chỉ có id. */
  moTrai(raw: RawSpread) {
    return { ...raw, slug: SLUG_CUA_TRAI.get(raw.id) ?? raw.id };
  }

  tatCaTrai() {
    return this.spreads.map((s) => this.moTrai(s));
  }

  /**
   * Rút gọn một lá theo đúng danh sách trường trong prompts/README.md:
   * bỏ chiêm tinh, nguyên tố và tên tiếng Anh để giảm token và để mô hình
   * không nhắc tới chúng.
   */
  private cardPayload(raw: RawCard, reversed: boolean, stt: number, topic: TopicKey) {
    const kbTopic = KB_TOPIC[topic];
    const lang = raw.lang_kinh;
    const lens =
      kbTopic === "chung"
        ? { tam_ly: lang.tam_ly }
        : { [kbTopic]: lang[kbTopic], tam_ly: lang.tam_ly };

    return {
      vi_tri: stt,
      nguoc: reversed,
      ten_vi: raw.ten_vi,
      cot_loi: raw.cot_loi,
      tu_khoa_xuoi: raw.tu_khoa_xuoi,
      tu_khoa_nguoc: raw.tu_khoa_nguoc,
      canh_bao: raw.canh_bao,
      lang_kinh: lens,
      sac_thai: raw.sac_thai,
      cach_noi_viet: raw.cach_noi_viet,
      bieu_tuong: (raw.bieu_tuong as string[]).slice(0, 2),
      ...(raw.ba_cach_doc ? { ba_cach_doc: raw.ba_cach_doc } : {}),
    };
  }

  /**
   * Ghép ba khối theo prompts/README.md: system nguyên văn, ngữ cảnh lượt,
   * rồi câu hỏi của người dùng. Câu chạm chủ đề cấm thì kèm ví dụ mẫu của
   * chính kiểu trải đó để mô hình biết cách chuyển hướng.
   */
  buildMessages(req: ReadingRequest, kemMau = true): ChatMessage[] {
    const spread = this.spread(req.spreadSlug);
    if (!spread) throw new Error(`Không có kiểu trải ${req.spreadSlug}`);

    const la = req.cards
      .slice(0, spread.vi_tri.length)
      .map((d, i) => {
        const raw = this.card(d.slug);
        return raw ? this.cardPayload(raw, d.reversed, i + 1, req.topic) : null;
      })
      .filter(Boolean);

    const context = {
      spread: {
        ten_vi: spread.ten_vi,
        vi_tri: spread.vi_tri,
        luat_doc: spread.luat_doc,
        do_dai: spread.do_dai,
      },
      linh_vuc: KB_TOPIC[req.topic],
      ...(req.guard ? { chu_de_cam: true } : {}),
      la,
      cau_hoi: req.question || null,
    };

    const giua = Math.round((spread.do_dai.min + spread.do_dai.max) / 2);
    const messages: ChatMessage[] = [
      { role: "system", content: this.systemLuanBai() },
      {
        role: "system",
        content:
          `Ngữ cảnh lượt này, dạng JSON:\n\n${JSON.stringify(context, null, 1)}\n\n` +
          `Bài lần này dài ${spread.do_dai.min}–${spread.do_dai.max} tiếng tính cả ba ` +
          `phần cộng lại, nhắm vào giữa khung là khoảng ${giua} tiếng.\n\n` +
          this.khuonDauRa(spread.vi_tri.length),
      },
    ];

    if (kemMau) {
      for (const m of this.mauLamGuong(spread, !!req.guard)) messages.push(m);
    }

    messages.push({ role: "user", content: req.question || KHONG_CAU_HOI });
    return messages;
  }

  /**
   * Bài mẫu đặt trước câu hỏi thật. Dặn suông thì mô hình vẫn né câu hỏi đóng
   * và vẫn để bốn vị trí nói cùng một ý; một bài đã viết đúng dạy nhanh hơn
   * mọi luật viết ra chữ.
   *
   * Chỉ đẩy cho trải bốn tới năm lá: đó là chỗ hay hỏng nhất, còn bắt mọi lượt
   * cõng thêm ba trăm tiếng bài mẫu thì không đáng. Câu chạm chủ đề cấm thì
   * luôn đẩy, vì ở đó mẫu chuyển hướng đáng giá hơn tiền token.
   */
  private mauLamGuong(spread: RawSpread, guard: boolean): ChatMessage[] {
    const soViTri = spread.vi_tri.length;
    if (!guard && (soViTri < 4 || soViTri > 5)) return [];

    const list = spread.vi_du ?? [];
    /* Mẫu có ghi_chu là mẫu chuyển hướng, chỉ đúng khi câu hỏi chạm chủ đề cấm. */
    const sample = guard
      ? (list.find((v) => v.ghi_chu) ?? list[0])
      : list.find((v) => !v.ghi_chu);
    if (!sample) return [];

    /* Mẫu chưa tách theo vị trí thì đưa vào như một bài để tham khảo giọng,
       chứ không đặt vào lượt của trợ lý: làm thế là dạy trả văn xuôi. */
    if (!sample.parts) {
      return [
        {
          role: "system",
          content:
            `Một bài mẫu của kiểu trải này, cho câu hỏi "${sample.cau_hoi}":\n\n` +
            `${sample.bai_luan}\n\n` +
            "Lấy giọng và cách đọc của bài mẫu; đầu ra của bạn vẫn phải là khối JSON đúng khuôn trên.",
        },
      ];
    }

    return [
      { role: "user", content: sample.cau_hoi },
      { role: "assistant", content: JSON.stringify(sample.parts) },
    ];
  }

  /**
   * Khuôn đầu ra. Mục 7 của system prompt cho phép ứng dụng đòi định dạng
   * khác, và ở đây cần biết đoạn nào nói lá nào để giao diện nối được lá với
   * đoạn, còn câu chốt thì tách riêng vì đó là phần người xem nhớ nhất.
   */
  private khuonDauRa(soViTri: number) {
    return [
      "Trả về đúng một khối JSON, không kèm chữ nào ngoài nó, theo khuôn:",
      '{"toan_canh": "…", "theo_vi_tri": [{"stt": 1, "doan": "…"}], "ket": "…"}',
      "",
      "toan_canh: một câu mở, đặt lại bối cảnh câu hỏi và nói bàn bài nặng hay nhẹ, đang đứng hay đang chuyển. Không tóm tắt trước kết luận của các vị trí phía dưới, không nói trước hướng đi.",
      `theo_vi_tri: đúng ${soViTri} phần tử, đúng thứ tự vị trí của kiểu trải, stt là số thứ tự vị trí đó. Mỗi đoạn nối vào đoạn trước chứ không luận rời từng lá; vị trí nào chỉ đáng một câu thì một câu. Vị trí sau phải nói một điều mà vị trí trước chưa nói, theo luật 2 ở mục 10.`,
      "ket: đoạn cuối. Câu hỏi đóng thì mở bằng một câu nghiêng rõ về một phía, rồi một việc làm được trong bảy ngày tới, rồi một điều kiện nếu... thì để lật lại lựa chọn đó. Câu hỏi mở thì trả lời thẳng câu hỏi cộng một việc cụ thể. Không lời chúc, không nhắc lại tên các lá đã đi qua.",
      "",
      "Chữ trong từng trường là văn xuôi thuần: không tiêu đề, không gạch đầu dòng, không nhãn hai chấm đầu đoạn, không nhắc số thứ tự vị trí ra thành chữ.",
      "",
      "Bài mẫu đặt trước câu hỏi thật là để thấy cách dựng, không phải kho chữ để chép. Hoàn cảnh người hỏi lần này khác, nên đừng lấy lại câu mở, việc cụ thể hay điều kiện của bài mẫu; lá trên bàn quyết định nội dung, bài mẫu chỉ quyết định dáng bài.",
    ].join("\n");
  }

  /**
   * Câu hỏi thêm: giữ nguyên ngữ cảnh, thêm bài đã trả rồi tới câu mới.
   *
   * Không kèm bài mẫu. Chính bài vừa luận đã nằm ngay trên, nó dạy giọng sát
   * hơn mọi bài mẫu; mà kèm vào thì một bài đọc có ba lượt hỏi thêm và hai lá
   * làm rõ phải trả tiền cho bài mẫu tới sáu lần. Bài mẫu lại là khối JSON,
   * đặt ngay trước một lượt đòi văn xuôi thì chỉ tổ làm mô hình phân vân.
   */
  buildFollowUpMessages(req: ReadingRequest, essay: string, question: string): ChatMessage[] {
    return [
      ...this.buildMessages(req, false),
      { role: "assistant", content: essay },
      {
        role: "user",
        content: `${question}\n\n(Trả lời ngắn 60–120 tiếng bằng văn xuôi thuần, không JSON, dựa trên chính những lá đã trải, không rút thêm lá.)`,
      },
    ];
  }

  /**
   * Lá làm rõ cho một vị trí. Ngoài đời gặp vị trí ra lá khó hiểu thì người
   * đọc rút thêm một lá đặt cạnh nó rồi đọc tiếp — mục 8 cho phép đúng việc
   * này khi ứng dụng gửi lá xuống, nên lá do người rút chọn chứ không do mô
   * hình bịa ra.
   */
  buildClarifierMessages(
    req: ReadingRequest,
    essay: string,
    stt: number,
    card: DrawnCard,
  ): ChatMessage[] {
    const spread = this.spread(req.spreadSlug);
    if (!spread) throw new Error(`Không có kiểu trải ${req.spreadSlug}`);
    const pos = spread.vi_tri.find((v) => v.stt === stt);
    if (!pos) throw new Error(`Kiểu trải ${req.spreadSlug} không có vị trí ${stt}`);

    const raw = this.card(card.slug);
    if (!raw) throw new Error(`Không có lá ${card.slug}`);

    return [
      ...this.buildMessages(req, false),
      { role: "assistant", content: essay },
      {
        role: "user",
        content:
          `Người hỏi muốn làm rõ vị trí "${pos.ten}" (${pos.cau_hoi}). ` +
          `Đã rút thêm một lá làm rõ cho riêng vị trí đó:\n\n` +
          `${JSON.stringify(this.cardPayload(raw, card.reversed, stt, req.topic), null, 1)}\n\n` +
          `Đọc lá này cho đúng vị trí đó và nối vào chỗ bài đã nói, ` +
          `60–120 tiếng bằng văn xuôi thuần, không JSON. ` +
          `Nói tên lá ra một lần cho người hỏi biết lá làm rõ là lá gì.`,
      },
    ];
  }
}
