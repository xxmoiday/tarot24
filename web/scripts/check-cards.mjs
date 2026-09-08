// Đối chiếu src/lib/cards.ts với bản gốc data/cards.source.json.
// Chạy: npm run check:cards
import { CARDS, ASPECT_ORDER } from "../src/lib/cards.ts";
import { readFileSync } from "node:fs";

const raw = JSON.parse(readFileSync(new URL("../data/cards.source.json", import.meta.url), "utf8")).cards;
const byId = new Map(CARDS.map((c) => [c.id, c]));
const norm = (s) => (s ?? "").replace(/\s+/g, " ").trim();
const LENS = { love: "tinh_cam", work: "cong_viec", money: "tien_bac", mind: "tam_ly", study: "hoc_hanh" };
const LEAN = { "rất nhẹ": "yes", nhẹ: "yes", vừa: "mixed", nặng: "no", "rất nặng": "no" };

let bad = 0;
const fail = (id, what, want, got) => {
  bad++;
  console.log(`\n✗ ${id} · ${what}\n   gốc : ${String(want).slice(0, 120)}\n   web : ${String(got).slice(0, 120)}`);
};

if (CARDS.length !== raw.length) fail("tổng", "số lá", raw.length, CARDS.length);
const slugs = new Set(CARDS.map((c) => c.slug));
if (slugs.size !== CARDS.length) fail("tổng", "slug trùng nhau", CARDS.length, slugs.size);

for (const r of raw) {
  const c = byId.get(r.id);
  if (!c) { fail(r.id, "thiếu hẳn lá", r.ten_vi, "(không có)"); continue; }
  if (!c.slug) fail(r.id, "thiếu slug", r.ten_vi, c.slug);
  if (norm(r.ten_vi) !== norm(c.vi)) fail(r.id, "tên", r.ten_vi, c.vi);
  if (norm(r.ten_en) !== norm(c.en)) fail(r.id, "tên tiếng Anh", r.ten_en, c.en);
  if (norm(r.cot_loi) !== norm(c.core)) fail(r.id, "cốt lõi", r.cot_loi, c.core);
  if (norm(r.canh_bao) !== norm(c.skewed)) fail(r.id, "cảnh báo", r.canh_bao, c.skewed);
  if (r.tu_khoa_xuoi.join("|") !== c.upright.join("|")) fail(r.id, "từ khoá xuôi", r.tu_khoa_xuoi, c.upright);
  if (r.tu_khoa_nguoc.join("|") !== c.reversed.join("|")) fail(r.id, "từ khoá ngược", r.tu_khoa_nguoc, c.reversed);
  if (r.bieu_tuong.join("|") !== c.imagery.join("|")) fail(r.id, "biểu tượng", r.bieu_tuong.length, c.imagery.length);
  if (r.cach_noi_viet.join("|") !== c.sayings.join("|")) fail(r.id, "cách nói Việt", r.cach_noi_viet, c.sayings);
  for (const a of ASPECT_ORDER) {
    if (norm(r.lang_kinh[LENS[a]]) !== norm(c.aspects[a])) fail(r.id, `lăng kính ${a}`, r.lang_kinh[LENS[a]], c.aspects[a]);
  }
  if (r.sac_thai.trong_luong !== c.weight) fail(r.id, "trọng lượng", r.sac_thai.trong_luong, c.weight);
  if (r.sac_thai.huong !== c.heading) fail(r.id, "hướng", r.sac_thai.huong, c.heading);
  if (LEAN[r.sac_thai.trong_luong] !== c.lean) fail(r.id, "nghiêng có/không", LEAN[r.sac_thai.trong_luong], c.lean);
  if (!!r.ba_cach_doc !== !!c.courtReading) fail(r.id, "ba cách đọc", !!r.ba_cach_doc, !!c.courtReading);
}

const court = CARDS.filter((c) => c.courtReading).length;
console.log(bad ? `\n=== ${bad} chỗ lệch ===` : `\n=== khớp hết · ${CARDS.length} lá, ${court} lá hoàng gia có ba cách đọc ===`);
if (bad) process.exitCode = 1;
