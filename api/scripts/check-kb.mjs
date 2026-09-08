// Báo động nếu dữ liệu KB của api lệch với nguồn bên web.
// Cùng bảng nguồn với sync-kb.mjs; lệch thì chạy `npm run sync:kb`.
import { readFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";

const here = new URL("./", import.meta.url);
const nguon = {
  "cards.source.json": new URL("../../web/data/cards.source.json", here),
  "spreads.source.json": new URL("../../web/data/spreads.source.json", here),
  "system_luan_bai.md": new URL("../../web/resources/kb/prompts/system_luan_bai.md", here),
};

if (!existsSync(fileURLToPath(Object.values(nguon)[0]))) {
  console.log("  bỏ qua check:kb — không thấy web/ để đối chiếu");
  process.exit(0);
}

const tom = async (p) => createHash("sha256").update(await readFile(p)).digest("hex").slice(0, 12);
let lech = 0;
for (const [ten, tu] of Object.entries(nguon)) {
  const a = await tom(new URL(`../data/${ten}`, here));
  const b = await tom(tu);
  if (a !== b) lech++;
  console.log(`  ${a === b ? "khớp" : "LỆCH"}  ${ten}  api=${a} web=${b}`);
}
console.log(lech ? `\n${lech} tệp lệch, chạy npm run sync:kb` : "\nKB của api khớp nguồn bên web");
if (lech) process.exitCode = 1;
