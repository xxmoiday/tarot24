import { Controller, Get } from "@nestjs/common";
import { KbService } from "./kb/kb.service.js";
import { LlmService } from "./llm/llm.service.js";
import { ReadingsRepository } from "./readings/readings.repository.js";

/** Không cần khoá, để giám sát ngoài gọi được. Không lộ gì nhạy cảm. */
@Controller("health")
export class HealthController {
  constructor(
    private readonly kb: KbService,
    private readonly llm: LlmService,
    private readonly repo: ReadingsRepository,
  ) {}

  @Get()
  check() {
    return {
      ok: true,
      database: this.repo.ready,
      llm: this.llm.hasProvider(),
      spread: !!this.kb.spread("ba-la-thoi-gian"),
    };
  }
}
