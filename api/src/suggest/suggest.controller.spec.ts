import { INestApplication } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { KbService } from "../kb/kb.service.js";
import { SuggestController } from "./suggest.controller.js";
import { SuggestService } from "./question.js";

/* Hợp đồng HTTP của đường gợi ý: khoá, kiểm tham số, khuôn trả về. Còn chất
   lượng gợi ý thì đối chiếu thẳng với bản web, không chốt ở đây. */
const KHOA = "khoa-test-suggest";
let app: INestApplication;
let goc: string;

async function goi(body: unknown, khoa: string | null = KHOA) {
  const res = await fetch(`${goc}/api/suggest-spreads`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      ...(khoa ? { "x-api-key": khoa } : {}),
    },
    body: JSON.stringify(body),
  });
  return { status: res.status, body: await res.json().catch(() => null) };
}

beforeAll(async () => {
  process.env.API_KEY = KHOA;
  const mod = await Test.createTestingModule({
    controllers: [SuggestController],
    providers: [SuggestService, KbService],
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

/* 201 chứ không phải 200: cả API này không nơi nào đặt @HttpCode, nên mọi POST
   đều trả 201 kể cả /api/readings. Đường mới theo lệ cũ, đừng thành ngoại lệ. */
describe("POST /api/suggest-spreads", () => {
  it("trả ba gợi ý, mỗi cái có slug, số lá và một câu lý do", async () => {
    const { status, body } = await goi({ question: "Nên nhận offer mới hay ở lại công ty cũ" });
    expect(status).toBe(201);
    expect(body.suggestions).toHaveLength(3);
    for (const s of body.suggestions) {
      expect(typeof s.slug).toBe("string");
      expect(typeof s.so_la).toBe("number");
      expect(s.reason.length).toBeGreaterThan(0);
    }
  });

  it("câu rỗng vẫn trả ba trải mặc định chứ không lỗi", async () => {
    const { status, body } = await goi({ question: "" });
    expect(status).toBe(201);
    expect(body.suggestions).toHaveLength(3);
  });

  it("thiếu hẳn question cũng coi như rỗng", async () => {
    expect((await goi({})).status).toBe(201);
  });

  it("kèm theo lời nhắc câu mơ hồ và lĩnh vực đoán được", async () => {
    const mo = await goi({ question: "Vận mệnh của tôi" });
    expect(mo.body.vague.kind).toBe("chung-chung");

    const ro = await goi({ question: "Chuyện tình cảm của mình với người ấy ra sao" });
    expect(ro.body.topic).toBe("love");
  });

  it("chỉ trả `better` khi client nói đang mở trải nào", async () => {
    const khong = await goi({ question: "Tuần này của mình ra sao" });
    expect(khong.body.better).toBeNull();

    const co = await goi({ question: "Tuần này của mình ra sao", spread: "mot-la-hom-nay" });
    expect(co.status).toBe(201);
  });

  it("question sai kiểu trả 400", async () => {
    expect((await goi({ question: 123 })).status).toBe(400);
  });

  it("kiểu trải không có thật trả 400", async () => {
    const { status, body } = await goi({ question: "abc", spread: "khong-co-that" });
    expect(status).toBe(400);
    expect(body.message).toContain("khong-co-that");
  });

  it("vẫn đòi khoá như mọi đường khác", async () => {
    expect((await goi({ question: "abc" }, null)).status).toBe(403);
  });
});
