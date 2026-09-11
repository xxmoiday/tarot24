import { describe, expect, it } from "vitest";
import type { ReadingParts } from "./parse.js";
import rawSpreads from "../../data/spreads.source.json" with { type: "json" };
import { detectGuard } from "./guard.js";
import { checkEssay, countWords, laCauHoiDong } from "./validate.js";

interface RawSpread {
  id: string;
  vi_tri: unknown[];
  do_dai: { min: number; max: number };
  vi_du?: {
    cau_hoi: string;
    ghi_chu?: string;
    parts?: { toan_canh: string; theo_vi_tri: { stt: number; doan: string }[]; ket: string };
  }[];
}

const KHUNG = { min: 280, max: 380 };

/** Bài sạch, đủ dài để không dính luật độ dài, dùng làm nền cho từng ca. */
function bai(over: Partial<ReadingParts> = {}): ReadingParts {
  const nen = "Chuyện này neo vào lịch một tuần của bạn chứ không vào cảm giác. ";
  return {
    toanCanh: "Bàn này nặng vừa và đang chuyển. " + nen.repeat(5),
    theoViTri: [
      { stt: 1, doan: "Chỗ đứng của bạn đang bị chia ra quá nhiều đầu mối. " + nen.repeat(5) },
      { stt: 2, doan: "Cái vốn là bạn chưa bị dồn vào một cửa duy nhất. " + nen.repeat(5) },
      { stt: 3, doan: "Cái cản là sự nửa vời quanh lớp dạy. " + nen.repeat(5) },
    ],
    ket:
      "Nghiêng về giảm mạnh chứ không bỏ hẳn. Trong bảy ngày tới kẻ ra lịch thật của một tuần. " +
      "Nếu tìm được một khung trống thì giữ đúng khung đó, không tìm ra thì dừng.",
    ...over,
  };
}

const phang = (p: ReadingParts) =>
  [p.toanCanh, ...p.theoViTri.map((x) => x.doan), p.ket].join("\n\n");

function soat(p: ReadingParts, question: string, guard = false) {
  return checkEssay(phang(p), KHUNG, { question, parts: p, guard });
}

const CO_LUAT = (v: { rule: string }[], rule: string) => v.some((x) => x.rule === rule);

describe("laCauHoiDong", () => {
  it("bắt được các dạng câu hỏi đóng", () => {
    for (const q of [
      "bận đi làm trở lại, bận chăm con, có nên dạy thêm tại nhà nữa không?",
      "Nên nhận offer bên kia hay ở lại chỗ cũ",
      "Mối này có đi tiếp được không",
      "Có đáng bỏ hai năm nữa vào chỗ này không",
      "Nói thẳng hay thôi",
    ]) {
      expect(laCauHoiDong(q), q).toBe(true);
    }
  });

  it("không bắt câu hỏi mở", () => {
    for (const q of [
      "Tháng tới của mình thế nào",
      "Lương ổn mà cuối tháng vẫn hết tiền, mình sai ở đâu",
      "Chuyện với người đó rồi ra sao",
      "",
    ]) {
      expect(laCauHoiDong(q), q).toBe(false);
    }
  });
});

