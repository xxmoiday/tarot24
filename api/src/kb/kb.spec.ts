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
    const sixOfWands = kb.tatCaLa().find((c) => c.id === "wand_06")!;
    const sevenOfWands = kb.tatCaLa().find((c) => c.id === "wand_07")!;
    const eightOfWands = kb.tatCaLa().find((c) => c.id === "wand_08")!;
    const nineOfWands = kb.tatCaLa().find((c) => c.id === "wand_09")!;
    const tenOfWands = kb.tatCaLa().find((c) => c.id === "wand_10")!;
    const pageOfWands = kb.tatCaLa().find((c) => c.id === "wand_page")!;
    const knightOfWands = kb.tatCaLa().find((c) => c.id === "wand_knight")!;
    const queenOfWands = kb.tatCaLa().find((c) => c.id === "wand_queen")!;
    const kingOfWands = kb.tatCaLa().find((c) => c.id === "wand_king")!;
    const aceOfCups = kb.tatCaLa().find((c) => c.id === "cup_01")!;
    const twoOfCups = kb.tatCaLa().find((c) => c.id === "cup_02")!;
    const threeOfCups = kb.tatCaLa().find((c) => c.id === "cup_03")!;
    const fourOfCups = kb.tatCaLa().find((c) => c.id === "cup_04")!;
    const fiveOfCups = kb.tatCaLa().find((c) => c.id === "cup_05")!;
    const sixOfCups = kb.tatCaLa().find((c) => c.id === "cup_06")!;
    const sevenOfCups = kb.tatCaLa().find((c) => c.id === "cup_07")!;
    const eightOfCups = kb.tatCaLa().find((c) => c.id === "cup_08")!;
    const nineOfCups = kb.tatCaLa().find((c) => c.id === "cup_09")!;
    const tenOfCups = kb.tatCaLa().find((c) => c.id === "cup_10")!;
    const pageOfCups = kb.tatCaLa().find((c) => c.id === "cup_page")!;
    const knightOfCups = kb.tatCaLa().find((c) => c.id === "cup_knight")!;
    const queenOfCups = kb.tatCaLa().find((c) => c.id === "cup_queen")!;
    const kingOfCups = kb.tatCaLa().find((c) => c.id === "cup_king")!;
    const aceOfSwords = kb.tatCaLa().find((c) => c.id === "sword_01")!;
    const twoOfSwords = kb.tatCaLa().find((c) => c.id === "sword_02")!;
    const threeOfSwords = kb.tatCaLa().find((c) => c.id === "sword_03")!;
    const fourOfSwords = kb.tatCaLa().find((c) => c.id === "sword_04")!;
    const fiveOfSwords = kb.tatCaLa().find((c) => c.id === "sword_05")!;
    const sixOfSwords = kb.tatCaLa().find((c) => c.id === "sword_06")!;
    const sevenOfSwords = kb.tatCaLa().find((c) => c.id === "sword_07")!;
    const eightOfSwords = kb.tatCaLa().find((c) => c.id === "sword_08")!;
    const nineOfSwords = kb.tatCaLa().find((c) => c.id === "sword_09")!;
    const tenOfSwords = kb.tatCaLa().find((c) => c.id === "sword_10")!;
    const pageOfSwords = kb.tatCaLa().find((c) => c.id === "sword_page")!;
    const knightOfSwords = kb.tatCaLa().find((c) => c.id === "sword_knight")!;
    const queenOfSwords = kb.tatCaLa().find((c) => c.id === "sword_queen")!;
    const kingOfSwords = kb.tatCaLa().find((c) => c.id === "sword_king")!;
    const aceOfCoins = kb.tatCaLa().find((c) => c.id === "coin_01")!;
    const twoOfCoins = kb.tatCaLa().find((c) => c.id === "coin_02")!;
    const threeOfCoins = kb.tatCaLa().find((c) => c.id === "coin_03")!;
    const fourOfCoins = kb.tatCaLa().find((c) => c.id === "coin_04")!;
    const fiveOfCoins = kb.tatCaLa().find((c) => c.id === "coin_05")!;
    const sixOfCoins = kb.tatCaLa().find((c) => c.id === "coin_06")!;
    const sevenOfCoins = kb.tatCaLa().find((c) => c.id === "coin_07")!;
    const eightOfCoins = kb.tatCaLa().find((c) => c.id === "coin_08")!;
    const nineOfCoins = kb.tatCaLa().find((c) => c.id === "coin_09")!;
    const tenOfCoins = kb.tatCaLa().find((c) => c.id === "coin_10")!;
    const pageOfCoins = kb.tatCaLa().find((c) => c.id === "coin_page")!;
    const knightOfCoins = kb.tatCaLa().find((c) => c.id === "coin_knight")!;
    const queenOfCoins = kb.tatCaLa().find((c) => c.id === "coin_queen")!;
    const kingOfCoins = kb.tatCaLa().find((c) => c.id === "coin_king")!;

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
    expect(fiveOfWands.anh).toBe(
      "http://localhost:3000/cards-vietnamese-culture/wand_05.webp",
    );
    expect(sixOfWands.anh).toBe(
      "http://localhost:3000/cards-vietnamese-culture/wand_06.webp",
    );
    expect(sevenOfWands.anh).toBe(
      "http://localhost:3000/cards-vietnamese-culture/wand_07.webp",
    );
    expect(eightOfWands.anh).toBe(
      "http://localhost:3000/cards-vietnamese-culture/wand_08.webp",
    );
    expect(nineOfWands.anh).toBe(
      "http://localhost:3000/cards-vietnamese-culture/wand_09.webp",
    );
    expect(tenOfWands.anh).toBe("http://localhost:3000/cards-vietnamese-culture/wand_10.webp");
    expect(pageOfWands.anh).toBe(
      "http://localhost:3000/cards-vietnamese-culture/wand_page.webp",
    );
    expect(knightOfWands.anh).toBe(
      "http://localhost:3000/cards-vietnamese-culture/wand_knight.webp",
    );
    expect(queenOfWands.anh).toBe(
      "http://localhost:3000/cards-vietnamese-culture/wand_queen.webp",
    );
    expect(kingOfWands.anh).toBe(
      "http://localhost:3000/cards-vietnamese-culture/wand_king.webp",
    );
    expect(aceOfCups.anh).toBe("http://localhost:3000/cards-vietnamese-culture/cup_01.webp");
    expect(twoOfCups.anh).toBe("http://localhost:3000/cards-vietnamese-culture/cup_02.webp");
    expect(threeOfCups.anh).toBe(
      "http://localhost:3000/cards-vietnamese-culture/cup_03.webp",
    );
    expect(fourOfCups.anh).toBe("http://localhost:3000/cards-vietnamese-culture/cup_04.webp");
    expect(fiveOfCups.anh).toBe("http://localhost:3000/cards-vietnamese-culture/cup_05.webp");
    expect(sixOfCups.anh).toBe("http://localhost:3000/cards-vietnamese-culture/cup_06.webp");
    expect(sevenOfCups.anh).toBe("http://localhost:3000/cards-vietnamese-culture/cup_07.webp");
    expect(eightOfCups.anh).toBe("http://localhost:3000/cards-vietnamese-culture/cup_08.webp");
    expect(nineOfCups.anh).toBe("http://localhost:3000/cards-vietnamese-culture/cup_09.webp");
    expect(tenOfCups.anh).toBe("http://localhost:3000/cards-vietnamese-culture/cup_10.webp");
    expect(pageOfCups.anh).toBe("http://localhost:3000/cards-vietnamese-culture/cup_page.webp");
    expect(knightOfCups.anh).toBe(
      "http://localhost:3000/cards-vietnamese-culture/cup_knight.webp",
    );
    expect(queenOfCups.anh).toBe(
      "http://localhost:3000/cards-vietnamese-culture/cup_queen.webp",
    );
    expect(kingOfCups.anh).toBe("http://localhost:3000/cards-vietnamese-culture/cup_king.webp");
    expect(aceOfSwords.anh).toBe(
      "http://localhost:3000/cards-vietnamese-culture/sword_01.webp",
    );
    expect(twoOfSwords.anh).toBe(
      "http://localhost:3000/cards-vietnamese-culture/sword_02.webp",
    );
    expect(threeOfSwords.anh).toBe(
      "http://localhost:3000/cards-vietnamese-culture/sword_03.webp",
    );
    expect(fourOfSwords.anh).toBe(
      "http://localhost:3000/cards-vietnamese-culture/sword_04.webp",
    );
    expect(fiveOfSwords.anh).toBe(
      "http://localhost:3000/cards-vietnamese-culture/sword_05.webp",
    );
    expect(sixOfSwords.anh).toBe(
      "http://localhost:3000/cards-vietnamese-culture/sword_06.webp",
    );
    expect(sevenOfSwords.anh).toBe(
      "http://localhost:3000/cards-vietnamese-culture/sword_07.webp",
    );
    expect(eightOfSwords.anh).toBe(
      "http://localhost:3000/cards-vietnamese-culture/sword_08.webp",
    );
    expect(nineOfSwords.anh).toBe(
      "http://localhost:3000/cards-vietnamese-culture/sword_09.webp",
    );
    expect(tenOfSwords.anh).toBe(
      "http://localhost:3000/cards-vietnamese-culture/sword_10.webp",
    );
    expect(pageOfSwords.anh).toBe(
      "http://localhost:3000/cards-vietnamese-culture/sword_page.webp",
    );
    expect(knightOfSwords.anh).toBe(
      "http://localhost:3000/cards-vietnamese-culture/sword_knight.webp",
    );
    expect(queenOfSwords.anh).toBe(
      "http://localhost:3000/cards-vietnamese-culture/sword_queen.webp",
    );
    expect(kingOfSwords.anh).toBe(
      "http://localhost:3000/cards-vietnamese-culture/sword_king.webp",
    );
    expect(aceOfCoins.anh).toBe(
      "http://localhost:3000/cards-vietnamese-culture/coin_01.webp",
    );
    expect(twoOfCoins.anh).toBe(
      "http://localhost:3000/cards-vietnamese-culture/coin_02.webp",
    );
    expect(threeOfCoins.anh).toBe(
      "http://localhost:3000/cards-vietnamese-culture/coin_03.webp",
    );
    expect(fourOfCoins.anh).toBe(
      "http://localhost:3000/cards-vietnamese-culture/coin_04.webp",
    );
    expect(fiveOfCoins.anh).toBe(
      "http://localhost:3000/cards-vietnamese-culture/coin_05.webp",
    );
    expect(sixOfCoins.anh).toBe(
      "http://localhost:3000/cards-vietnamese-culture/coin_06.webp",
    );
    expect(sevenOfCoins.anh).toBe(
      "http://localhost:3000/cards-vietnamese-culture/coin_07.webp",
    );
    expect(eightOfCoins.anh).toBe(
      "http://localhost:3000/cards-vietnamese-culture/coin_08.webp",
    );
    expect(nineOfCoins.anh).toBe(
      "http://localhost:3000/cards-vietnamese-culture/coin_09.webp",
    );
    expect(tenOfCoins.anh).toBe(
      "http://localhost:3000/cards-vietnamese-culture/coin_10.webp",
    );
    expect(pageOfCoins.anh).toBe(
      "http://localhost:3000/cards-vietnamese-culture/coin_page.webp",
    );
    expect(knightOfCoins.anh).toBe(
      "http://localhost:3000/cards-vietnamese-culture/coin_knight.webp",
    );
    expect(queenOfCoins.anh).toBe(
      "http://localhost:3000/cards-vietnamese-culture/coin_queen.webp",
    );
    expect(kingOfCoins.anh).toBe(
      "http://localhost:3000/cards-vietnamese-culture/coin_king.webp",
    );
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
