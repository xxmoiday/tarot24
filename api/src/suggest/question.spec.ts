import { describe, expect, it } from "vitest";
import { KbService } from "../kb/kb.service.js";
import { SuggestService, detectTopic } from "./question.js";

const kb = new KbService();
const suggest = new SuggestService(kb);

/*
 * Bỏ dấu khi dò từ khoá làm "yếu" đọc thành "yêu", "cuối" thành "cưới", "vô"
 * thành "vợ", "thì" thành "thi". Câu hỏi sức khoẻ hay dự án bị đẩy sang tình
 * cảm, rồi kiểu trải chuyên đề mất luôn điểm cộng lĩnh vực nên tụt hạng.
 *
 * Bảy ca đầu là bảng do bên Nhóm Trợ Lý gửi sang; phần sau là những từ cùng họ
 * mà quét thêm mới thấy.
 */
describe("dấu tiếng Việt không được làm lệch lĩnh vực", () => {
  it("cặp câu chỉ khác một chữ thì không được ra hai lĩnh vực khác nhau", () => {
    expect(detectTopic("Dạo này sức khoẻ mình yếu đi, có nên đi khám không?")).toBeNull();
    expect(detectTopic("Dạo này sức khoẻ mình kém đi, có nên đi khám không?")).toBeNull();

    expect(detectTopic("Mình có nên chồng thêm vốn vào quán không?")).toBeNull();
    expect(detectTopic("Mình có nên góp thêm vốn vào quán không?")).toBeNull();
  });

  it("câu công việc giữ nguyên lĩnh vực dù thêm chữ `cuối`", () => {
    expect(detectTopic("Mình có nên nộp đơn nghỉ việc không?")).toBe("work");
    expect(detectTopic("Cuối tháng này mình có nên nộp đơn nghỉ việc không?")).toBe("work");
  });

  /* Câu này có "dự án" nên `work` mới đúng; trước đây `love` chen lên trước chỉ
     vì `cuối` bỏ dấu ra `cuoi` rồi khớp `cưới`. */
  it("`cuối cùng` không kéo câu dự án sang tình cảm", () => {
    expect(detectTopic("Dự án này tới cuối cùng có xong không?")).toBe("work");
  });

  it.each([
    ["cười", "Sao dạo này mình hay cười một mình"],
    ["chống", "Mình nên chống lại ý kiến đó không"],
    ["vỡ", "Kế hoạch này có bị vỡ không"],
    ["thì", "Nếu mình nghỉ thì sao"],
    ["tiến", "Mình có tiến bộ hơn không"],
    ["tiên", "Chuyện này như chuyện cổ tiên"],
    ["lượng", "Chất lượng sản phẩm thế nào"],
    ["luồng", "Luồng suy nghĩ của mình"],
    ["buôn", "Mình có nên buôn bán gì không"],
    ["yêu cầu", "Mình có nên đáp ứng yêu cầu đó không"],
  ])("`%s` không bị đọc thành từ khác dấu", (_tu, cau) => {
    expect(detectTopic(cau)).toBeNull();
  });

  /* Chữa lỗi kiểu này dễ chữa quá tay thành câm luôn. */
  it("câu tình cảm thật vẫn ra tình cảm", () => {
    expect(detectTopic("Mình muốn hỏi về chuyện tình cảm với người yêu")).toBe("love");
    expect(detectTopic("Chồng mình dạo này lạnh nhạt, có chuyện gì không")).toBe("love");
    expect(detectTopic("Bao giờ thì mình lấy chồng")).toBe("love");
  });

  it("câu gõ trần không dấu vẫn đọc được, vì lúc đó không còn gì để dựa", () => {
    expect(detectTopic("chuyen tinh cam cua minh ra sao")).toBe("love");
    expect(detectTopic("cong viec cua minh nam toi the nao")).toBe("work");
  });

  /* `\b` của JS không coi `ợ` là chữ, nên `\bvợ\b` câm lặng trên "vợ tôi".
     Ai vá lại mà quên chỗ này sẽ làm mọi từ tận cùng bằng nguyên âm có dấu
     ngừng khớp mà không có lỗi nào báo. */
  it("từ tận cùng bằng nguyên âm có dấu vẫn khớp", () => {
    expect(detectTopic("Vợ tôi dạo này hay giận")).toBe("love");
  });
});

describe("lĩnh vực lệch kéo theo thứ hạng kiểu trải lệch", () => {
  it("thêm `cuối tháng` không được đẩy `Năm lá công việc` tụt hạng", () => {
    const khong = suggest.suggestSpreads("Mình có nên nộp đơn nghỉ việc không?");
    const co = suggest.suggestSpreads("Cuối tháng này mình có nên nộp đơn nghỉ việc không?");

    expect(khong[0].slug).toBe("nam-la-cong-viec");

    /* Câu sau có thêm tín hiệu tháng thật nên "Năm lá tháng tới" lên là đúng,
       nhưng công việc phải còn trong danh sách chứ không rớt xuống đáy. */
    const hangCongViec = co.findIndex((s) => s.slug === "nam-la-cong-viec");
    expect(hangCongViec).toBeGreaterThanOrEqual(0);
    expect(co.find((s) => s.slug === "nam-la-cong-viec")!.score).toBeGreaterThan(5);
  });
});
