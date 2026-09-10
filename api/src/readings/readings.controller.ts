import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  NotFoundException,
  Param,
  Post,
  Req,
  UseGuards,
} from "@nestjs/common";
import type { Request } from "express";
import { ApiKeyGuard } from "../common/api-key.guard.js";
import { clientCua, type CoClient } from "../common/clients.js";
import { RateLimitGuard } from "../common/rate-limit.guard.js";
import { MAX_CLARIFIERS, MAX_FOLLOW_UPS, ReadingsService } from "./readings.service.js";

const MAX_QUESTION = 200;

@Controller("readings")
@UseGuards(ApiKeyGuard)
export class ReadingsController {
  constructor(private readonly readings: ReadingsService) {}

  /** Lấy bài đọc đã lưu; dùng cho trang chia sẻ, không tốn lượt gọi mô hình. */
  @Get(":id")
  async get(@Param("id") id: string) {
    const r = await this.readings.get(id);
    if (!r) throw new NotFoundException("Chưa có bài đọc cho mã này");
    return {
      essay: r.essay,
      parts: r.parts,
      followUps: r.followUps,
      clarifiers: r.clarifiers,
      createdAt: r.createdAt,
    };
  }

  /** Viết bài luận cho mã bài đọc, gọi lại cùng mã thì trả bản đã lưu. */
  @Post()
  @UseGuards(RateLimitGuard)
  async create(@Body("id") id: string, @Req() req: Request & CoClient) {
    if (!id || typeof id !== "string") throw new BadRequestException("Thiếu mã bài đọc");
    const out = await this.readings.create(id, clientCua(req));

    switch (out.kind) {
      case "ok":
        return {
          essay: out.reading.essay,
          parts: out.reading.parts,
          followUps: out.reading.followUps,
          clarifiers: out.reading.clarifiers,
          cached: out.cached,
        };
      case "bad-id":
        throw new BadRequestException("Mã bài đọc không hợp lệ");
      case "no-provider":
        return { essay: null, reason: "no-provider" };
      case "over-budget":
        throw new HttpException(
          { essay: null, reason: "over-budget" },
          HttpStatus.TOO_MANY_REQUESTS,
        );
      case "error":
        throw new HttpException(
          { essay: null, reason: "error" },
          HttpStatus.BAD_GATEWAY,
        );
    }
  }

  @Post(":id/follow-ups")
  @UseGuards(RateLimitGuard)
  async followUp(
    @Param("id") id: string,
    @Body("question") question: string,
    @Req() req: Request & CoClient,
  ) {
    const q = (question ?? "").trim().slice(0, MAX_QUESTION);
    if (!q) throw new BadRequestException("Thiếu câu hỏi");

    const out = await this.readings.followUp(id, q, clientCua(req));
    switch (out.kind) {
      case "ok": {
        const last = out.reading.followUps.at(-1);
        return { answer: last?.answer ?? null, followUps: out.reading.followUps };
      }
      case "bad-id":
        throw new BadRequestException("Mã bài đọc không hợp lệ");
      case "not-found":
        throw new NotFoundException("Chưa có bài đọc cho mã này");
      case "limit":
        throw new HttpException(
          { answer: null, reason: "limit", max: MAX_FOLLOW_UPS },
          HttpStatus.TOO_MANY_REQUESTS,
        );
      case "no-provider":
        return { answer: null, reason: "no-provider" };
      case "over-budget":
        throw new HttpException(
          { answer: null, reason: "over-budget" },
          HttpStatus.TOO_MANY_REQUESTS,
        );
      case "error":
        throw new HttpException({ answer: null, reason: "error" }, HttpStatus.BAD_GATEWAY);
    }
  }

  /** Lá làm rõ cho một vị trí; lá do web rút từ phần cỗ còn lại và gửi xuống. */
  @Post(":id/clarifiers")
  @UseGuards(RateLimitGuard)
  async clarify(
    @Param("id") id: string,
    @Body("stt") stt: number,
    @Body("slug") slug: string,
    @Body("reversed") reversed: boolean,
    @Req() req: Request & CoClient,
  ) {
    const n = Number(stt);
    if (!Number.isInteger(n) || n < 1 || !slug || typeof slug !== "string") {
      throw new BadRequestException("Thiếu vị trí hoặc lá làm rõ");
    }

    const out = await this.readings.clarify(
      id,
      n,
      { slug, reversed: !!reversed },
      clientCua(req),
    );
    switch (out.kind) {
      case "ok":
        return { clarifiers: out.reading.clarifiers };
      case "bad-id":
        throw new BadRequestException("Mã bài đọc không hợp lệ");
      case "bad-card":
        throw new BadRequestException("Vị trí hoặc lá làm rõ không hợp lệ");
      case "not-found":
        throw new NotFoundException("Chưa có bài đọc cho mã này");
      case "limit":
        throw new HttpException(
          { clarifiers: null, reason: "limit", max: MAX_CLARIFIERS },
          HttpStatus.TOO_MANY_REQUESTS,
        );
      case "no-provider":
        return { clarifiers: null, reason: "no-provider" };
      case "over-budget":
        throw new HttpException(
          { clarifiers: null, reason: "over-budget" },
          HttpStatus.TOO_MANY_REQUESTS,
        );
      case "error":
        throw new HttpException(
          { clarifiers: null, reason: "error" },
          HttpStatus.BAD_GATEWAY,
        );
    }
  }
}
