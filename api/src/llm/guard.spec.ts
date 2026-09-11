import { describe, expect, it } from "vitest";
import { detectGuard } from "./guard.js";

describe("dò chủ đề bài không trả lời", () => {
  it("bắt mấy nhóm quen thuộc", () => {
    expect(detectGuard("Em bị bệnh này có khỏi không")?.kind).toBe("health");
    expect(detectGuard("Có nên mua mảnh đất ở Long Thành")?.kind).toBe("finance");
    expect(detectGuard("Vụ kiện này thắng kiện được không")?.kind).toBe("legal");
  });

  /* Mục 8 lo nhất đường tự làm hại mình, mà mấy cách nói thường gặp nhất không
     có chữ "chết" hay "tự tử" nào trong đó. */
  it("bắt cả những cách nói không có chữ chết", () => {
    for (const q of [
      "Dạo này em không muốn sống nữa",
      "Em chán sống lắm rồi",
      "Em muốn tự sát",
      "Em đang tự làm hại mình",
      "Em không thiết sống nữa",
    ]) {
      expect(detectGuard(q)?.kind, q).toBe("death");
    }
  });

  it("không bắt oan câu thường", () => {
    expect(detectGuard("Mối này có đi tiếp được không")).toBeNull();
    expect(detectGuard("Em có nên đổi việc không")).toBeNull();
    expect(detectGuard("")).toBeNull();
  });
});