describe("checkEssay, luật 1", () => {
  const HOI = "Có nên dạy thêm tại nhà nữa không";

  it("bài mẫu đạt chuẩn thì sạch", () => {
    expect(soat(bai(), HOI)).toEqual([]);
  });

  it("bắt đoạn kết không nghiêng về phía nào", () => {
    const v = soat(bai({ ket: "Bài cho thấy nhiều thứ. Nếu bạn thấy hợp thì làm." }), HOI);
    expect(CO_LUAT(v, "luật 1")).toBe(true);
  });

  it("bắt đoạn kết thiếu điều kiện nếu... thì", () => {
    const v = soat(bai({ ket: "Nghiêng về giảm mạnh chứ không bỏ hẳn. Tuần này kẻ lịch ra." }), HOI);
    expect(v.filter((x) => x.rule === "luật 1")).toHaveLength(1);
  });

  it("bắt câu kết bỏ lửng", () => {
    const v = soat(
      bai({ ket: "Nghiêng về chỗ chưa nên quyết vội, nếu rõ hơn thì hẵng chọn. Tùy bạn." }),
      HOI,
    );
    expect(v.filter((x) => x.rule === "luật 1").length).toBeGreaterThanOrEqual(2);
  });

  it("không đòi nghiêng khi câu hỏi mở", () => {
    const v = soat(bai({ ket: "Tuần này ngồi ghi lại từng khoản chi trong hai tuần." }), "Tháng tới thế nào");
    expect(CO_LUAT(v, "luật 1")).toBe(false);
  });

  it("trải một lá thì kết luận nằm ở câu đầu, không đòi nếu... thì ở cuối", () => {
    const mot: ReadingParts = {
      toanCanh: "Bài nghiêng về có, lá nhẹ và đang chuyển. " + "Chuyện này nằm trong tầm tay bạn. ".repeat(6),
      theoViTri: [{ stt: 1, doan: "Ba Cốc là lúc người ta chịu mở lời với nhau. ".repeat(6) }],
      ket: "Vậy nhắn trước được. Soạn một tin ba dòng, xoá mọi câu đòi hồi âm, rồi gửi lúc bạn đang vui sẵn.",
    };
    expect(checkEssay(phang(mot), { min: 120, max: 180 }, {
      question: "Mình có nên nhắn trước không",
      parts: mot,
    })).toEqual([]);
  });

  it("không đòi nghiêng khi câu chạm chủ đề cấm", () => {
    const v = soat(
      bai({ ket: "Chuyện xuống tiền thì bài không trả lời được câu hỏi đó. Hỏi người có chuyên môn." }),
      "Có nên mua mảnh đất này không",
      true,
    );
    expect(CO_LUAT(v, "luật 1")).toBe(false);
    expect(CO_LUAT(v, "luật 6")).toBe(false);
  });
});

