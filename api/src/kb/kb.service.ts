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

interface RawCard {
  id: string;
  ten_vi: string;
  lang_kinh: Record<string, string>;
  [k: string]: unknown;
}

interface RawSpread {
  id: string;
  ten_vi: string;
  vi_tri: {
    stt: number;
    ten: string;
    cau_hoi: string;
    goi_y_doc: string;
    lang_kinh_uu_tien: string;
  }[];
  luat_doc: string[];
  do_dai: { min: number; max: number };
  vi_du?: { cau_hoi: string; bai_luan: string; ghi_chu?: string }[];
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
  private readonly cardsById = new Map<string, RawCard>();
  private readonly cardsBySlug = new Map<string, RawCard>();
  private systemPrompt: string | null = null;

  constructor() {
    for (const c of (rawCards as { cards: RawCard[] }).cards) {
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
  buildMessages(req: ReadingRequest): ChatMessage[] {
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
          `Bài lần này dài ${spread.do_dai.min}–${spread.do_dai.max} tiếng, ` +
          `nhắm vào giữa khung là khoảng ${giua} tiếng. ` +
          `Văn xuôi thuần, không tiêu đề, không gạch đầu dòng, không nhãn hai chấm đầu đoạn.`,
      },
    ];

    if (req.guard) {
      const sample = spread.vi_du?.find((v) => v.ghi_chu) ?? spread.vi_du?.[0];
      if (sample) {
        messages.push({ role: "user", content: sample.cau_hoi });
        messages.push({ role: "assistant", content: sample.bai_luan });
      }
    }

    messages.push({ role: "user", content: req.question || KHONG_CAU_HOI });
    return messages;
  }

  /** Câu hỏi thêm: giữ nguyên ngữ cảnh, thêm bài đã trả rồi tới câu mới. */
  buildFollowUpMessages(req: ReadingRequest, essay: string, question: string): ChatMessage[] {
    return [
      ...this.buildMessages(req),
      { role: "assistant", content: essay },
      {
        role: "user",
        content: `${question}\n\n(Trả lời ngắn 60–120 tiếng, dựa trên chính những lá đã trải, không rút thêm lá.)`,
      },
    ];
  }
}
