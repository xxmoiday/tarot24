import { CanActivate, ExecutionContext, Injectable, Logger } from "@nestjs/common";
import type { Request } from "express";

/**
 * Chỉ web của mình được gọi. Khoá dùng chung đặt trong env cả hai phía.
 * Chưa đặt khoá thì chặn hết, tức khoá mặc định chứ không mở mặc định.
 */
@Injectable()
export class ApiKeyGuard implements CanActivate {
  private readonly log = new Logger(ApiKeyGuard.name);

  canActivate(context: ExecutionContext): boolean {
    const key = process.env.API_KEY;
    if (!key) {
      this.log.error("Chưa đặt API_KEY, mọi request bị chặn");
      return false;
    }
    const req = context.switchToHttp().getRequest<Request>();
    const sent = req.header("x-api-key") ?? "";
    /* So sánh theo độ dài trước để tránh so chuỗi rỗng với khoá thật. */
    return sent.length === key.length && sent === key;
  }
}
