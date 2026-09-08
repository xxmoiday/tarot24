// Gom dữ liệu KB về data/ cho app dùng. Mỗi thứ chỉ có ĐÚNG MỘT bản được commit.
//
//   resources/kb/{cards,spreads}/*.yaml        <- người sửa ở đây
//     -> build.py / build_spreads.py sinh resources/kb/build/*.json  (không commit)
//     -> chép sang data/*.source.json                                (BẢN JSON DUY NHẤT ĐƯỢC COMMIT)
//
//   resources/kb/prompts/system_luan_bai.md    <- người sửa ở đây, bản duy nhất
//     -> chép sang data/system_luan_bai.md                           (không commit)
//        next.config.ts phải truy vết được tệp này cho route /api/reading.
//
// Hai chế độ:
//   --prompt   chỉ dựng lại data/system_luan_bai.md. Đây là thứ `npm run dev`
//              và `npm run build` cần, vì tệp đó không được commit.
//   (mặc định) chép cả JSON từ resources/kb/build/. Chỉ chạy tay ngay sau khi
//              build lại KB bằng Python — nếu để nó chạy tự động thì một thư mục
//              build/ cũ còn sót trên đĩa sẽ ghi đè bản JSON đã commit.
import { copyFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";

const here = new URL("./", import.meta.url);
const chep = async (tu, den) => {
  await copyFile(new URL(tu, here), new URL(den, here));
  console.log(`  ${tu.replace(/^\.\.\//, "")} -> ${den.replace(/^\.\.\//, "")}`);
};

await chep("../resources/kb/prompts/system_luan_bai.md", "../data/system_luan_bai.md");

if (process.argv.includes("--prompt")) process.exit(0);

const build = new URL("../resources/kb/build/", here);
if (!existsSync(fileURLToPath(build))) {
  console.error("  thiếu resources/kb/build/ — chạy build.py và build_spreads.py trước");
  process.exit(1);
}
await chep("../resources/kb/build/cards.json", "../data/cards.source.json");
await chep("../resources/kb/build/spreads.json", "../data/spreads.source.json");
