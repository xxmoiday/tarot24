import { HttpException } from "@nestjs/common";
import type { ExecutionContext } from "@nestjs/common";
import { beforeEach, describe, expect, it } from "vitest";
import { RateLimitGuard } from "./rate-limit.guard.js";

/** Dựng ngữ cảnh giả với đúng mấy header mà guard đọc. */
function ctx(headers: Record<string, string>, ip = "10.0.0.1"): ExecutionContext {
  const req = {
    ip,
    header: (name: string) => headers[name.toLowerCase()],
  };
  return {
    switchToHttp: () => ({ getRequest: () => req }),
  } as unknown as ExecutionContext;
}

describe("RateLimitGuard", () => {
  let guard: RateLimitGuard;

  beforeEach(() => {
    guard = new RateLimitGuard();
    process.env.RATE_PER_HOUR = "3";
  });

  /**
   * Đây là lỗi thật đã gặp: web gọi backend từ máy chủ nên IP kết nối luôn
   * giống nhau, trần lượt gọi hoá ra là trần của cả website.
   */
  it("tách người dùng theo x-client-ip dù IP kết nối trùng nhau", () => {
    const may_chu = "27.73.174.14";
    for (let i = 0; i < 3; i++) {
      expect(guard.canActivate(ctx({ "x-client-ip": "1.1.1.1" }, may_chu))).toBe(true);
    }
    /* Người thứ nhất hết lượt... */
    expect(() => guard.canActivate(ctx({ "x-client-ip": "1.1.1.1" }, may_chu))).toThrow(
      HttpException,
    );
    /* ...nhưng người thứ hai vẫn rút được, dù đi qua đúng máy chủ đó. */
    expect(guard.canActivate(ctx({ "x-client-ip": "2.2.2.2" }, may_chu))).toBe(true);
  });

  it("chặn khi một người vượt quá số lượt", () => {
    const gui = () => guard.canActivate(ctx({ "x-client-ip": "3.3.3.3" }));
    gui();
    gui();
    gui();
    expect(gui).toThrow(HttpException);
  });

  it("không có x-client-ip thì lùi về cf-connecting-ip rồi tới IP kết nối", () => {
    expect(guard.canActivate(ctx({ "cf-connecting-ip": "4.4.4.4" }))).toBe(true);
    expect(guard.canActivate(ctx({}, "5.5.5.5"))).toBe(true);
  });

  it("cắt header quá dài để không phình bộ nhớ", () => {
    const rac = "x".repeat(5000);
    expect(guard.canActivate(ctx({ "x-client-ip": rac }))).toBe(true);
    /* Cắt còn 45 ký tự nên hai header rác khác nhau ở đuôi vẫn chung một rổ. */
    expect(guard.canActivate(ctx({ "x-client-ip": rac + "khac" }))).toBe(true);
    expect(guard.canActivate(ctx({ "x-client-ip": rac }))).toBe(true);
    expect(() => guard.canActivate(ctx({ "x-client-ip": rac }))).toThrow(HttpException);
  });
});
