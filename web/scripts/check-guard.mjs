// Đối chiếu src/lib/guard.ts với api/src/llm/guard.ts.
//
// Bộ từ khoá này buộc phải có hai bản: web cần nó ngay lúc người ta đang gõ
// câu hỏi để hiện câu nhắc, api cần nó lúc dựng prompt. Hai package khác nhau
// nên không import chéo được. Mà đã hai bản thì lệch, và nó lệch thật: mấy cụm
// tự làm hại mình thêm bên api ngày 11/09/2026 không sang web, tức câu nhắc ở
// màn đặt câu hỏi im lặng đúng chỗ cần lên tiếng nhất.
//
// Chạy: npm run check:guard
import { readFileSync } from "node:fs";

const doc = (p) => readFileSync(new URL(p, import.meta.url), "utf8");
const WEB = doc("../src/lib/guard.ts");
const API = doc("../../api/src/llm/guard.ts");

/** Cắt một khối theo tên hằng, tới dấu đóng ở đầu dòng. */
const khoi = (src, ten) => {
  const i = src.indexOf(`const ${ten}`);
  if (i < 0) return null;
  const j = src.indexOf("\n};", i);
  return j < 0 ? null : src.slice(i, j);
};

/** Mọi chuỗi trong khối, bỏ phần trong chú thích. */
const chuoi = (src) =>
  (src ?? "")
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/\/\/.*$/gm, "")
    .match(/"[^"]*"/g)
    ?.map((s) => s.slice(1, -1)) ?? [];

let bad = 0;
const soSanh = (ten, a, b) => {
  const thieuWeb = a.filter((x) => !b.includes(x));
  const thieuApi = b.filter((x) => !a.includes(x));
  if (!thieuWeb.length && !thieuApi.length) return;
  bad++;
  console.log(`\n✗ ${ten}`);
  if (thieuWeb.length) console.log(`   web thiếu : ${thieuWeb.join(", ")}`);
  if (thieuApi.length) console.log(`   api thiếu : ${thieuApi.join(", ")}`);
};

for (const ten of ["KEYWORDS", "NOI_CHO_VUI", "GUARDS"]) {
  const a = khoi(API, ten);
  const b = khoi(WEB, ten);
  if (!a || !b) {
    bad++;
    console.log(`\n✗ ${ten}: không tìm thấy khối ở ${!a ? "api" : "web"}`);
    continue;
  }
  soSanh(ten, chuoi(a), chuoi(b));
}

/* PATTERNS là biểu thức chứ không phải chuỗi, so nguyên văn sau khi bỏ khoảng
   trắng và chú thích. */
const reg = (src) => {
  const i = src.indexOf("const PATTERNS");
  const j = src.indexOf("\n};", i);
  return src
    .slice(i, j)
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/\s+/g, "");
};
if (reg(API) !== reg(WEB)) {
  bad++;
  console.log("\n✗ PATTERNS lệch nhau");
  console.log(`   api: ${reg(API)}`);
  console.log(`   web: ${reg(WEB)}`);
}

console.log(bad ? `\n=== ${bad} chỗ lệch ===` : "\n=== khớp hết ===");
process.exit(bad ? 1 : 0);
