import { Injectable, Logger } from "@nestjs/common";
import { WEB } from "../common/clients.js";
import { KbService, type ChatMessage, type ReadingRequest } from "../kb/kb.service.js";
import { detectGuard } from "../llm/guard.js";
import { LlmBudgetService } from "../llm/budget.service.js";
import { LlmService } from "../llm/llm.service.js";
import { flatten, parseParts, type ReadingParts } from "../llm/parse.js";
import {
  checkEssay,
  countWords,
  fixPrompt,
  fixPromptNgan,
  stripStockLabels,
  type KieuBai,
} from "../llm/validate.js";
import { decodeReading, type DrawnCard } from "./share.js";
import { ReadingsRepository, type StoredReading } from "./readings.repository.js";

export const MAX_FOLLOW_UPS = 3;

/** Ngoài đời cũng chỉ rút thêm một hai lá làm rõ, rút nữa là loãng cả bàn. */
export const MAX_CLARIFIERS = 2;

export type ReadingOutcome =
  | { kind: "over-budget" }
  | { kind: "ok"; reading: StoredReading; cached: boolean }
  | { kind: "bad-id" }
  | { kind: "no-provider" }
  | { kind: "error"; message: string };

export type FollowUpOutcome =
  | { kind: "over-budget" }
  | { kind: "ok"; reading: StoredReading }
  | { kind: "bad-id" }
  | { kind: "not-found" }
  | { kind: "limit" }
  | { kind: "no-provider" }
  | { kind: "error"; message: string };

export type ClarifyOutcome =
  | { kind: "over-budget" }
  | { kind: "ok"; reading: StoredReading }
  | { kind: "bad-id" }
  | { kind: "bad-card" }
  | { kind: "not-found" }
  | { kind: "limit" }
  | { kind: "no-provider" }
  | { kind: "error"; message: string };

@Injectable()
export class ReadingsService {
  private readonly log = new Logger(ReadingsService.name);

  constructor(
    private readonly kb: KbService,
    private readonly llm: LlmService,
    private readonly budget: LlmBudgetService,
    private readonly repo: ReadingsRepository,
  ) {}

  /** Dựng yêu cầu luận bài từ mã bài đọc do web sinh. */
  private request(id: string): ReadingRequest | null {
    const state = decodeReading(id);
    if (!state || !this.kb.spread(state.spread)) return null;
    return {
      spreadSlug: state.spread,
      question: state.question,
      topic: state.topic,
      cards: state.cards,
      guard: detectGuard(state.question),
    };
  }

  async get(id: string) {
    return this.repo.find(id);
  }

  /**
   * Bóc bài có cấu trúc ra khỏi đầu ra của mô hình, gỡ nốt mấy nhãn quen tay,
   * rồi ghép lại thành văn xuôi liền. Bản văn xuôi mới là bản đem đi soát và
   * đem đi lưu, nên bài trả về khuôn hỏng vẫn chạy y như trước.
   */
  private shape(text: string): { parts: ReadingParts | null; essay: string } {
    const raw = parseParts(text);
    if (!raw) return { parts: null, essay: stripStockLabels(text) };
    const parts: ReadingParts = {
      toanCanh: stripStockLabels(raw.toanCanh),
      theoViTri: raw.theoViTri.map((p) => ({ ...p, doan: stripStockLabels(p.doan) })),
      ket: stripStockLabels(raw.ket),
    };
    return { parts, essay: flatten(parts) };
  }

