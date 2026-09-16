// Sinh bản NHỎ của lá bài cho khách gọi API, đặt trong `thumb/` của từng deck.
//
// Vì sao cần: ảnh gốc là 600x900, trung bình 261KB. Web không quan tâm — nó đi qua
// `next/image` với `sizes` nên Next tự co và tự cache. Nhưng trường `anh` của API trỏ
// THẲNG vào file gốc, nên app nào bày cả cỗ 78 lá một lúc là tải 19MB cho một màn.
// Màn xào bài của Mèo Thu Chi bày đúng 78 lá như thế.
//
// 288x432 là cỡ vừa khít một lá 96pt trên màn @3x, tức cỡ sắc nhất mà máy sắc nhất
// dùng tới. Co thêm nữa thì nhẹ hơn nhưng bắt đầu mờ ở @3x, mà `anh_nho` là trường
// công khai — khách khác có thể vẽ to hơn 96pt.
//
// Chạy lại khi thay ảnh lá, hoặc khi thêm một deck mới:
//   npm run build:card-thumbs
import { readdir, mkdir } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

/** Bề ngang bản nhỏ. Cao thì để sharp tự suy theo tỉ lệ 2:3 của lá. */
const WIDTH = 288;
const THUMB_DIR = "thumb";

const publicDir = path.join(process.cwd(), "public");

// Mọi thư mục deck: `cards` là bộ mặc định, `cards-*` là các bộ thay thế. Quét thay vì
// ghi cứng danh sách, để thêm deck mới không phải sửa file này.
const decks = (await readdir(publicDir, { withFileTypes: true }))
  .filter((e) => e.isDirectory() && (e.name === "cards" || e.name.startsWith("cards-")))
  .map((e) => e.name)
  .sort();

if (!decks.length) {
  console.error("Không thấy thư mục deck nào trong public/ — dừng.");
  process.exit(1);
}

let tong = 0;
for (const deck of decks) {
  const src = path.join(publicDir, deck);
  const out = path.join(src, THUMB_DIR);
  await mkdir(out, { recursive: true });

  const files = (await readdir(src)).filter((f) => f.endsWith(".webp"));
  let bytes = 0;
  for (const f of files) {
    const info = await sharp(path.join(src, f))
      .resize({ width: WIDTH, withoutEnlargement: true })
      .webp({ quality: 82 })
      .toFile(path.join(out, f));
    bytes += info.size;
  }

  tong += files.length;
  const kb = files.length ? Math.round(bytes / files.length / 1024) : 0;
  console.log(
    `${deck}/${THUMB_DIR}: ${files.length} lá, ${Math.round(bytes / 1024)}KB (trung bình ${kb}KB/lá)`,
  );
}

console.log(`đã sinh ${tong} bản nhỏ ở bề ngang ${WIDTH}px`);
