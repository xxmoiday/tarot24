import { beforeEach, describe, expect, it } from "vitest";
import { KbService } from "../kb/kb.service.js";
import { ReadingsService } from "./readings.service.js";
import { encodeReading } from "./share.js";
import type { StoredReading } from "./readings.repository.js";

const ID = encodeReading({
  spread: "nam-la-tinh-cam",
  /* Câu gốc không chạm chủ đề nào bài phải tránh. */
  question: "Em với người này lửng lơ mãi, mối này đang đi về đâu",
  topic: "love",
  cards: [
    { slug: "hai-coc", reversed: false },
    { slug: "bay-coc", reversed: false },
    { slug: "hiep-si-coc", reversed: false },
    { slug: "tam-kiem", reversed: true },
    { slug: "ngoi-sao", reversed: false },
  ],
  at: 1_700_000_000_000,
});

const LUU: StoredReading = {
  id: ID,
  essay: "Bài đã luận xong từ trước.",
  parts: null,
  provider: "deepseek",
  model: "deepseek-chat",
  createdAt: "2026-01-01T00:00:00.000Z",
  followUps: [],
  clarifiers: [],
};

/** Bài chuyển hướng theo mục 5 và mục 8: không kết luận, không nghiêng về đâu. */
const CHUYEN_HUONG =
  "Chuyện này mình không đọc bằng bài, và mình không muốn bạn ngồi một mình với nó lúc này. " +
  "Bạn nói với một người thật càng sớm càng tốt, người trong nhà hay một người bạn tin, hoặc người có chuyên môn. " +
  "Bài chỉ nói được bạn đang mang chuyện này với tâm thế nào, chứ không nói được gì về chuyện kia. " +
  "Nếu bạn muốn, mình quay lại phần bàn bài đang nói về chỗ bạn đang cạn sức và việc nhỏ trong tầm tay.";

/** Bài thường cho câu hỏi đóng: có nghiêng về một phía như luật 1 đòi. */
const CO_NGHIENG =
  "Bàn bài đang nghiêng về nói trước, và nói gọn một câu về chỗ bạn đang mong gì ở mối này. " +
  "Tuần này chọn một buổi hai người đang dễ thở, nói đúng cái bạn cần, không kể lại chuyện cũ, " +
  "không hỏi người ấy nghĩ gì về tương lai. Nếu người ấy đáp lại bằng một câu thật thì cứ đi tiếp " +
  "theo nhịp đó, còn nếu chỉ ậm ừ cho qua thì thôi gồng một mình.";

let goi: { role: string; content: string }[][];

function dungService(traLoi: string) {
  goi = [];
  const llm = {
    hasProvider: () => true,
    chat: async (messages: { role: string; content: string }[]) => {
      goi.push(messages);
      return { text: traLoi, provider: "deepseek", model: "deepseek-chat" };
    },
  };
  const budget = { con: () => true, ghiNhan: () => {} };
  const repo = {
    find: async () => LUU,
    appendFollowUp: async () => LUU,
  };
  return new ReadingsService(new KbService(), llm as any, budget as any, repo as any);
}

beforeEach(() => {
  goi = [];
});

describe("guard cho câu hỏi thêm", () => {
  /* Guard vốn chỉ dò câu hỏi gốc nằm trong mã bài đọc, nên chủ đề cấm xuất
     hiện lần đầu ở lượt hỏi thêm thì đi qua mà không ai chặn. */
  it("dò lại trên chính câu hỏi thêm, không chỉ câu hỏi gốc", async () => {
    const svc = dungService(CHUYEN_HUONG);
    const out = await svc.followUp(ID, "Em chán sống lắm, có nên nói với gia đình không");

    expect(out.kind).toBe("ok");
    const gop = goi[0].map((m) => m.content).join("\n");
    expect(gop).toContain('"chu_de_cam": true');
    /* Chủ đề cấm thì luật 1 tắt, nên bài không nghiêng về đâu vẫn đạt và
       không phải gọi lại lần hai. */
    expect(goi).toHaveLength(1);
  });

  it("câu hỏi thêm sạch thì không bật chu_de_cam", async () => {
    const svc = dungService(CO_NGHIENG);
    const out = await svc.followUp(ID, "Em có nên nói trước không");

    expect(out.kind).toBe("ok");
    const gop = goi[0].map((m) => m.content).join("\n");
    expect(gop).not.toContain("chu_de_cam");
    expect(goi).toHaveLength(1);
  });

  /* Cùng câu hỏi chạm chủ đề cấm, nhưng bài trả về lại kết luận: soát vẫn phải
     bắt, tức guard không phải cái công tắc tắt hết mọi luật. */
  it("vẫn soát bài chuyển hướng, không phải bỏ qua hết", async () => {
    const svc = dungService("Không sao đâu, rồi sẽ ổn cả thôi.");
    await svc.followUp(ID, "Em chán sống lắm, có nên nói với gia đình không");
    expect(goi).toHaveLength(2);
  });
});

/* Mã bài đọc nằm ngay trên đường dẫn nên sửa tay được. Lá tra không ra trước
   đây bị lặng lẽ bỏ khỏi ngữ cảnh, để lại một bàn thiếu lá mà prompt vẫn đòi
   đủ số vị trí. */
describe("soát bàn bài trong mã bài đọc", () => {
  const NAM = [
    { slug: "hai-coc", reversed: false },
    { slug: "bay-coc", reversed: false },
    { slug: "hiep-si-coc", reversed: false },
    { slug: "tam-kiem", reversed: true },
    { slug: "ngoi-sao", reversed: false },
  ];
  const ma = (cards: typeof NAM) =>
    encodeReading({
      spread: "nam-la-tinh-cam",
      question: "Mối này rồi đi về đâu",
      topic: "love",
      cards,
      at: 1_700_000_000_000,
    });

  it("lá không tra được thì trả bad-id, không gọi mô hình", async () => {
    const svc = dungService(CO_NGHIENG);
    const out = await svc.followUp(
      ma([...NAM.slice(0, 4), { slug: "la-khong-co-that", reversed: false }]),
      "Em có nên nói trước không",
    );
    expect(out.kind).toBe("bad-id");
    expect(goi).toHaveLength(0);
  });

  it("bàn thiếu lá so với số vị trí cũng trả bad-id", async () => {
    const svc = dungService(CO_NGHIENG);
    const out = await svc.followUp(ma(NAM.slice(0, 4)), "Em có nên nói trước không");
    expect(out.kind).toBe("bad-id");
    expect(goi).toHaveLength(0);
  });

  it("bàn đủ và tra được thì vẫn đi tiếp như thường", async () => {
    const svc = dungService(CO_NGHIENG);
    const out = await svc.followUp(ma(NAM), "Em có nên nói trước không");
    expect(out.kind).toBe("ok");
    expect(goi).toHaveLength(1);
  });
});
