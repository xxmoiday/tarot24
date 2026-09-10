import { Injectable, Logger } from "@nestjs/common";
import type { ChatMessage } from "../kb/kb.service.js";
import { WEB } from "../common/clients.js";
import { LlmBudgetService } from "./budget.service.js";

interface ProviderConfig {
  name: string;
  baseUrl: string;
  apiKey: string;
  model: string;
  dialect: "openai" | "anthropic";
}

@Injectable()
export class LlmService {
  private readonly log = new Logger(LlmService.name);
  private readonly timeout = Number(process.env.LLM_TIMEOUT_MS ?? 60_000);

  constructor(private readonly budget: LlmBudgetService) {}

  /**
   * Đọc cấu hình nhà cung cấp từ env. Thứ tự trong LLM_PROVIDERS là thứ tự
   * thử; nhà nào thiếu key thì bỏ qua chứ không làm hỏng cả chuỗi.
   */
  private providers(): ProviderConfig[] {
    const order = (process.env.LLM_PROVIDERS ?? "deepseek,anthropic,openai")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    const table: Record<string, ProviderConfig | null> = {
      deepseek: process.env.DEEPSEEK_API_KEY
        ? {
            name: "deepseek",
            baseUrl: process.env.DEEPSEEK_BASE_URL ?? "https://api.deepseek.com",
            apiKey: process.env.DEEPSEEK_API_KEY,
            model: process.env.DEEPSEEK_MODEL ?? "deepseek-chat",
            dialect: "openai",
          }
        : null,
      anthropic: process.env.ANTHROPIC_API_KEY
        ? {
            name: "anthropic",
            baseUrl: process.env.ANTHROPIC_BASE_URL ?? "https://api.anthropic.com",
            apiKey: process.env.ANTHROPIC_API_KEY,
            model: process.env.ANTHROPIC_MODEL ?? "claude-sonnet-5",
            dialect: "anthropic",
          }
        : null,
      openai: process.env.OPENAI_API_KEY
        ? {
            name: "openai",
            baseUrl: process.env.OPENAI_BASE_URL ?? "https://api.openai.com",
            apiKey: process.env.OPENAI_API_KEY,
            model: process.env.OPENAI_MODEL ?? "gpt-4.1-mini",
            dialect: "openai",
          }
        : null,
    };

    return order.map((n) => table[n]).filter((p): p is ProviderConfig => !!p);
  }

  hasProvider() {
    return this.providers().length > 0;
  }

  private async callOne(p: ProviderConfig, messages: ChatMessage[], maxTokens: number) {
    const ctl = new AbortController();
    const timer = setTimeout(() => ctl.abort(), this.timeout);
    try {
      const system = messages.filter((m) => m.role === "system").map((m) => m.content);
      const rest = messages.filter((m) => m.role !== "system");

      const url =
        p.dialect === "anthropic"
          ? `${p.baseUrl}/v1/messages`
          : `${p.baseUrl}/v1/chat/completions`;

      const headers: Record<string, string> =
        p.dialect === "anthropic"
          ? {
              "content-type": "application/json",
              "x-api-key": p.apiKey,
              "anthropic-version": "2023-06-01",
            }
          : { "content-type": "application/json", authorization: `Bearer ${p.apiKey}` };

      const body =
        p.dialect === "anthropic"
          ? { model: p.model, max_tokens: maxTokens, system: system.join("\n\n"), messages: rest }
          : { model: p.model, max_tokens: maxTokens, messages, temperature: 0.7 };

      const res = await fetch(url, {
        method: "POST",
        headers,
        body: JSON.stringify(body),
        signal: ctl.signal,
      });
      if (!res.ok) {
        throw new Error(`${p.name} trả ${res.status}: ${(await res.text()).slice(0, 300)}`);
      }
      const json = (await res.json()) as Record<string, any>;
      const text =
        p.dialect === "anthropic"
          ? (json.content ?? []).map((c: { text?: string }) => c.text ?? "").join("")
          : (json.choices?.[0]?.message?.content ?? "");
      if (!String(text).trim()) throw new Error(`${p.name} trả bài rỗng`);
      return String(text).trim();
    } finally {
      clearTimeout(timer);
    }
  }

  /** Gọi lần lượt theo thứ tự cấu hình, nhà nào lỗi thì rơi sang nhà kế. */
  async chat(messages: ChatMessage[], maxTokens = 1400, client: string = WEB) {
    const list = this.providers();
    if (!list.length) throw new Error("Chưa cấu hình nhà cung cấp LLM nào");
    const errors: string[] = [];
    for (const p of list) {
      try {
        const text = await this.callOne(p, messages, maxTokens);
        /* Đếm sau khi có bài, tức đếm đúng lượt phải trả tiền; nhà lỗi rồi rơi
           sang nhà kế thì chỉ tính một lượt. */
        this.budget.ghiNhan(client);
        return { text, provider: p.name, model: p.model };
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        this.log.warn(`${p.name} lỗi: ${msg.slice(0, 200)}`);
        errors.push(msg);
      }
    }
    throw new Error(`Mọi nhà cung cấp đều lỗi: ${errors.join(" | ")}`);
  }
}
