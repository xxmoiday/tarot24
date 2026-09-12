import { describe, expect, it } from "vitest";
import { detectGuard, type GuardKind } from "./guard.js";

/** Câu hỏi thật theo cách người ta hay gõ, gộp theo nhóm phải bắt. */
const PHAI_BAT: Record<GuardKind, string[]> = {
  health: [
    "Em bị bệnh này có khỏi không",
    "Tháng sau em đi khám, kết quả sẽ thế nào",
    "Có nên mổ nội soi hay điều trị thuốc",
    "Khối u này có phải ung thư không",
    "Mẹ em huyết áp cao, có nên nhập viện",
    "Em có nên đi cai nghiện không",
    "Em bị rối loạn lo âu, bao giờ đỡ",
  ],
  death: [
    "Bà em sống được bao lâu nữa",
    "Dạo này em không muốn sống nữa",
    "Em chán sống lắm rồi",
    "Em muốn tự sát",
    "Em đang tự làm hại mình",
    "Em không muốn tồn tại nữa",
  ],
  pregnancy: [
    "Năm nay em có mang thai không",
    "Que thử hai vạch mờ, em có bầu thật không",
    "Em chậm kinh mấy ngày rồi",
    "Chuyển phôi lần này có đậu không",
    "Có nên làm IVF không",
    "Em có nên bỏ thai không",
  ],
  legal: [
    "Vụ kiện này thắng kiện được không",
    "Ra toà em có được quyền nuôi con không",
    "Chia tài sản thế nào cho công bằng",
    "Tranh chấp đất với nhà bên có xong không",
    "Anh ấy bị bắt rồi, có bị phạt tù không",
  ],
  finance: [
    "Có nên mua mảnh đất ở Long Thành",
    "Em có nên mua vàng lúc này không",
    "Mã này có nên chốt lời chưa",
    "Có nên vay ngân hàng thế chấp nhà để đầu tư",
    "Em có nên bỏ tiền vào coin không",
    "Có nên mua chứng chỉ quỹ hay trái phiếu",
    "Có nên đi làm bảo hiểm nhân thọ không",
    "Bạn em rủ làm đa cấp, có nên không",
    "Có nên dồn tiền mua căn hộ chung cư",
  ],
};

/**
 * Câu hỏi bài PHẢI đọc được. Đây là nửa quan trọng hơn: danh sách từ khoá dài
 * ra thì mỗi lần thêm một cụm là thêm một cửa bắt oan, mà bắt oan nghĩa là
 * người ta gõ một câu hỏi bình thường rồi bị từ chối.
 */
const KHONG_DUOC_BAT = [
  "Mối này có đi tiếp được không",
  "Em có nên nói rõ lòng mình không",
  "Người ấy có bênh vực em không",
  "Em thương người ấy chết đi được, có nên tỏ tình không",
  "Sống chết gì em cũng làm, bài nói em nên bắt đầu từ đâu",
  "Em nên bắt đầu từ đâu",
  "Việc này nên bắt đầu từ tháng sau hay để sang năm",
  "Sếp mới về, em nên bám lại hay tìm chỗ khác",
  "Em có nên chuyển ngành không",
  "Em có nên đổi việc không",
  "Em có nên học lên cao học không",
  "Năm nay em thi có đậu không",
  "Em có nên mở quán cà phê không",
  "Công ty có mở rộng quy mô không",
  "Em có nên so đo với người ta không",
  "Hai đứa có nên hoà giải không",
  "Em có nên tiết kiệm hơn không",
  "Bao giờ em trả hết nợ",
  "Em có nên xuất hiện trước công chúng không",
  "Em có nên tha thứ không",
  "Gia đình có ủng hộ hai đứa không",
  "Người cũ có quay lại không",
  "Tháng tới của em thế nào",
  "Em có nên chuyển ra ở riêng không",
  "Chuyện này bao giờ ngã ngũ",
];

describe("dò chủ đề bài không trả lời", () => {
  for (const [kind, cau] of Object.entries(PHAI_BAT)) {
    it.each(cau)(`${kind}: %s`, (q) => {
      expect(detectGuard(q)?.kind).toBe(kind);
    });
  }

  it.each(KHONG_DUOC_BAT)("không bắt oan: %s", (q) => {
    expect(detectGuard(q)).toBeNull();
  });

  it("câu rỗng thì không dò", () => {
    expect(detectGuard("")).toBeNull();
    expect(detectGuard("   ")).toBeNull();
  });

  /* Mọi nhóm đều phải có câu nhắc và câu chuyển hướng, không thì màn đặt câu
     hỏi hiện ô trống. */
  it("nhóm nào bắt được cũng có đủ nhãn, câu nhắc và câu chuyển hướng", () => {
    for (const cau of Object.values(PHAI_BAT).flat()) {
      const g = detectGuard(cau)!;
      expect(g.label, cau).toBeTruthy();
      expect(g.hint, cau).toBeTruthy();
      expect(g.notice, cau).toBeTruthy();
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
