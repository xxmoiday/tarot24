// Đồng bộ dữ liệu KB từ web sang api.
//
// Nguồn duy nhất được commit:
//   web/data/*.source.json                       (bản build của KB)
//   web/resources/kb/prompts/system_luan_bai.md  (bản người viết)
// api/data/ là bản sinh ra, không commit — xem .gitignore ở gốc.
//
// Chạy: npm run sync:kb  (tự chạy trước build và test)
import { copyFile, mkdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";

const here = new URL("./", import.meta.url);
const dich = new URL("../data/", here);
const nguon = {
  "cards.source.json": new URL("../../web/data/cards.source.json", here),
  "spreads.source.json": new URL("../../web/data/spreads.source.json", here),
  "system_luan_bai.md": new URL("../../web/resources/kb/prompts/system_luan_bai.md", here),
};

// Trên VPS chỉ có thư mục api/, không có web/ để chép sang. Bỏ qua thay vì
// làm hỏng `npm run build` lúc triển khai: api/data đã được rsync lên rồi.
if (!existsSync(fileURLToPath(Object.values(nguon)[0]))) {
  console.log("  bỏ qua sync:kb — không thấy web/, giữ nguyên api/data sẵn có");
  process.exit(0);
}

await mkdir(dich, { recursive: true });
for (const [ten, tu] of Object.entries(nguon)) {
  await copyFile(tu, new URL(ten, dich));
  console.log("  đã chép", ten);
}
