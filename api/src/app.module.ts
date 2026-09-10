import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { HealthController } from "./health.controller.js";
import { KbController } from "./kb/kb.controller.js";
import { KbService } from "./kb/kb.service.js";
import { LlmBudgetService } from "./llm/budget.service.js";
import { LlmService } from "./llm/llm.service.js";
import { ReadingsController } from "./readings/readings.controller.js";
import { ReadingsRepository } from "./readings/readings.repository.js";
import { ReadingsService } from "./readings/readings.service.js";

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true })],
  controllers: [HealthController, KbController, ReadingsController],
  providers: [KbService, LlmBudgetService, LlmService, ReadingsRepository, ReadingsService],
})
export class AppModule {}
