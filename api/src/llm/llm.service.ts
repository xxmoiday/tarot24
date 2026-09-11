import { Injectable, Logger } from "@nestjs/common";
import type { ChatMessage } from "../kb/kb.service.js";
import { WEB } from "../common/clients.js";
import { LlmBudgetService } from "./budget.service.js";

/**
 * Token của một lượt gọi. `vao` là tổng token vào kể cả phần đọc được từ cache,
 * `cache` là phần trong đó không phải trả giá đầy đủ.
 *
 * Hai dialect đếm khác nhau nên phải quy về một mối: OpenAI và DeepSeek để
 * `prompt_tokens` đã gồm phần cache, còn Anthropic tách `input_tokens` ra khỏi
 * `cache_read_input_tokens`. Không cộng lại thì hai nhà trả về hai nghĩa khác
 * nhau dưới cùng một cái tên.
 */
export interface Usage {
  vao: number;
  ra: number;
  cache: number;
  /**
   * Token suy luận, nằm TRONG `ra` chứ không cộng thêm. Tách ra vì hai số này
   * trả lời hai câu khác nhau: `ra` là tiền phải trả, `nghi` là bao nhiêu phần
   * trong đó mô hình dùng để tự soát trước khi viết. Bài dài ra hay phần nghĩ
   * dài ra đều làm `ra` tăng, nhìn mình `ra` thì không biết cái nào.
   */
  nghi: number;
}

/** Chưa gọi lượt nào, hoặc nhà cung cấp không trả `usage`. */
export const KHONG_DEM: Usage = { vao: 0, ra: 0, cache: 0, nghi: 0 };

export function congUsage(a: Usage, b: Usage): Usage {
  return {
    vao: a.vao + b.vao,
    ra: a.ra + b.ra,
    cache: a.cache + b.cache,
    nghi: a.nghi + b.nghi,
  };
}

/**
 * Bóc `usage` ra khỏi response. Nhà nào không trả thì để 0 chứ không đoán:
 * số 0 đọc ra là "không biết", còn số ước lượng đọc ra là "biết rồi".
 */
function docUsage(dialect: ProviderConfig["dialect"], json: Record<string, any>): Usage {
  const u = (json.usage ?? {}) as Record<string, any>;
  const so = (x: unknown) => (Number.isFinite(Number(x)) ? Number(x) : 0);

  if (dialect === "anthropic") {
    const cache = so(u.cache_read_input_tokens);
    return {
      vao: so(u.input_tokens) + cache + so(u.cache_creation_input_tokens),
      ra: so(u.output_tokens),
      cache,
      /* Anthropic trả phần nghĩ thành content block, không tách trong usage. */
      nghi: 0,
    };
  }
  return {
    vao: so(u.prompt_tokens),
    /* Đã gồm cả token suy luận, nên đây là con số bị tính tiền chứ không phải
       độ dài bài. Lượt đo thật: 1094 ra trong đó 959 là nghĩ, bài còn 135. */
    ra: so(u.completion_tokens),
    /* DeepSeek gọi là prompt_cache_hit_tokens, OpenAI để trong details. */
    cache: so(u.prompt_cache_hit_tokens ?? u.prompt_tokens_details?.cached_tokens),
    nghi: so(u.completion_tokens_details?.reasoning_tokens),
  };
}

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
            /* Tên `deepseek-chat` không còn trong tài liệu của DeepSeek: endpoint
               liệt kê model chỉ trả `deepseek-flash` và `deepseek-v4-pro`, và
               trang giá chỉ nhận `deepseek-v4-flash` là tên cũ. Tên không có
               trong tài liệu thì không biết nó phục vụ bằng model nào và tính
               tiền theo cột nào, mà hai cột chênh nhau 4,4 lần. */
            model: process.env.DEEPSEEK_MODEL ?? "deepseek-flash",
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
      /* Model do nhà cung cấp khai trong response, không phải cái mình gửi đi.
         Tên cũ được phục vụ bằng model khác là chuyện thường, mà đó mới là
         model viết ra bài và là model bị tính tiền. */
      return {
        text: String(text).trim(),
        usage: docUsage(p.dialect, json),
        model: typeof json.model === "string" && json.model ? json.model : p.model,
      };
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
        const { text, usage, model } = await this.callOne(p, messages, maxTokens);
        /* Đếm sau khi có bài, tức đếm đúng lượt phải trả tiền; nhà lỗi rồi rơi
           sang nhà kế thì chỉ tính một lượt. */
        this.budget.ghiNhan(client);
        this.log.log(
          `${p.name} ${model}${model === p.model ? "" : ` (gửi ${p.model})`}: ` +
            `${usage.vao} token vào` +
            (usage.cache ? ` (${usage.cache} từ cache)` : "") +
            `, ${usage.ra} ra` +
            (usage.nghi ? ` (${usage.nghi} nghĩ)` : ""),
        );
        return { text, provider: p.name, model, usage };
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        this.log.warn(`${p.name} lỗi: ${msg.slice(0, 200)}`);
        errors.push(msg);
      }
    }
    throw new Error(`Mọi nhà cung cấp đều lỗi: ${errors.join(" | ")}`);
  }
}
