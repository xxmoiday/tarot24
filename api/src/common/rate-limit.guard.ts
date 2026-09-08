import { CanActivate, ExecutionContext, HttpException, HttpStatus, Injectable } from "@nestjs/common";
import type { Request } from "express";

interface Bucket {
  stamps: number[];
}

const buckets = new Map<string, Bucket>();
const WINDOW_MS = 60 * 60 * 1000;
let lastSweep = Date.now();

function sweep(now: number) {
  if (now - lastSweep < WINDOW_MS) return;
  lastSweep = now;
  for (const [k, b] of buckets) {
    b.stamps = b.stamps.filter((t) => now - t < WINDOW_MS);
    if (!b.stamps.length) buckets.delete(k);
  }
}

/**
 * Web gọi backend từ phía máy chủ nên IP kết nối luôn là của máy chạy web,
 * một giá trị duy nhất cho mọi khách. Web phải gửi kèm IP người dùng ở header
 * này, không thì trần lượt gọi biến thành trần của cả website.
 */
const CLIENT_IP_HEADER = "x-client-ip";

/** Đủ cho IPv6 dạng dài nhất; cắt để header rác không phình bộ nhớ. */
const MAX_IP_LEN = 45;

/**
 * Giới hạn lượt theo IP, giữ trong bộ nhớ tiến trình. Backend chạy một
 * tiến trình trên VPS nên đủ; chạy nhiều tiến trình thì thay bằng Redis.
 */
@Injectable()
export class RateLimitGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest<Request>();
    const max = Number(process.env.RATE_PER_HOUR ?? 30);

    /* ApiKeyGuard ở cấp controller đã chạy trước, nên chỉ bên có khoá mới tới
       được đây và header do bên đó khai là tin được. */
    const ip = (
      req.header(CLIENT_IP_HEADER)?.trim() ||
      req.header("cf-connecting-ip") ||
      req.header("x-forwarded-for")?.split(",")[0]?.trim() ||
      req.ip ||
      "khong-ro"
    ).slice(0, MAX_IP_LEN);

    const now = Date.now();
    sweep(now);
    const bucket = buckets.get(ip) ?? { stamps: [] };
    bucket.stamps = bucket.stamps.filter((t) => now - t < WINDOW_MS);

    if (bucket.stamps.length >= max) {
      const retryAfter = Math.ceil((WINDOW_MS - (now - bucket.stamps[0])) / 1000);
      buckets.set(ip, bucket);
      throw new HttpException(
        { message: "Bạn vừa rút hơi nhiều, nghỉ một lát rồi quay lại nhé", retryAfter },
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    bucket.stamps.push(now);
    buckets.set(ip, bucket);
    return true;
  }
}
