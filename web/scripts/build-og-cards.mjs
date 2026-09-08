// Sinh bản JPEG nhỏ của 78 lá cho ảnh OG.
// Satori trong next/og không đọc được webp, và public/ không nằm trong bundle
// của serverless function, nên phải có bản riêng đi kèm mã nguồn.
// Chạy lại khi thay ảnh lá: npm run build:og-cards
import { readdir, mkdir } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const src = path.join(process.cwd(), "public", "cards");
const out = path.join(process.cwd(), "data", "og-cards");
await mkdir(out, { recursive: true });

const files = (await readdir(src)).filter((f) => f.endsWith(".webp"));
let n = 0;
for (const f of files) {
  const id = f.replace(/\.webp$/, "");
  await sharp(path.join(src, f))
    .resize({ width: 340 })
    .jpeg({ quality: 76, progressive: false })
    .toFile(path.join(out, `${id}.jpg`));
  n++;
}
console.log(`đã sinh ${n} ảnh JPEG cho OG trong data/og-cards`);
