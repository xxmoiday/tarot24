import { INestApplication } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { KbController } from "./kb.controller.js";
import { KbService } from "./kb.service.js";

/**
 * Đường /api/cards đi qua HTTP thật, vì phần dễ gãy nhất không nằm trong service
 * mà ở chỗ Nest bóc `?bo=` ra khỏi query và ở mã lỗi trả về.
 */
const KHOA = "khoa-test-cho-kb";
let app: INestApplication;
let goc: string;

async function lay(duong: string, khoa: string | null = KHOA) {
  const res = await fetch(`${goc}${duong}`, {
    headers: khoa ? { "x-api-key": khoa } : {},
  });
  return { status: res.status, body: await res.json().catch(() => null) };
}

beforeAll(async () => {
  process.env.API_KEY = KHOA;
  const mod = await Test.createTestingModule({
    controllers: [KbController],
    providers: [KbService],
  }).compile();
  app = mod.createNestApplication();
  app.setGlobalPrefix("api");
  await app.listen(0);
  goc = await app.getUrl();
});

afterAll(async () => {
  await app?.close();
  delete process.env.API_KEY;
});

describe("GET /api/cards lọc theo bộ", () => {
  it("không có tham số thì vẫn trả cả 78 lá như trước", async () => {
    const { status, body } = await lay("/api/cards");
    expect(status).toBe(200);
    expect(body.cards).toHaveLength(78);
  });

  it("?bo=kiem trả đúng 14 lá bộ kiếm", async () => {
    const { status, body } = await lay("/api/cards?bo=kiem");
    expect(status).toBe(200);
    expect(body.cards).toHaveLength(14);
    for (const c of body.cards) expect(c.chat).toBe("kiem");
  });

  it("?bo=coc và ?bo=cup ra cùng một kết quả", async () => {
    const coc = await lay("/api/cards?bo=coc");
    const cup = await lay("/api/cards?bo=cup");
    expect(coc.body.cards).toHaveLength(14);
    expect(cup.body.cards.map((c: { id: string }) => c.id)).toEqual(
      coc.body.cards.map((c: { id: string }) => c.id),
    );
  });

  it("?an=chinh trả 22 lá ẩn chính, ghép với bo thì rỗng", async () => {
    expect((await lay("/api/cards?an=chinh")).body.cards).toHaveLength(22);
    expect((await lay("/api/cards?bo=kiem&an=chinh")).body.cards).toHaveLength(0);
  });

  /* Gõ sai mà trả 200 kèm mảng rỗng thì bên nối API tưởng bộ đó hết lá. */
  it("tên bộ sai trả 400 và nói rõ nhận những gì", async () => {
    const { status, body } = await lay("/api/cards?bo=sword");
    expect(status).toBe(400);
    expect(body.message).toContain("sword");
    expect(body.message).toContain("kiem");
  });

  it("tên ẩn sai cũng trả 400", async () => {
    expect((await lay("/api/cards?an=major")).status).toBe(400);
  });

  it("vẫn đòi khoá như mọi đường khác", async () => {
    expect((await lay("/api/cards?bo=kiem", null)).status).toBe(403);
  });
});
