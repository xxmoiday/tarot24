import { describe, expect, it } from "vitest";
import { flatten, parseParts } from "./parse.js";

const GOOD = {
  toan_canh: "Bài này đang nói chuyện đi hay ở, và nó nặng hơn bạn tưởng.",
  theo_vi_tri: [
    { stt: 1, doan: "Quá khứ là chỗ bạn đã cố quá lâu." },
    { stt: 2, doan: "Hiện tại thì đang đứng yên chờ một câu trả lời." },
  ],
  ket: "Tuần này ngồi xuống viết ra từng khoản một rồi hỏi thẳng một người.",
};

describe("parseParts", () => {
  it("đọc được JSON trần", () => {
    const p = parseParts(JSON.stringify(GOOD));
    expect(p?.theoViTri).toHaveLength(2);
    expect(p?.ket).toContain("Tuần này");
  });

  it("đọc được JSON bọc trong nháy ba", () => {
    const p = parseParts("```json\n" + JSON.stringify(GOOD) + "\n```");
    expect(p?.toanCanh).toContain("đi hay ở");
  });

  it("đọc được JSON có chữ dặm hai đầu", () => {
    const p = parseParts(`Đây là bài:\n${JSON.stringify(GOOD)}\nMong giúp được bạn.`);
    expect(p?.theoViTri[1].stt).toBe(2);
  });

  it("tự đánh số khi thiếu stt", () => {
    const p = parseParts(
      JSON.stringify({ ...GOOD, theo_vi_tri: [{ doan: "Một." }, { doan: "Hai." }] }),
    );
    expect(p?.theoViTri.map((x) => x.stt)).toEqual([1, 2]);
  });

  it("bỏ đoạn rỗng", () => {
    const p = parseParts(
      JSON.stringify({ ...GOOD, theo_vi_tri: [{ stt: 1, doan: "Một." }, { stt: 2, doan: "  " }] }),
    );
    expect(p?.theoViTri).toHaveLength(1);
  });

  it("trả null khi là văn xuôi thuần", () => {
    expect(parseParts("Bài này nói chuyện đi hay ở. Tuần này bạn nên ngồi xuống.")).toBeNull();
  });

  it("trả null khi JSON hỏng", () => {
    expect(parseParts('{"toan_canh": "a", "ket":')).toBeNull();
  });

  it("trả null khi thiếu câu chốt", () => {
    expect(parseParts(JSON.stringify({ ...GOOD, ket: "" }))).toBeNull();
  });

  it("trả null khi không có đoạn nào theo vị trí", () => {
    expect(parseParts(JSON.stringify({ ...GOOD, theo_vi_tri: [] }))).toBeNull();
  });
});

describe("flatten", () => {
  it("ghép đúng thứ tự đọc, cách nhau một dòng trống", () => {
    const p = parseParts(JSON.stringify(GOOD))!;
    expect(flatten(p).split("\n\n")).toEqual([
      GOOD.toan_canh,
      GOOD.theo_vi_tri[0].doan,
      GOOD.theo_vi_tri[1].doan,
      GOOD.ket,
    ]);
  });

  it("bỏ qua phần toàn cảnh rỗng", () => {
    const p = parseParts(JSON.stringify({ ...GOOD, toan_canh: "" }))!;
    expect(flatten(p).startsWith(GOOD.theo_vi_tri[0].doan)).toBe(true);
  });
});
