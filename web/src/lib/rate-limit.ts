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

/**
 * Chỉ đọc header mà hạ tầng ghi đè, không đọc header khách tự khai được.
 *
 * Trước đây chỗ này đọc `cf-connecting-ip` đầu tiên, phòng khi đứng sau
 * Cloudflare. Nhưng tarot24.online đi thẳng vào Vercel, không có Cloudflare ở
 * giữa, nên header đó do người gọi tự đặt: gửi kèm một giá trị ngẫu nhiên mỗi
 * lượt là có bucket mới mỗi lượt, tức không còn giới hạn nào. Đã thử trên
 * production và đúng như vậy. Tệ hơn nữa là giá trị đó được chuyển tiếp xuống
 * backend qua `x-client-ip`, chỗ backend tin tuyệt đối, nên cả hai tầng đổ
 * cùng lúc.
 *
 * Vercel ghi đè `x-forwarded-for` bằng IP thật của khách, cũng đã thử: gửi
 * `x-forwarded-for` giả thì lượt gọi vẫn bị tính vào IP thật. Nên dùng đúng nó.
 * Nếu sau này đặt Cloudflare trước Vercel thì phải xem lại chỗ này, vì lúc đó
 * `x-forwarded-for` sẽ là IP của Cloudflare chứ không phải của khách.
 */
export function clientIp(request: Request) {
  const h = request.headers;
  return h.get("x-forwarded-for")?.split(",")[0]?.trim() || "khong-ro";
}
