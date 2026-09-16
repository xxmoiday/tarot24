// Mọi lá phải có bản nhỏ, và không bản nhỏ nào được mồ côi.
// Chạy: npm run check:card-thumbs
//
// Vì sao cần một bộ kiểm riêng: API chỉ DỰNG CHUỖI `anh_nho`, nó không mở file bao giờ.
// Nên thêm một lá mới, hay thêm một deck mới, mà quên chạy `build:card-thumbs` thì
// `anh` vẫn đúng còn `anh_nho` trả về một URL 404 — và vì `anh` đúng nên không ai để ý
// cho tới khi một khách gọi API đi hỏi vì sao cỗ bài của họ trống một nửa.
import { readdir, stat } from "node:fs/promises";
import path from "node:path";

const THUMB_DIR = "thumb";
/** Bản nhỏ nặng hơn mốc này thì co hụt — gần như chắc chắn là quên resize. */
const MAX_KB = 80;

const publicDir = path.join(process.cwd(), "public");
const decks = (await readdir(publicDir, { withFileTypes: true }))
  .filter((e) => e.isDirectory() && (e.name === "cards" || e.name.startsWith("cards-")))
  .map((e) => e.name)
  .sort();

let bad = 0;
/**
 * Số chỗ hỏng của DECK đang xét. Tách khỏi `bad` để dòng tổng kết mỗi deck nói đúng:
 * đếm chung thì một deck thiếu ảnh vẫn được in dấu ✓, và dấu ✓ đứng ngay dưới một dấu ✗
 * là thứ làm người đọc tin là đã xong.
 */
let badDeck = 0;
const fail = (msg) => {
  bad++;
  badDeck++;
  console.log(`✗ ${msg}`);
};

for (const deck of decks) {
  badDeck = 0;
  const src = path.join(publicDir, deck);
  const goc = (await readdir(src)).filter((f) => f.endsWith(".webp")).sort();

  let nho = [];
  try {
    nho = (await readdir(path.join(src, THUMB_DIR))).filter((f) => f.endsWith(".webp")).sort();
  } catch {
    fail(`${deck}: chưa có thư mục ${THUMB_DIR}/ — chạy npm run build:card-thumbs`);
    continue;
  }

  const co = new Set(nho);
  for (const f of goc) {
    if (!co.has(f)) fail(`${deck}: thiếu bản nhỏ cho ${f}`);
  }

  // Mồ côi = ảnh gốc đã xoá hay đổi tên mà bản nhỏ còn nằm lại. Không làm 404, nhưng
  // nó là một lá bài không còn tồn tại vẫn tải về được.
  const goi = new Set(goc);
  for (const f of nho) {
    if (!goi.has(f)) fail(`${deck}: bản nhỏ mồ côi ${THUMB_DIR}/${f} — ảnh gốc không còn`);
  }

  let bytes = 0;
  for (const f of nho) {
    const { size } = await stat(path.join(src, THUMB_DIR, f));
    bytes += size;
    if (size > MAX_KB * 1024) {
      fail(`${deck}: ${THUMB_DIR}/${f} nặng ${Math.round(size / 1024)}KB, quá mốc ${MAX_KB}KB`);
    }
  }

  if (!badDeck) {
    console.log(
      `✓ ${deck}: ${goc.length} lá, bản nhỏ ${Math.round(bytes / 1024)}KB ` +
        `(trung bình ${nho.length ? Math.round(bytes / nho.length / 1024) : 0}KB/lá)`,
    );
  }
}

console.log(bad ? `\n=== ${bad} chỗ hỏng ===` : `\n=== đủ bản nhỏ cho ${decks.length} deck ===`);
if (bad) process.exitCode = 1;
