import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { LlmBudgetService } from "./budget.service.js";

let thuMuc: string;
let tep: string;

beforeEach(() => {
  thuMuc = mkdtempSync(path.join(os.tmpdir(), "tarot24-budget-"));
  tep = path.join(thuMuc, "so.json");
  process.env.LLM_BUDGET_FILE = tep;
  process.env.LLM_CALLS_PER_DAY = "3";
});

afterEach(() => {
  rmSync(thuMuc, { recursive: true, force: true });
  delete process.env.LLM_BUDGET_FILE;
  delete process.env.LLM_CALLS_PER_DAY;
  delete process.env.API_KEY;
  delete process.env.API_KEYS;
});

/** Ngày theo giờ Việt Nam, đúng cách service tự tính. */
const homNay = () =>
  new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Ho_Chi_Minh",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());

describe("LlmBudgetService", () => {
  it("cho gọi tới đúng trần rồi chặn", () => {
    const b = new LlmBudgetService();
    for (let i = 0; i < 3; i++) {
      expect(b.con(), `lượt ${i + 1}`).toBe(true);
      b.ghiNhan();
    }
    expect(b.con()).toBe(false);
    expect(b.tinhHinh()).toMatchObject({ dem: 3, tran: 3 });
  });

  it("đếm tiếp sau khi khởi động lại, không về không", () => {
    const b = new LlmBudgetService();
    b.ghiNhan();
    b.ghiNhan();

    const sau = new LlmBudgetService();
    expect(sau.tinhHinh().dem).toBe(2);
    expect(sau.con()).toBe(true);
    sau.ghiNhan();
    expect(sau.con()).toBe(false);
  });

  it("sổ của hôm qua thì bỏ, đếm lại từ đầu", () => {
    writeFileSync(tep, JSON.stringify({ ngay: "2020-01-01", dem: 99 }));
    const b = new LlmBudgetService();
    expect(b.tinhHinh()).toMatchObject({ dem: 0, ngay: homNay() });
    expect(b.con()).toBe(true);
  });

  it("sổ hỏng thì đếm lại từ đầu chứ không làm backend chết", () => {
    writeFileSync(tep, "{ đây không phải json");
    const b = new LlmBudgetService();
    expect(b.tinhHinh().dem).toBe(0);
    expect(b.con()).toBe(true);
  });

  it("đặt trần 0 là tắt hẳn chốt chặn", () => {
    process.env.LLM_CALLS_PER_DAY = "0";
    const b = new LlmBudgetService();
    for (let i = 0; i < 50; i++) b.ghiNhan();
    expect(b.con()).toBe(true);
  });

  it("không ghi được sổ thì vẫn đếm trong bộ nhớ", () => {
    process.env.LLM_BUDGET_FILE = path.join(thuMuc, "khong-co-thu-muc-nay", "so.json");
    const b = new LlmBudgetService();
    b.ghiNhan();
    b.ghiNhan();
    b.ghiNhan();
    expect(b.con()).toBe(false);
  });
});

describe("trần riêng của từng bên", () => {
  beforeEach(() => {
    process.env.LLM_CALLS_PER_DAY = "10";
    process.env.API_KEY = "khoa-cua-web";
    process.env.API_KEYS = "troly:khoa-cua-troly:2";
  });

  it("bên có trần riêng bị chặn ở trần của mình, chưa đụng trần tổng", () => {
    const b = new LlmBudgetService();
    b.ghiNhan("troly");
    b.ghiNhan("troly");

    expect(b.con("troly")).toBe(false);
    expect(b.tinhHinh().dem).toBe(2);
  });

  it("một bên hết lượt thì bên kia vẫn gọi được", () => {
    const b = new LlmBudgetService();
    b.ghiNhan("troly");
    b.ghiNhan("troly");

    expect(b.con("troly")).toBe(false);
    expect(b.con("web")).toBe(true);
  });

  it("web không có trần riêng nên chỉ dừng ở trần tổng", () => {
    const b = new LlmBudgetService();
    for (let i = 0; i < 10; i++) {
      expect(b.con("web"), `lượt ${i + 1}`).toBe(true);
      b.ghiNhan("web");
    }
    expect(b.con("web")).toBe(false);
  });

  it("trần tổng chặn cả bên còn lượt riêng", () => {
    const b = new LlmBudgetService();
    for (let i = 0; i < 10; i++) b.ghiNhan("web");
    expect(b.con("troly")).toBe(false);
  });

  it("số của từng bên sống qua lần khởi động lại", () => {
    const b = new LlmBudgetService();
    b.ghiNhan("troly");

    const sau = new LlmBudgetService();
    expect(sau.con("troly")).toBe(true);
    sau.ghiNhan("troly");
    expect(sau.con("troly")).toBe(false);
    expect(sau.con("web")).toBe(true);
  });

  it("số của bên bị sửa tay thành rác thì bỏ, không đem so chuỗi với trần", () => {
    writeFileSync(
      tep,
      JSON.stringify({ ngay: homNay(), dem: 2, ben: { troly: "hai lượt" } }),
    );
    const b = new LlmBudgetService();
    expect(b.con("troly")).toBe(true);
    b.ghiNhan("troly");
    b.ghiNhan("troly");
    expect(b.con("troly")).toBe(false);
  });

  it("bên lạ không khai trong env thì chỉ chịu trần tổng", () => {
    const b = new LlmBudgetService();
    for (let i = 0; i < 5; i++) b.ghiNhan("chua-khai");
    expect(b.con("chua-khai")).toBe(true);
  });
});
