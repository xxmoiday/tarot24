import type { ExecutionContext } from "@nestjs/common";
import { afterEach, describe, expect, it } from "vitest";
import { ApiKeyGuard } from "./api-key.guard.js";
import { clientCua, tranCua, type CoClient } from "./clients.js";

/** Ngữ cảnh giả với đúng cái header mà guard đọc. */
function ctx(key?: string) {
  const req: CoClient & { header: (n: string) => string | undefined } = {
    header: (n: string) => (n.toLowerCase() === "x-api-key" ? key : undefined),
  };
  const c = {
    switchToHttp: () => ({ getRequest: () => req }),
  } as unknown as ExecutionContext;
  return { req, c };
}

afterEach(() => {
  delete process.env.API_KEY;
  delete process.env.API_KEYS;
});

describe("ApiKeyGuard", () => {
  it("chưa khai khoá nào thì chặn hết", () => {
    const { c } = ctx("bat-ky-thu-gi");
    expect(new ApiKeyGuard().canActivate(c)).toBe(false);
  });

  it("khoá của web vào được và được ghi tên là web", () => {
    process.env.API_KEY = "khoa-cua-web";
    const { req, c } = ctx("khoa-cua-web");
    expect(new ApiKeyGuard().canActivate(c)).toBe(true);
    expect(clientCua(req)).toBe("web");
  });

  it("mỗi khoá ra đúng tên bên đó, kèm trần riêng", () => {
    process.env.API_KEY = "khoa-cua-web";
    process.env.API_KEYS = "troly:khoa-cua-troly:250";

    const { req, c } = ctx("khoa-cua-troly");
    expect(new ApiKeyGuard().canActivate(c)).toBe(true);
    expect(clientCua(req)).toBe("troly");
    expect(tranCua("troly")).toBe(250);
    /* Web chỉ chịu trần tổng, không có nắp riêng. */
    expect(tranCua("web")).toBe(0);
  });

  it("khoá sai thì chặn và không gắn tên bên nào", () => {
    process.env.API_KEY = "khoa-cua-web";
    const { req, c } = ctx("khoa-doan-mo");
    expect(new ApiKeyGuard().canActivate(c)).toBe(false);
    expect(req.client).toBeUndefined();
  });

  it("khai thiếu khoá thì bỏ qua mục đó chứ không mở toang", () => {
    process.env.API_KEYS = "troly:,rong:   ,:khong-ten";
    const { c } = ctx("");
    expect(new ApiKeyGuard().canActivate(c)).toBe(false);
  });
});