describe("checkEssay, luật 2, 5 và 6", () => {
  it("cho một vị trí nói ý mơ hồ, bắt từ vị trí thứ hai", () => {
    const mot = bai();
    mot.theoViTri[0].doan = "Chỗ đứng của bạn còn mờ. " + mot.theoViTri[0].doan;
    expect(CO_LUAT(soat(mot, "Tháng tới thế nào"), "luật 2")).toBe(false);

    const hai = bai();
    hai.theoViTri[0].doan = "Chỗ đứng của bạn còn mờ. " + hai.theoViTri[0].doan;
    hai.theoViTri[1].doan = "Bạn vẫn chưa chọn được ngả nào. " + hai.theoViTri[1].doan;
    expect(CO_LUAT(soat(hai, "Tháng tới thế nào"), "luật 2")).toBe(true);
  });

  it("bắt chữ phán về phẩm chất người hỏi", () => {
    const p = bai();
    p.theoViTri[0].doan = "Bạn đang làm việc xoàng, qua loa. " + p.theoViTri[0].doan;
    expect(soat(p, "Tháng tới thế nào").filter((x) => x.rule === "luật 5")).toHaveLength(2);
  });

  it("không nhầm lưỡi kiếm thành lười", () => {
    const p = bai();
    p.theoViTri[0].doan = "Mười lưỡi kiếm cắm sau lưng người trong lá. " + p.theoViTri[0].doan;
    expect(CO_LUAT(soat(p, "Tháng tới thế nào"), "luật 5")).toBe(false);
  });

  it("bắt câu mở nói trước chỗ nghiêng", () => {
    const p = bai();
    p.toanCanh = "Bàn này nghiêng về phía dừng lại. " + p.toanCanh;
    const v = soat(p, "Có nên giữ không");
    expect(v.some((x) => x.rule === "luật 6" && x.detail.includes("tiết lộ"))).toBe(true);
  });

  it("bắt câu mở nhại lại chữ của câu chốt", () => {
    const p = bai({
      ket: "Nghiêng về thu gọn xuống mức tối thiểu chứ không giữ nguyên như cũ. Nếu tìm được khung trống thì giữ, không thì dừng.",
    });
    p.toanCanh = "Chuyện này chưa sụp đổ nhưng cũng không thể giữ nguyên như cũ. " + p.toanCanh;
    const v = soat(p, "Có nên giữ không");
    expect(v.some((x) => x.rule === "luật 6" && x.detail.includes("giữ nguyên như cũ"))).toBe(true);
  });

  it("trải một lá được phép nói chỗ nghiêng ngay câu mở", () => {
    const mot: ReadingParts = {
      toanCanh: "Bài nghiêng về có. " + "Chuyện này nằm trong tầm tay bạn. ".repeat(6),
      theoViTri: [{ stt: 1, doan: "Ba Cốc là lúc người ta chịu mở lời. ".repeat(6) }],
      ket: "Vậy nhắn trước được. Soạn một tin ba dòng rồi gửi lúc bạn đang vui sẵn.",
    };
    expect(checkEssay(phang(mot), { min: 120, max: 180 }, {
      question: "Mình có nên nhắn trước không",
      parts: mot,
    })).toEqual([]);
  });

  it("trần độ dài chỉ nới 5%, bài vượt trần cũ chưa tới thì nay vẫn bị bắt", () => {
    const p = bai();
    p.theoViTri[2].doan += "Thêm chữ cho bài dài quá trần. ".repeat(8);
    /* Nằm giữa trần mới 399 và trần cũ 436, tức ca này chỉ đỏ nhờ lần siết. */
    const n = countWords(phang(p));
    expect(n).toBeGreaterThan(380 * 1.05);
    expect(n).toBeLessThan(380 * 1.15);
    const v = soat(p, "Tháng tới thế nào");
    expect(v.some((x) => x.rule === "mục 6" && x.detail.includes("cắt xuống"))).toBe(true);
  });

  /* Đầu kia của luật 6: vị trí cuối viết thành đoạn kết thu nhỏ rồi đoạn kết
     chỉ còn nhại lại nó. */
  it("bắt đoạn kết nhại lại vị trí cuối", () => {
    const p = bai({
      ket: "Nghiêng về thu gọn xuống mức tối thiểu chứ không bỏ hẳn. Trong bảy ngày tới kẻ ra lịch thật. Nếu tìm được khung trống thì giữ, không thì dừng.",
    });
    p.theoViTri.at(-1)!.doan += " Hướng đi là thu gọn xuống mức tối thiểu chứ không bỏ hẳn.";
    const v = soat(p, "Có nên giữ không");
    expect(v.some((x) => x.rule === "luật 2" && x.detail.includes("vị trí cuối"))).toBe(true);
  });

  /* Vị trí cuối được KB dặn nói "nếu giữ đà này", đoạn kết thì luật 7 bắt phải
     có "nếu... thì". Hai câu ấy chạm nhau năm tiếng đầu là chuyện thường. */
  it("không bắt oan chỗ hai bên cùng mở bằng nếu giữ đà này thì", () => {
    const p = bai({
      ket: "Nghiêng về giữ. Trong bảy ngày tới nhắn một câu thật. Nếu giữ đà này thì tuần sau đã dễ thở hơn.",
    });
    p.theoViTri.at(-1)!.doan += " Nếu giữ đà này thì chuyện còn đi tiếp được một quãng nữa.";
    expect(CO_LUAT(soat(p, "Có nên giữ không"), "luật 2")).toBe(false);
  });

  it("bắt câu bình luận về chính bài đọc", () => {
    const p = bai({ ket: "Bài này không trả lời thẳng được. Nghiêng về giữ, nếu khó thì dừng." });
    expect(CO_LUAT(soat(p, "Có nên giữ không"), "luật 6")).toBe(true);
  });
});

