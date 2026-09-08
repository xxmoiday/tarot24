import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /**
   * Mấy route dưới đây đọc tệp lúc chạy. Trên Vercel, function chỉ mang theo
   * những gì được truy vết, mà tệp dữ liệu thuần thì không bị truy vết ra,
   * nên phải khai báo tay.
   */
  outputFileTracingIncludes: {
    "/api/reading": ["./data/system_luan_bai.md"],
    "/api/reading/hoi-them": ["./data/system_luan_bai.md"],
    "/opengraph-image": ["./data/og-cards/**"],
    "/la-bai/\\[slug\\]/opengraph-image": ["./data/og-cards/**"],
    "/doc/\\[id\\]/opengraph-image": ["./data/og-cards/**"],
  },
};

export default nextConfig;
