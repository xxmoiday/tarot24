import { afterEach, describe, expect, it } from "vitest";
import { KbService, type ReadingRequest } from "./kb.service.js";

const kb = new KbService();

afterEach(() => {
  delete process.env.WEB_BASE_URL;
  delete process.env.TAROT_CARD_DECK;
  delete process.env.NEXT_PUBLIC_TAROT_CARD_DECK;
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

  it("ảnh lá đổi được sang deck văn hoá Việt Nam và tự fallback lá chưa có", () => {
    process.env.WEB_BASE_URL = "http://localhost:3000/";
    process.env.TAROT_CARD_DECK = "vietnamese-culture";

    const fool = kb.tatCaLa().find((c) => c.id === "major_00")!;
    const magician = kb.tatCaLa().find((c) => c.id === "major_01")!;
    const highPriestess = kb.tatCaLa().find((c) => c.id === "major_02")!;
    const empress = kb.tatCaLa().find((c) => c.id === "major_03")!;
    const emperor = kb.tatCaLa().find((c) => c.id === "major_04")!;
    const hierophant = kb.tatCaLa().find((c) => c.id === "major_05")!;
    const lovers = kb.tatCaLa().find((c) => c.id === "major_06")!;
    const chariot = kb.tatCaLa().find((c) => c.id === "major_07")!;
    const strength = kb.tatCaLa().find((c) => c.id === "major_08")!;
    const hermit = kb.tatCaLa().find((c) => c.id === "major_09")!;
    const wheel = kb.tatCaLa().find((c) => c.id === "major_10")!;
    const justice = kb.tatCaLa().find((c) => c.id === "major_11")!;
    const hangedMan = kb.tatCaLa().find((c) => c.id === "major_12")!;
    const death = kb.tatCaLa().find((c) => c.id === "major_13")!;
    const temperance = kb.tatCaLa().find((c) => c.id === "major_14")!;
    const devil = kb.tatCaLa().find((c) => c.id === "major_15")!;
    const tower = kb.tatCaLa().find((c) => c.id === "major_16")!;
    const star = kb.tatCaLa().find((c) => c.id === "major_17")!;
    const moon = kb.tatCaLa().find((c) => c.id === "major_18")!;
    const sun = kb.tatCaLa().find((c) => c.id === "major_19")!;
    const judgement = kb.tatCaLa().find((c) => c.id === "major_20")!;
    const world = kb.tatCaLa().find((c) => c.id === "major_21")!;
    const aceOfWands = kb.tatCaLa().find((c) => c.id === "wand_01")!;
    const twoOfWands = kb.tatCaLa().find((c) => c.id === "wand_02")!;
    const threeOfWands = kb.tatCaLa().find((c) => c.id === "wand_03")!;
    const fourOfWands = kb.tatCaLa().find((c) => c.id === "wand_04")!;
    const fiveOfWands = kb.tatCaLa().find((c) => c.id === "wand_05")!;

    expect(fool.anh).toBe("http://localhost:3000/cards-vietnamese-culture/major_00.webp");
    expect(magician.anh).toBe("http://localhost:3000/cards-vietnamese-culture/major_01.webp");
    expect(highPriestess.anh).toBe(
      "http://localhost:3000/cards-vietnamese-culture/major_02.webp",
    );
    expect(empress.anh).toBe("http://localhost:3000/cards-vietnamese-culture/major_03.webp");
    expect(emperor.anh).toBe("http://localhost:3000/cards-vietnamese-culture/major_04.webp");
    expect(hierophant.anh).toBe("http://localhost:3000/cards-vietnamese-culture/major_05.webp");
    expect(lovers.anh).toBe("http://localhost:3000/cards-vietnamese-culture/major_06.webp");
    expect(chariot.anh).toBe("http://localhost:3000/cards-vietnamese-culture/major_07.webp");
    expect(strength.anh).toBe("http://localhost:3000/cards-vietnamese-culture/major_08.webp");
    expect(hermit.anh).toBe("http://localhost:3000/cards-vietnamese-culture/major_09.webp");
    expect(wheel.anh).toBe("http://localhost:3000/cards-vietnamese-culture/major_10.webp");
    expect(justice.anh).toBe("http://localhost:3000/cards-vietnamese-culture/major_11.webp");
    expect(hangedMan.anh).toBe(
      "http://localhost:3000/cards-vietnamese-culture/major_12.webp",
    );
    expect(death.anh).toBe("http://localhost:3000/cards-vietnamese-culture/major_13.webp");
    expect(temperance.anh).toBe(
      "http://localhost:3000/cards-vietnamese-culture/major_14.webp",
    );
    expect(devil.anh).toBe("http://localhost:3000/cards-vietnamese-culture/major_15.webp");
    expect(tower.anh).toBe("http://localhost:3000/cards-vietnamese-culture/major_16.webp");
    expect(star.anh).toBe("http://localhost:3000/cards-vietnamese-culture/major_17.webp");
    expect(moon.anh).toBe("http://localhost:3000/cards-vietnamese-culture/major_18.webp");
    expect(sun.anh).toBe("http://localhost:3000/cards-vietnamese-culture/major_19.webp");
    expect(judgement.anh).toBe(
      "http://localhost:3000/cards-vietnamese-culture/major_20.webp",
    );
    expect(world.anh).toBe("http://localhost:3000/cards-vietnamese-culture/major_21.webp");
    expect(aceOfWands.anh).toBe("http://localhost:3000/cards-vietnamese-culture/wand_01.webp");
    expect(twoOfWands.anh).toBe(
      "http://localhost:3000/cards-vietnamese-culture/wand_02.webp",
    );
    expect(threeOfWands.anh).toBe(
      "http://localhost:3000/cards-vietnamese-culture/wand_03.webp",
    );
    expect(fourOfWands.anh).toBe(
      "http://localhost:3000/cards-vietnamese-culture/wand_04.webp",
    );
    expect(fiveOfWands.anh).toBe("http://localhost:3000/cards/wand_05.webp");
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

/** Một lượt năm lá đủ dùng cho cả ba đường dựng prompt. */
const luot: ReadingRequest = {
  spreadSlug: "nam-la-tinh-cam",
  question: "Em với người này lửng lơ mãi, có nên nói rõ lòng mình không?",
  topic: "love",
  cards: [
    { slug: "hai-coc", reversed: false },
    { slug: "bay-coc", reversed: false },
    { slug: "hiep-si-coc", reversed: false },
    { slug: "tam-kiem", reversed: true },
    { slug: "ngoi-sao", reversed: false },
  ],
  guard: null,
};

const KHUON = "Trả về đúng một khối JSON";

describe("khuôn đầu ra chỉ thuộc lượt luận bài", () => {
  it("lượt luận bài mang khuôn JSON và khung độ dài của kiểu trải", () => {
    const gop = kb.buildMessages(luot).map((m) => m.content).join("\n");
    expect(gop).toContain(KHUON);
    expect(gop).toContain("dài 280–380 tiếng");
  });

  /* Hai đường này đòi văn xuôi 60–120 tiếng. Trước đây chúng dùng lại nguyên
     message ngữ cảnh của bài luận, nên cùng một prompt vừa đòi "đúng một khối
     JSON" vừa đòi "không JSON", lại mang hai khung độ dài lệch nhau. */
  it("câu hỏi thêm không mang khuôn JSON lẫn khung của bài luận", () => {
    const msg = kb.buildFollowUpMessages(luot, "Bài đã luận.", "Còn chuyện tiền thì sao");
    const gop = msg.map((m) => m.content).join("\n");
    expect(gop).not.toContain(KHUON);
    expect(gop).not.toContain("dài 280–380 tiếng");
    expect(msg.at(-1)!.content).toContain("không JSON");
  });

  it("lá làm rõ cũng vậy", () => {
    const msg = kb.buildClarifierMessages(luot, "Bài đã luận.", 4, {
      slug: "ba-coc",
      reversed: false,
    });
    const gop = msg.map((m) => m.content).join("\n");
    expect(gop).not.toContain(KHUON);
    expect(gop).not.toContain("dài 280–380 tiếng");
    expect(msg.at(-1)!.content).toContain("không JSON");
  });

  /* Anthropic đòi message đầu tiên mang vai người dùng, nên lượt hỏi của người
     rút phải còn nguyên ở cả ba đường, đứng trước mọi lượt của trợ lý. */
  it("cả ba đường đều để lượt người dùng đứng trước lượt trợ lý", () => {
    const duong = [
      kb.buildMessages(luot),
      kb.buildFollowUpMessages(luot, "Bài đã luận.", "Còn chuyện tiền thì sao"),
      kb.buildClarifierMessages(luot, "Bài đã luận.", 4, { slug: "ba-coc", reversed: false }),
    ];
    for (const msg of duong) {
      const ngoaiSystem = msg.filter((m) => m.role !== "system");
      expect(ngoaiSystem[0].role).toBe("user");
      expect(msg.at(-1)!.role).toBe("user");
    }
  });

  it("câu chạm chủ đề cấm thì ngữ cảnh bật chu_de_cam", () => {
    const cam = { ...luot, guard: { kind: "death" as const, label: "", hint: "", notice: "" } };
    const gop = kb.buildFollowUpMessages(cam, "Bài đã luận.", "x").map((m) => m.content).join("\n");
    expect(gop).toContain('"chu_de_cam": true');
  });
});

describe("bài mẫu few-shot", () => {
  /* Khối ngữ cảnh với năm lá thật nằm ngay trên cặp hỏi–đáp mẫu, nên không nói
     rõ thì bài mẫu đọc như thể đang luận chính bàn bài này. */
  it("có nhãn đứng trước, nói rõ lá trong mẫu không thuộc lượt này", () => {
    const msg = kb.buildMessages(luot);
    const i = msg.findIndex((m) => m.content.includes("Ngay sau đây là một bài mẫu"));
    expect(i).toBeGreaterThan(-1);
    expect(msg[i].role).toBe("system");
    expect(msg[i].content).toContain("không nằm trên bàn của lượt này");
    /* Nhãn phải đi trước cặp mẫu, và cặp mẫu vẫn là user rồi assistant. */
    expect(msg[i + 1].role).toBe("user");
    expect(msg[i + 2].role).toBe("assistant");
    expect(msg[i + 1].content).toBe(
      "Yêu nhau hai năm, dạo này lạnh nhạt, mối này có đi tiếp được không",
    );
  });

  const CAM = { kind: "legal" as const, label: "", hint: "", notice: "" };

  it("câu chạm chủ đề cấm thì lấy mẫu chuyển hướng, không lấy mẫu thường", () => {
    const msg = kb.buildMessages({ ...luot, guard: CAM });
    const hoi = msg.filter((m) => m.role === "user");
    expect(hoi[0].content).toBe("Anh ấy có đang có người khác không");
  });

  /* Rơi về mẫu thường là đặt một bài kết luận thẳng cộng việc cụ thể ngay
     trước câu mà mục 5 cấm kết luận. Thà đi tay không. */
  it("kiểu trải chưa có mẫu chuyển hướng thì lượt cấm đi tay không", () => {
    const msg = kb.buildMessages({
      spreadSlug: "bon-la-tien-bac",
      question: "Có nên dồn tiền mua vàng lúc này không",
      topic: "money",
      cards: [
        { slug: "hai-coc", reversed: false },
        { slug: "bay-coc", reversed: false },
        { slug: "hiep-si-coc", reversed: false },
        { slug: "tam-kiem", reversed: true },
      ],
      guard: CAM,
    });
    expect(msg).toHaveLength(3);
    expect(msg.filter((m) => m.role === "assistant")).toHaveLength(0);
  });

  /* Khuôn đầu ra đi mọi lượt luận bài, kể cả lượt không kèm mẫu nào; đoạn dặn
     về bài mẫu nằm trong đó là dặn về một thứ không có mặt. */
  it("trải ba lá không kèm mẫu thì cũng không nhắc tới bài mẫu", () => {
    const msg = kb.buildMessages({
      spreadSlug: "ba-la-thoi-gian",
      question: "Chuyện học hành của em rồi ra sao",
      topic: "study",
      cards: [
        { slug: "ba-coc", reversed: false },
        { slug: "tam-kiem", reversed: true },
        { slug: "ngoi-sao", reversed: false },
      ],
      guard: null,
    });
    expect(msg).toHaveLength(3);
    expect(msg.map((m) => m.content).join("\n")).not.toContain("bài mẫu");
  });
});
