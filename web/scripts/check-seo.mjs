// Soát bộ bài SEO ở data/seo.source.json: đủ 78 lá, khớp slug với thư viện,
// thẻ title và meta không tràn khỏi khung Google cắt chữ.
//   npm run check:seo
import { CARDS } from "../src/lib/cards.ts";
import { CARD_SEO, getCardSeo } from "../src/lib/seo.ts";

/* Google cắt title quanh 60 ký tự và meta quanh 160; nới nhẹ cho tiếng Việt. */
const TITLE_MAX = 70;
const META_MIN = 110;
const META_MAX = 165;

let bad = 0;
const loi = (msg) => {
  console.log(`  ${msg}`);
  bad++;
};

const thieu = CARDS.filter((c) => !getCardSeo(c.slug));
if (thieu.length) loi(`thiếu bài cho: ${thieu.map((c) => c.slug).join(", ")}`);

const laLa = new Set(CARDS.map((c) => c.slug));
for (const s of CARD_SEO) {
  if (!laLa.has(s.slug)) loi(`${s.slug}: không có lá nào mang slug này`);
  if (s.title.length > TITLE_MAX) loi(`${s.slug}: title ${s.title.length} ký tự (>${TITLE_MAX})`);
  if (s.description.length > META_MAX) loi(`${s.slug}: meta ${s.description.length} ký tự (>${META_MAX})`);
  if (s.description.length < META_MIN) loi(`${s.slug}: meta ${s.description.length} ký tự (<${META_MIN})`);
  if (!s.intro.length) loi(`${s.slug}: thiếu mở đầu`);
  if (s.sections.length !== 6) loi(`${s.slug}: có ${s.sections.length} mục, đợi 6`);
  for (const sec of s.sections) {
    if (!sec.paragraphs.length) loi(`${s.slug}/${sec.key}: mục rỗng`);
  }
  if (!s.faq.length) loi(`${s.slug}: thiếu hỏi đáp`);
}

const tieng = (s) =>
  [...s.intro, ...s.sections.flatMap((x) => x.paragraphs), ...s.faq.map((f) => f.a)]
    .join(" ")
    .trim()
    .split(/\s+/).length;
const dem = CARD_SEO.map(tieng).sort((a, b) => a - b);
console.log(
  `${CARD_SEO.length} bài · độ dài ${dem[0]}–${dem[dem.length - 1]} tiếng` +
    ` · giữa ${dem[dem.length >> 1]}`,
);
console.log(bad ? `\n${bad} chỗ cần sửa` : "\nBộ bài SEO đủ và đúng khung");

if (bad) process.exitCode = 1;
