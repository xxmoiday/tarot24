import "server-only";
import { readFile } from "node:fs/promises";
import path from "node:path";

/**
 * Ảnh lá cho ảnh OG. Đọc bản JPEG dựng sẵn trong data/og-cards thay vì
 * chuyển đổi lúc chạy, vì hai lý do: Satori không đọc được webp, và thư mục
 * public không nằm trong bundle của serverless function nên đọc từ đó sẽ
 * hỏng khi triển khai lên Vercel. Sinh lại bằng: npm run build:og-cards
 */
export async function cardDataUri(id: string) {
  try {
    const file = path.join(process.cwd(), "data", "og-cards", `${id}.jpg`);
    const buf = await readFile(file);
    return `data:image/jpeg;base64,${buf.toString("base64")}`;
  } catch {
    return null;
  }
}

/**
 * Cắt cho vừa ảnh OG mà không đứt giữa câu: ưu tiên dừng ở dấu chấm gần nhất,
 * không có thì lùi về ranh giới từ rồi thêm dấu ba chấm.
 */
export function trimForOg(text: string, max: number) {
  const t = text.trim();
  if (t.length <= max) return t;
  const cut = t.slice(0, max);
  const dot = cut.lastIndexOf(".");
  if (dot > max * 0.5) return cut.slice(0, dot + 1);
  const space = cut.lastIndexOf(" ");
  return (space > 0 ? cut.slice(0, space) : cut).replace(/[,;:]$/, "") + "…";
}

interface OgFont {
  name: string;
  data: ArrayBuffer;
  weight: 400 | 600;
  style: "normal";
}

let fontsPromise: Promise<OgFont[]> | null = null;

/** Google Fonts chỉ trả ttf khi User-Agent cũ; Satori không đọc được woff2. */
async function fetchFont(family: string, weight: 400 | 600): Promise<OgFont | null> {
  try {
    const css = await fetch(
      `https://fonts.googleapis.com/css2?family=${family}:wght@${weight}&subset=vietnamese`,
      { headers: { "user-agent": "Mozilla/5.0 (Windows NT 6.1)" } },
    ).then((r) => r.text());
    const url = css.match(/src:\s*url\(([^)]+)\)\s*format\('truetype'\)/)?.[1];
    if (!url) return null;
    const data = await fetch(url).then((r) => r.arrayBuffer());
    return { name: family.replace(/\+/g, " "), data, weight, style: "normal" };
  } catch {
    return null;
  }
}

/**
 * Font cho ảnh OG, tải một lần rồi giữ trong bộ nhớ. Tải hỏng thì trả mảng
 * rỗng để Satori dùng font mặc định chứ không làm hỏng cả ảnh.
 */
export function ogFonts(): Promise<OgFont[]> {
  fontsPromise ??= Promise.all([
    fetchFont("Newsreader", 400),
    fetchFont("Be+Vietnam+Pro", 400),
    fetchFont("Be+Vietnam+Pro", 600),
  ]).then((f) => f.filter((x): x is OgFont => !!x));
  return fontsPromise;
}
