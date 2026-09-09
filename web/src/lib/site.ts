export const SITE = {
  name: "Tarot24",
  tagline: "Rút bài, đọc rõ, làm được",
  description:
    "Đặt một câu hỏi thật, rút bài, và nhận một bài luận nói thẳng chuyện của bạn đang đứng ở đâu. Thư viện 78 lá tra nghĩa xuôi, ngược và từng mặt đời sống.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.tarot24.online",
  locale: "vi_VN",
} as const;

export function absoluteUrl(path = "/") {
  return new URL(path, SITE.url).toString();
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
