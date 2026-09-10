// Sinh bản JPEG 1200x630 của các ảnh cover để dùng cho thẻ og:image.
//
// Facebook, Messenger, Zalo và LinkedIn chỉ nhận JPEG/PNG/GIF cho og:image.
// Cover trong public/ là webp — đẹp và nhẹ cho trình duyệt, nhưng crawler tải
// về rồi bỏ qua, nên link dán vào khung chat ra thẻ trơ không ảnh. Bản webp
// vẫn giữ nguyên cho <Image>; chỉ thẻ og:image trỏ sang bản jpg này.
//
// Chạy lại khi thêm hoặc thay ảnh cover: npm run build:og-covers
import { readdir } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

/** Đúng khổ 1200x630 mà Facebook và Twitter lấy làm chuẩn cho thẻ lớn. */
const SIZE = { width: 1200, height: 630 };

const DIRS = ["hero", "spreads"].map((d) =>
  path.join(process.cwd(), "public", d),
);

let n = 0;
for (const dir of DIRS) {
  const files = (await readdir(dir)).filter((f) => f.endsWith(".webp"));
  for (const f of files) {
    /*
      Ảnh gốc là 1.71–1.78, khổ OG là 1.90, nên chỗ bị cắt là chiều cao và chỉ
      mất khoảng 90–140px. Các ảnh này đều để objectPosition dọc quanh 46–50%
      trong giao diện, tức gần giữa, nên cắt giữa là bám đúng ý thiết kế. Cắt
      theo objectPosition của từng trang thì không làm được: một ảnh dùng lại
      ở nhiều trang với position khác nhau, mà file jpg thì chỉ có một.
    */
    await sharp(path.join(dir, f))
      .resize({ ...SIZE, fit: "cover", position: "centre" })
      .jpeg({ quality: 82, progressive: true, mozjpeg: true })
      .toFile(path.join(dir, f.replace(/\.webp$/, ".jpg")));
    n++;
  }
}
console.log(`đã sinh ${n} ảnh JPEG cho og:image cạnh bản webp`);
