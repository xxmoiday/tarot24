// Đối chiếu src/lib/spreads.ts với bản gốc data/spreads.source.json.
// Chạy: npm run check:spreads
import { SPREADS } from "../src/lib/spreads.ts";
import { readFileSync } from "node:fs";
const j = JSON.parse(readFileSync(new URL("../data/spreads.source.json", import.meta.url), "utf8"));
const MAP = {
  mot_la_hom_nay:"mot-la-hom-nay", mot_la_co_khong:"co-hay-khong",
  ba_la_thoi_gian:"ba-la-thoi-gian", ba_la_tinh_huong:"ba-la-tinh-huong",
  nam_la_tinh_cam:"nam-la-tinh-cam", mong_ngua_7:"bay-la-mong-ngua",
  celtic_cross:"thap-tu-celtic",
  cong_viec_5:"nam-la-cong-viec", tien_bac_4:"bon-la-tien-bac",
  hai_nguoi:"ba-la-giua-hai-nguoi", quyet_dinh_ab:"nam-la-chon-huong",
  ban_than_3:"ba-la-nhin-lai-minh", tuan_nay_7:"bay-la-tuan-nay",
  thang_toi:"nam-la-thang-toi", nam_toi_12:"muoi-hai-la-nam-toi",
};
const norm = (s) => (s ?? "").replace(/\s+/g," ").trim();
// Web xưng "bạn" thay vì "người hỏi", và thêm "thì" cho câu điều kiện đọc trôi.
const expected = (t) => {
  t = t.replace("trong người hỏi hay","trong chính bạn hay")
       .replace(/người hỏi/g,"bạn").replace(/Người hỏi/g,"Bạn");
  const m = t.match(/^(Nếu [^,]+), /);
  if (m && !m[1].includes("thì")) t = m[1] + " thì " + t.slice(m[0].length);
  return t.charAt(0).toLowerCase() + t.slice(1);
};
let bad = 0;
const say = (id, field, want, got) => {
  bad++;
  console.log(`\n✗ ${id} · ${field}`);
  console.log(`   gốc : ${want}`);
  console.log(`   web : ${got}`);
};
for (const src of j.spreads) {
  const slug = MAP[src.id];
  const mine = SPREADS.find((s) => s.slug === slug);
  if (!mine) { console.log("✗ thiếu hẳn:", src.id); bad++; continue; }
  if (norm(src.ten_vi) !== norm(mine.name)) say(src.id,"tên",src.ten_vi,mine.name);
  if (src.so_la !== mine.count) say(src.id,"số lá",src.so_la,mine.count);
  if (norm(src.ten_en) !== norm(mine.nameEn)) say(src.id,"tên tiếng Anh",src.ten_en,mine.nameEn);
  if (src.do_dai.min !== mine.length.min || src.do_dai.max !== mine.length.max)
    say(src.id,"độ dài",`${src.do_dai.min}-${src.do_dai.max}`,`${mine.length.min}-${mine.length.max}`);
  const nhom = src.nhom === "co_ban" ? "basic" : "topic";
  if (nhom !== mine.group) say(src.id,"nhóm",nhom,mine.group);
  if (norm(src.mo_ta) !== norm(mine.about)) say(src.id,"mô tả",src.mo_ta,mine.about);
  if (norm(src.cach_rut) !== norm(mine.how)) say(src.id,"cách rút",src.cach_rut,mine.how);
  if (norm(src.hop_voi.join(" | ")) !== norm(mine.fits.join(" | ")))
    say(src.id,"hợp với",src.hop_voi.join(" | "),mine.fits.join(" | "));
  if (norm(src.khong_hop_voi.join(" | ")) !== norm(mine.notFor.join(" | ")))
    say(src.id,"không hợp",src.khong_hop_voi.join(" | "),mine.notFor.join(" | "));
  src.vi_tri.forEach((v, i) => {
    const p = mine.positions[i];
    if (!p) return say(src.id, `vị trí ${v.stt}`, v.ten, "(thiếu)");
    if (norm(v.ten) !== norm(p.label)) say(src.id,`vị trí ${v.stt} · tên`,v.ten,p.label);
    if (norm(expected(v.cau_hoi)) !== norm(p.meaning))
      say(src.id,`vị trí ${v.stt} · câu hỏi`,expected(v.cau_hoi),p.meaning);
    const LENS = {tinh_cam:"love",tam_ly:"mind",cong_viec:"work",tien_bac:"money",theo_cau_hoi:undefined};
    if (LENS[v.lang_kinh_uu_tien] !== p.lens)
      say(src.id,`vị trí ${v.stt} · lăng kính`,LENS[v.lang_kinh_uu_tien] ?? "(theo câu hỏi)",p.lens ?? "(theo câu hỏi)");
  });
}
console.log(bad ? `\n=== ${bad} chỗ lệch ===` : "\n=== khớp hết ===");