/*
  Bài mẫu là thứ mô hình bắt chước, nên mẫu vi phạm là dạy sai. Ca này chặn
  việc thêm một bài mẫu né câu hỏi hay lặp ý vào KB.
*/
describe("bài mẫu trong KB", () => {
  const spreads = (rawSpreads as { spreads: RawSpread[] }).spreads;
  const coParts = spreads.flatMap((s) =>
    (s.vi_du ?? [])
      .filter((v) => v.parts)
      .map((v, i) => ({ ten: `${s.id}[${i}]`, spread: s, v })),
  );

  it("có ít nhất một mẫu cho mỗi kiểu trải bốn tới năm lá", () => {
    const thieu = spreads
      .filter((s) => s.vi_tri.length >= 4 && s.vi_tri.length <= 5)
      .filter((s) => !(s.vi_du ?? []).some((v) => v.parts && !v.ghi_chu))
      .map((s) => s.id);
    expect(thieu).toEqual([]);
  });

  it.each(coParts.map((x) => x.ten))("%s không vi phạm luật nào", (ten) => {
    const { spread, v } = coParts.find((x) => x.ten === ten)!;
    const parts: ReadingParts = {
      toanCanh: v.parts!.toan_canh,
      theoViTri: v.parts!.theo_vi_tri,
      ket: v.parts!.ket,
    };
    const essay = phang(parts);
    const loi = checkEssay(essay, spread.do_dai, {
      question: v.cau_hoi,
      parts,
      guard: !!detectGuard(v.cau_hoi),
    });
    expect(loi.map((x) => `${x.rule}: ${x.detail}`)).toEqual([]);
  });
});

describe("câu hỏi thêm và lá làm rõ", () => {
  const KHUNG = { min: 60, max: 120 };
  const nen = "Cái này nằm ở lịch của bạn chứ không ở lòng ai. ";
  const dai = (mo: string) => mo + nen.repeat(6);

  const soatNgan = (t: string, kieu: "hoi_them" | "lam_ro", q: string) =>
    checkEssay(t, KHUNG, { question: q, kieu });

  it("câu hỏi thêm dạng đóng vẫn phải nghiêng về đâu đó", () => {
    const v = soatNgan(dai("Chuyện này còn tùy nhiều thứ lắm. "), "hoi_them", "vậy có nên nghỉ hẳn không");
    expect(v.some((x) => x.rule === "luật 1")).toBe(true);
  });

  it("nhưng không bắt kèm điều kiện nếu... thì vì bài quá ngắn", () => {
    const v = soatNgan(
      dai("Bài nghiêng về giảm bớt chứ không dừng hẳn. "),
      "hoi_them",
      "vậy có nên nghỉ hẳn không",
    );
    expect(v).toEqual([]);
  });

  it("câu hỏi thêm được nói bài không bao được chuyện đó, theo mục 8", () => {
    const v = soatNgan(
      dai("Bàn bài này nghiêng về chuyện công việc, nó không trả lời được câu hỏi về nhà cửa, muốn rõ thì trải một bàn khác. "),
      "hoi_them",
      "thế còn chuyện mua nhà thì sao, có nên không",
    );
    expect(v.some((x) => x.rule === "luật 6")).toBe(false);
  });

  it("lá làm rõ không phải chỗ trả lời câu hỏi, nên luật 1 không áp dụng", () => {
    const v = soatNgan(
      dai("Lá làm rõ là Ba Gậy, người đứng nhìn thuyền đã rời bến. "),
      "lam_ro",
      "có nên dạy thêm nữa không",
    );
    expect(v).toEqual([]);
  });

  it("lá làm rõ vẫn không được tự bào chữa", () => {
    const v = soatNgan(
      dai("Lá bài không cho biết rõ chuyện này ra sao. "),
      "lam_ro",
      "có nên dạy thêm nữa không",
    );
    expect(v.some((x) => x.rule === "luật 6")).toBe(true);
  });

  it("cả hai đường vẫn dính luật cũ và luật 5", () => {
    const v = soatNgan(
      dai("Bạn nghiêng về chỗ làm qua loa, và chuyện này chắc chắn xong trong tháng. "),
      "hoi_them",
      "có nên nghỉ không",
    );
    expect(v.map((x) => x.rule).sort()).toEqual(["luật 5", "mục 5"]);
  });
});
