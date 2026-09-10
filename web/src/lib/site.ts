export const SITE = {
  name: "Tarot24",
  tagline: "Rút bài, đọc rõ, làm được",
  description:
    "Đặt một câu hỏi thật, rút bài, và nhận một bài luận nói thẳng chuyện của bạn đang đứng ở đâu. Thư viện 78 lá tra nghĩa xuôi, ngược và từng mặt đời sống.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.tarot24.online",
  locale: "vi_VN",
} as const;

/**
 * Mã đo Google Analytics. Để trống biến môi trường là tắt hẳn — bản dựng thử
 * hay bản chạy trên máy mình không có lý do gì bắn số về.
 */
export const GA_ID = process.env.NEXT_PUBLIC_GA_ID ?? "G-LZLMGNL8SJ";

export function absoluteUrl(path = "/") {
  return new URL(path, SITE.url).toString();
}

/**
 * Ảnh cho thẻ og:image, trỏ sang bản .jpg sinh kèm bởi npm run build:og-covers.
 *
 * Cover trong public/ là webp, mà Facebook, Messenger, Zalo và LinkedIn chỉ
 * nhận JPEG/PNG/GIF: gặp webp là crawler tải về rồi bỏ qua, link dán vào khung
 * chat ra thẻ trơ không ảnh. Bản webp vẫn là bản <Image> dùng để hiển thị.
 *
 * Khai luôn khổ và kiểu vì Next chỉ tự điền mấy thứ đó cho ảnh sinh bằng
 * opengraph-image.tsx, không điền cho URL viết tay; thiếu thì có nơi hạ xuống
 * thẻ nhỏ hoặc bỏ qua ảnh.
 */
export function ogCover(src: string, alt: string) {
  return {
    url: absoluteUrl(src.replace(/\.webp$/, ".jpg")),
    width: 1200,
    height: 630,
    type: "image/jpeg",
    alt,
  };
}

/**
 * BreadcrumbList cho các trang con. Google dùng nó để in đường dẫn thay cho URL
 * trong kết quả tìm kiếm, nên mọi trang chi tiết đều nên có.
 */
export function breadcrumbLd(trail: { name: string; path?: string }[]) {
  return {
    "@type": "BreadcrumbList",
    itemListElement: [{ name: "Trang chủ", path: "/" }, ...trail].map(
      (item, i) => ({
        "@type": "ListItem",
        position: i + 1,
        name: item.name,
        ...(item.path ? { item: absoluteUrl(item.path) } : {}),
      }),
    ),
  };
}
