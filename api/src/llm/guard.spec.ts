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

  /* Người chơi phái sinh hỏi dày nhất trong nhóm tiền bạc, mà danh sách cũ chỉ
     có "forex" với "coin" nên họ lọt hết. Lọt thì luật 1 đòi bài nghiêng về một
     phía trong khi mục 5 cấm đúng chuyện đó, và lượt gọi lại là tiền đổ đi. */
  it("bắt chuyện phái sinh, kể cả khi viết bằng tiếng lóng của nghề", () => {
    for (const q of [
      "Có nên chơi tiếp futures Long Short ngày hôm nay không?",
      "Có nên nhồi thêm lệnh Sell future không?",
      "Hôm nay có nên vào lệnh không",
      "Có nên gồng lệnh này thêm không",
      "Có nên đánh margin x10 không",
      "Có nên all in con này không",
      "BTC tuần này có lên không",
    ]) {
      expect(detectGuard(q)?.kind, q).toBe("finance");
    }
  });

  it("không bắt oan câu thường", () => {
    expect(detectGuard("Mối này có đi tiếp được không")).toBeNull();
    expect(detectGuard("Em có nên đổi việc không")).toBeNull();
    expect(detectGuard("")).toBeNull();
  });

  /* "long" là bẫy: bỏ dấu thì "lòng" cũng thành "long", và "Long Thành" nữa.
     Bắt chữ đó một mình là cắt nhầm hẳn một mảng câu hỏi tình cảm. */
  it("không nhầm lòng với lệnh long", () => {
    for (const q of [
      "Có nên mở lòng với người đó không",
      "Lòng em còn thương người đó không",
      "Người đó có thật lòng với em không",
      "Chuyện này có làm em nhẹ lòng hơn không",
    ]) {
      expect(detectGuard(q), q).toBeNull();
    }
  });
});
