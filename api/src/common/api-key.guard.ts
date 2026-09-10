import { CanActivate, ExecutionContext, Injectable, Logger } from "@nestjs/common";
import type { Request } from "express";
import { coKhoa, timTheoKhoa, type CoClient } from "./clients.js";

/**
 * Chỉ bên nào có khoá mới được gọi. Khoá khai trong env, xem `clients.ts`.
 * Chưa khai khoá nào thì chặn hết, tức khoá mặc định chứ không mở mặc định.
 */
@Injectable()
export class ApiKeyGuard implements CanActivate {
  private readonly log = new Logger(ApiKeyGuard.name);

  canActivate(context: ExecutionContext): boolean {
    if (!coKhoa()) {
      this.log.error("Chưa đặt API_KEY, mọi request bị chặn");
      return false;
    }

    const req = context.switchToHttp().getRequest<Request & CoClient>();
    const client = timTheoKhoa(req.header("x-api-key") ?? "");
    if (!client) return false;

    /* Chỗ duy nhất biết request này của bên nào; sổ đếm lượt đọc lại từ đây. */
    req.client = client.id;
    return true;
  }
}
