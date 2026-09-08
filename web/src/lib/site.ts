export const SITE = {
  name: "Tarot24",
  tagline: "Rút bài, đọc rõ, làm được",
  description:
    "Đặt một câu hỏi thật, rút bài, và nhận một bài luận nói thẳng chuyện của bạn đang đứng ở đâu. Thư viện 78 lá tra nghĩa xuôi, ngược và từng mặt đời sống.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://tarrot24.online",
  locale: "vi_VN",
} as const;

export function absoluteUrl(path = "/") {
  return new URL(path, SITE.url).toString();
}
