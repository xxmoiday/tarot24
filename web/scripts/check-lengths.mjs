// Đo độ dài bài luận thật của từng kiểu trải so với do_dai trong bản gốc.
// Cần server đang chạy: npm run build && npm start, rồi npm run check:lengths
const BASE = process.env.BASE ?? "http://localhost:3000";
const enc = (a) => Buffer.from(JSON.stringify(a),"utf8").toString("base64").replace(/\+/g,"-").replace(/\//g,"_").replace(/=+$/,"");
import { SPREADS } from "../src/lib/spreads.ts";
const CARDS = {
  "mot-la-hom-nay":["muoi-kiem"], "co-hay-khong":["ba-coc"],
  "ba-la-thoi-gian":["chin-tien","bon-tien","mat-trang"],
  "ba-la-tinh-huong":["at-coc!","mat-trang","muoi-coc"],
  "ba-la-giua-hai-nguoi":["than-chet","nu-tu-te","tieu-dong-gay"],
  "nam-la-tinh-cam":["bay-gay","vua-tien!","ngoi-sao","tieu-dong-tien","tieu-dong-gay"],
  "nam-la-cong-viec":["than-chet","at-tien","at-gay","bay-coc","sau-coc"],
  "bon-la-tien-bac":["nguoi-treo-nguoc","co-xe","tieu-dong-kiem","hai-gay!"],
  "nam-la-chon-huong":["phap-su","nam-coc","bay-gay","toa-thap","bon-coc"],
  "nam-la-thang-toi":["at-coc","muoi-coc!","nu-hoang","ac-quy","tiet-che"],
  "thap-tu-celtic":["ba-coc","vua-kiem","at-coc","banh-xe-so-phan","bon-tien","vua-tien!","bon-gay","at-tien","tieu-dong-gay","bay-gay!"],
};
let bad = 0;
for (const sp of SPREADS) {
  const id = enc([sp.slug, sp.fits[0], sp.defaultTopic, CARDS[sp.slug].join(","), 0]);
  /* Đo thẳng trường essay do API trả về; đọc HTML sẽ đếm nhầm cả câu hỏi thêm. */
  const res = await fetch(`${BASE}/api/reading`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ id }),
  });
  const data = await res.json();
  const essay = data.essay;
  if (!essay) {
    console.log(`${sp.name.slice(0, 26).padEnd(28)} không có bài (${data.reason ?? res.status})`);
    bad++;
    continue;
  }
  const w = essay.trim().split(/\s+/).filter(Boolean).length;
  /* Khung do_dai nới 15% đúng như prompts/README.md quy định cho bộ lọc. */
  const lo = Math.floor(sp.length.min * 0.85);
  const hi = Math.ceil(sp.length.max * 1.15);
  const ok = w >= lo && w <= hi;
  if (!ok) bad++;
  console.log(
    `${sp.name.slice(0, 26).padEnd(28)} ${String(w).padStart(4)} / ${sp.length.min}–${sp.length.max}` +
      ` (nới ${lo}–${hi})  ${ok ? "✓" : w < lo ? "NGẮN" : "DÀI"}`,
  );
}
console.log(bad ? `\n${bad} kiểu trải lệch khoảng` : "\nCả 11 kiểu trải đúng khoảng độ dài trong bản gốc");

if (bad) process.exitCode = 1;
