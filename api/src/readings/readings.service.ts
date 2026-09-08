import { Injectable, Logger } from "@nestjs/common";
import { KbService, type ReadingRequest } from "../kb/kb.service.js";
import { detectGuard } from "../llm/guard.js";
import { LlmService } from "../llm/llm.service.js";
import { checkEssay, countWords, fixPrompt, stripStockLabels } from "../llm/validate.js";
import { decodeReading } from "./share.js";
import { ReadingsRepository, type StoredReading } from "./readings.repository.js";

export const MAX_FOLLOW_UPS = 3;

export type ReadingOutcome =
  | { kind: "ok"; reading: StoredReading; cached: boolean }
  | { kind: "bad-id" }
  | { kind: "no-provider" }
  | { kind: "error"; message: string };

export type FollowUpOutcome =
  | { kind: "ok"; reading: StoredReading }
  | { kind: "bad-id" }
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
   * Viết bài luận rồi soát theo mục 9. Vi phạm thì gọi lại đúng một lần với
   * danh sách chỗ sai; lần hai không khá hơn thì giữ bài đầu và ghi log.
   */
  async create(id: string): Promise<ReadingOutcome> {
    const req = this.request(id);
    if (!req) return { kind: "bad-id" };

    const cached = await this.repo.find(id);
    if (cached) return { kind: "ok", reading: cached, cached: true };

    if (!this.llm.hasProvider()) return { kind: "no-provider" };

    const spread = this.kb.spread(req.spreadSlug)!;
    const budget = Math.ceil(spread.do_dai.max * 4);

    try {
      const messages = this.kb.buildMessages(req);
      const first = await this.llm.chat(messages, budget);
      first.text = stripStockLabels(first.text);

      let best = first;
      let worst = checkEssay(first.text, spread.do_dai);

      if (worst.length) {
        const retry = await this.llm.chat(
          [
            ...messages,
            { role: "assistant", content: first.text },
            { role: "user", content: fixPrompt(worst) },
          ],
          budget,
        );
        retry.text = stripStockLabels(retry.text);
        const after = checkEssay(retry.text, spread.do_dai);
        if (after.length < worst.length) {
          best = retry;
          worst = after;
        }
      }

      if (worst.length) {
        this.log.warn(
          `${id} còn vi phạm: ${worst.map((v) => `${v.rule}: ${v.detail}`).join(" | ")}`,
        );
      }

      const saved = await this.repo.insert({
        id,
        essay: best.text,
        provider: best.provider,
        model: best.model,
        followUps: [],
      });

      const reading: StoredReading = saved ?? {
        id,
        essay: best.text,
        provider: best.provider,
        model: best.model,
        createdAt: new Date().toISOString(),
        followUps: [],
      };

      this.log.log(`${id} xong, ${countWords(best.text)} tiếng, ${best.provider}`);
      return { kind: "ok", reading, cached: false };
    } catch (e) {
      const message = e instanceof Error ? e.message : String(e);
      this.log.error(`${id} lỗi: ${message.slice(0, 300)}`);
      return { kind: "error", message };
    }
  }

  /** Câu hỏi thêm sau bài, khung 60–120 tiếng theo mục 6. */
  async followUp(id: string, question: string): Promise<FollowUpOutcome> {
    const req = this.request(id);
    if (!req) return { kind: "bad-id" };

    const stored = await this.repo.find(id);
    if (!stored) return { kind: "not-found" };
    if (stored.followUps.length >= MAX_FOLLOW_UPS) return { kind: "limit" };
    if (!this.llm.hasProvider()) return { kind: "no-provider" };

    try {
      const messages = this.kb.buildFollowUpMessages(req, stored.essay, question);
      const { text } = await this.llm.chat(messages, 600);
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
}
