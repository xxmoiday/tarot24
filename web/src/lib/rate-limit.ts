import "server-only";

/**
 * Giới hạn lượt gọi theo IP, giữ trong bộ nhớ tiến trình. Đủ cho một máy chủ
 * đơn; chạy nhiều tiến trình thì thay bằng Redis dùng chung.
 */
const buckets = new Map<string, number[]>();
let lastSweep = Date.now();

function sweep(now: number, windowMs: number) {
  if (now - lastSweep < windowMs) return;
  lastSweep = now;
  for (const [key, stamps] of buckets) {
    const live = stamps.filter((t) => now - t < windowMs);
    if (live.length) buckets.set(key, live);
    else buckets.delete(key);
  }
}

export interface RateResult {
  ok: boolean;
  /** Số giây nên chờ trước khi thử lại */
  retryAfter: number;
}

export function rateLimit(key: string, max: number, windowMs: number): RateResult {
  const now = Date.now();
  sweep(now, windowMs);
  const stamps = (buckets.get(key) ?? []).filter((t) => now - t < windowMs);
  if (stamps.length >= max) {
    const retryAfter = Math.ceil((windowMs - (now - stamps[0])) / 1000);
    buckets.set(key, stamps);
    return { ok: false, retryAfter };
  }
  stamps.push(now);
  buckets.set(key, stamps);
  return { ok: true, retryAfter: 0 };
}

/** Cloudflare đặt cf-connecting-ip; sau đó mới tới x-forwarded-for. */
export function clientIp(request: Request) {
  const h = request.headers;
  return (
    h.get("cf-connecting-ip") ??
    h.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    h.get("x-real-ip") ??
    "khong-ro"
  );
}
