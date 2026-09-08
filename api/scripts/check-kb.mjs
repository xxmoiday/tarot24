// Báo động nếu dữ liệu KB của api lệch với bản gốc bên web.
import { readFile } from "node:fs/promises";
import { createHash } from "node:crypto";
const files = ["cards.source.json", "spreads.source.json", "system_luan_bai.md"];
const sum = async (p) => createHash("sha256").update(await readFile(p)).digest("hex").slice(0, 12);
let bad = 0;
for (const f of files) {
  const a = await sum(new URL(`../data/${f}`, import.meta.url));
  const b = await sum(new URL(`../../web/data/${f}`, import.meta.url));
  const ok = a === b;
  if (!ok) bad++;
  console.log(`  ${ok ? "khớp" : "LỆCH"}  ${f}  api=${a} web=${b}`);
}
console.log(bad ? `\n${bad} tệp lệch, chạy npm run sync:kb` : "\nKB của api khớp bản gốc bên web");
if (bad) process.exitCode = 1;
