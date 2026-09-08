// Đồng bộ dữ liệu KB từ web sang api. Bản trong web là bản gốc.
// Chạy: npm run sync:kb
import { copyFile } from "node:fs/promises";
const files = ["cards.source.json", "spreads.source.json", "system_luan_bai.md"];
for (const f of files) {
  await copyFile(new URL(`../web/data/${f}`, import.meta.url), new URL(`./data/${f}`, import.meta.url));
  console.log("  đã chép", f);
}