  /**
   * Viết bài luận rồi soát theo mục 9. Vi phạm thì gọi lại đúng một lần với
   * danh sách chỗ sai; lần hai không khá hơn thì giữ bài đầu và ghi log.
   */
  async create(id: string, client: string = WEB): Promise<ReadingOutcome> {
    const req = this.request(id);
    if (!req) return { kind: "bad-id" };

    const cached = await this.repo.find(id);
    if (cached) return { kind: "ok", reading: cached, cached: true };

    if (!this.llm.hasProvider()) return { kind: "no-provider" };
    if (!this.budget.con(client)) return { kind: "over-budget" };

    const spread = this.kb.spread(req.spreadSlug)!;
    /* Khuôn JSON tốn thêm ít token so với văn xuôi trần, chừa sẵn ra. */
    const budget = Math.ceil(spread.do_dai.max * 4) + 300;

    try {
      const messages = this.kb.buildMessages(req);
      const first = await this.llm.chat(messages, budget, client);

      const soat = { question: req.question, guard: !!req.guard };

      let best = { ...this.shape(first.text), provider: first.provider, model: first.model };
      let worst = this.faults(best, spread.do_dai, soat);

      if (worst.length) {
        const retry = await this.llm.chat(
          [
            ...messages,
            { role: "assistant", content: first.text },
            { role: "user", content: fixPrompt(worst) },
          ],
          budget,
          client,
        );
        const shaped = {
          ...this.shape(retry.text),
          provider: retry.provider,
          model: retry.model,
        };
        const after = this.faults(shaped, spread.do_dai, soat);
        if (after.length < worst.length) {
          best = shaped;
          worst = after;
        }
      }

      if (worst.length) {
        this.log.warn(
          `${id} còn vi phạm: ${worst.map((v) => `${v.rule}: ${v.detail}`).join(" | ")}`,
        );
      }

      const fresh = {
        id,
        essay: best.essay,
        parts: best.parts,
        provider: best.provider,
        model: best.model,
        followUps: [],
        clarifiers: [],
      };
      const saved = await this.repo.insert(fresh);

      const reading: StoredReading = saved ?? {
        ...fresh,
        createdAt: new Date().toISOString(),
      };

      this.log.log(
        `${id} xong, ${countWords(best.essay)} tiếng, ${best.provider}, cho ${client}`,
      );
      return { kind: "ok", reading, cached: false };
    } catch (e) {
      const message = e instanceof Error ? e.message : String(e);
      this.log.error(`${id} lỗi: ${message.slice(0, 300)}`);
      return { kind: "error", message };
    }
  }

  /**
   * Soát cả nội dung lẫn khuôn. Khuôn hỏng cũng tính là một lỗi, để lượt gọi
   * lại vốn đã có sẵn đòi lại JSON luôn thay vì thêm một lượt riêng.
   */
  private faults(
    shaped: { parts: ReadingParts | null; essay: string },
    length: { min: number; max: number },
    soat: { question: string; guard: boolean },
  ) {
    const out = checkEssay(shaped.essay, length, { ...soat, parts: shaped.parts });
    if (!shaped.parts) {
      out.push({
        rule: "khuôn",
        detail: "chưa trả về khối JSON có toan_canh, theo_vi_tri và ket",
      });
    }
    return out;
  }

  /**
   * Viết một câu trả lời ngắn rồi soát y như bài luận, chỉ khác là không có
   * khuôn JSON để đòi. Trước đây hai đường này gọi mô hình xong ghi thẳng vào
   * database, tức mọi luật ở mục 1, 5, 7 và 10 không áp dụng cho chúng: câu
   * hỏi thêm được phép nói "chắc chắn", được phép phán người hỏi lười.
   */
  private async vietNgan(
    messages: ChatMessage[],
    kieu: KieuBai,
    question: string,
    guard: boolean,
    client: string,
  ) {
    const khung = { min: 60, max: 120 };
    const soat = (t: string) => checkEssay(t, khung, { question, guard, kieu });

    const first = await this.llm.chat(messages, 600, client);
    let best = stripStockLabels(first.text);
    let worst = soat(best);

    if (worst.length) {
      const retry = await this.llm.chat(
        [...messages, { role: "assistant", content: first.text }, { role: "user", content: fixPromptNgan(worst) }],
        600,
        client,
      );
      const lai = stripStockLabels(retry.text);
      const sau = soat(lai);
      if (sau.length < worst.length) {
        best = lai;
        worst = sau;
      }
    }
    return { text: best, faults: worst };
  }

