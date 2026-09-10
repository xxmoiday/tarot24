import { Controller, Get, UseGuards } from "@nestjs/common";
import { ApiKeyGuard } from "./common/api-key.guard.js";
import { KbService } from "./kb/kb.service.js";
import { LlmBudgetService } from "./llm/budget.service.js";
import { LlmService } from "./llm/llm.service.js";
import { ReadingsRepository } from "./readings/readings.repository.js";

/**
 * Đòi khoá như mọi đường khác: không có đường nào ở đây mở toang cả. Giám sát
 * ngoài thì gửi kèm khoá, hoặc theo dõi mã 403 — máy chết thì không trả nổi
 * 403, nên nó cũng là một tín hiệu sống.
 */
@Controller("health")
@UseGuards(ApiKeyGuard)
export class HealthController {
  constructor(
    private readonly kb: KbService,
    private readonly llm: LlmService,
    private readonly budget: LlmBudgetService,
    private readonly repo: ReadingsRepository,
  ) {}

  @Get()
  check() {
    return {
      ok: true,
      database: this.repo.ready,
      llm: this.llm.hasProvider(),
      spread: !!this.kb.spread("ba-la-thoi-gian"),
      luot: this.budget.tinhHinh(),
    };
  }
}
