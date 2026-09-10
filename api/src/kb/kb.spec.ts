import { afterEach, describe, expect, it } from "vitest";
import { KbService } from "./kb.service.js";

const kb = new KbService();

afterEach(() => {
  delete process.env.WEB_BASE_URL;
});

describe("KB mở ra ngoài", () => {
  it("trả đủ 78 lá, mỗi lá có đường dẫn tra ngược được", () => {
    const la = kb.tatCaLa();
    expect(la).toHaveLength(78);
    for (const c of la) {
      expect(kb.card(c.slug), c.slug).not.toBeNull();
    }
  });

  it("giữ nguyên mọi trường của KB chứ không cắt bớt", () => {
    const ba_coc = kb.tatCaLa().find((c) => c.id === "cup_03")!;
    expect(ba_coc.ten_vi).toBe("Ba Cốc");
    /* Mấy trường nặng ký nhất: lăng kính năm lĩnh vực, cảnh báo, cách nói Việt. */
    expect(Object.keys(ba_coc.lang_kinh)).toContain("tinh_cam");
    expect(ba_coc.canh_bao).toBeTruthy();
    expect(ba_coc.cach_noi_viet).toBeTruthy();
  });

  it("ảnh lá trỏ theo id, đổi được bằng WEB_BASE_URL", () => {
    expect(kb.tatCaLa()[0].anh).toBe("https://www.tarot24.online/cards/major_00.webp");

    process.env.WEB_BASE_URL = "http://localhost:3000/";
    expect(kb.tatCaLa()[0].anh).toBe("http://localhost:3000/cards/major_00.webp");
  });

  it("trả đủ 15 kiểu trải, đường dẫn khớp cái mã bài đọc dùng", () => {
    const trai = kb.tatCaTrai();
    expect(trai).toHaveLength(15);
    for (const s of trai) {
      expect(kb.spread(s.slug), s.slug)?.toMatchObject({ id: s.id });
    }
    expect(trai.find((s) => s.id === "ba_la_thoi_gian")?.slug).toBe("ba-la-thoi-gian");
  });

  it("kiểu trải giữ cả luật đọc và bài mẫu", () => {
    const celtic = kb.tatCaTrai().find((s) => s.slug === "thap-tu-celtic")!;
    expect(celtic.vi_tri).toHaveLength(10);
    expect(Array.isArray(celtic.luat_doc)).toBe(true);
    expect(celtic.vi_du).toBeTruthy();
  });
});