  /** Câu hỏi thêm sau bài, khung 60–120 tiếng theo mục 6. */
  async followUp(
    id: string,
    question: string,
    client: string = WEB,
  ): Promise<FollowUpOutcome> {
    const req = this.request(id);
    if (!req) return { kind: "bad-id" };

    const stored = await this.repo.find(id);
    if (!stored) return { kind: "not-found" };
    if (stored.followUps.length >= MAX_FOLLOW_UPS) return { kind: "limit" };
    if (!this.llm.hasProvider()) return { kind: "no-provider" };
    if (!this.budget.con(client)) return { kind: "over-budget" };

    /* Guard của mã bài đọc dò trên câu hỏi gốc, nhưng câu hỏi thêm là chữ mới
       của người rút: nó chạm được chủ đề cấm mà câu gốc không chạm, và mục 8
       bắt đúng đường này phải chuyển hướng. Dò lại rồi lấy cái nào bắt được,
       câu gốc đã cấm thì lượt sau vẫn cấm. */
    const guard = detectGuard(question) ?? req.guard;

    try {
      const messages = this.kb.buildFollowUpMessages({ ...req, guard }, stored.essay, question);
      const { text, faults } = await this.vietNgan(
        messages,
        "hoi_them",
        question,
        !!guard,
        client,
      );
      if (faults.length) {
        this.log.warn(
          `${id} hỏi thêm còn vi phạm: ${faults.map((v) => `${v.rule}: ${v.detail}`).join(" | ")}`,
        );
      }
      const next = await this.repo.appendFollowUp(id, { question, answer: text });
      return next
        ? { kind: "ok", reading: next }
        : { kind: "error", message: "không ghi được câu hỏi thêm" };
    } catch (e) {
      const message = e instanceof Error ? e.message : String(e);
      this.log.error(`${id} hỏi thêm lỗi: ${message.slice(0, 300)}`);
      return { kind: "error", message };
    }
  }

  /**
   * Rút thêm một lá làm rõ cho đúng một vị trí. Lá do người rút chọn từ phần
   * cỗ còn lại và gửi xuống đây, mô hình chỉ đọc chứ không tự bốc.
   */
  async clarify(
    id: string,
    stt: number,
    card: DrawnCard,
    client: string = WEB,
  ): Promise<ClarifyOutcome> {
    const req = this.request(id);
    if (!req) return { kind: "bad-id" };

    const spread = this.kb.spread(req.spreadSlug);
    const known = this.kb.card(card.slug);
    const inSpread = spread?.vi_tri.some((v) => v.stt === stt);
    /* Lá đã nằm trên bàn thì không phải lá làm rõ, nó là lá cũ đọc lại. */
    const onBoard = req.cards.some((c) => c.slug === card.slug);
    if (!spread || !known || !inSpread || onBoard) return { kind: "bad-card" };

    const stored = await this.repo.find(id);
    if (!stored) return { kind: "not-found" };
    if (
      stored.clarifiers.length >= MAX_CLARIFIERS ||
      stored.clarifiers.some((c) => c.stt === stt)
    ) {
      return { kind: "limit" };
    }
    if (!this.llm.hasProvider()) return { kind: "no-provider" };
    if (!this.budget.con(client)) return { kind: "over-budget" };

    try {
      const messages = this.kb.buildClarifierMessages(req, stored.essay, stt, card);
      const { text, faults } = await this.vietNgan(
        messages,
        "lam_ro",
        req.question,
        !!req.guard,
        client,
      );
      if (faults.length) {
        this.log.warn(
          `${id} lá làm rõ còn vi phạm: ${faults.map((v) => `${v.rule}: ${v.detail}`).join(" | ")}`,
        );
      }
      const next = await this.repo.appendClarifier(id, {
        stt,
        slug: card.slug,
        reversed: card.reversed,
        answer: text,
      });
      return next
        ? { kind: "ok", reading: next }
        : { kind: "error", message: "không ghi được lá làm rõ" };
    } catch (e) {
      const message = e instanceof Error ? e.message : String(e);
      this.log.error(`${id} làm rõ lỗi: ${message.slice(0, 300)}`);
      return { kind: "error", message };
    }
  }
}
