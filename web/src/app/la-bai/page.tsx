import type { Metadata } from "next";
import { CardLibrary } from "@/components/CardLibrary";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { CARDS } from "@/lib/cards";
import { SITE, absoluteUrl, breadcrumbLd } from "@/lib/site";

export const metadata: Metadata = {
  title: "Thư viện 78 lá bài tarot",
  description:
    "Tra nghĩa 78 lá bài tarot bằng tiếng Việt: nghĩa xuôi, nghĩa ngược, tình cảm, công việc, tiền bạc, tâm lý, học hành và chi tiết hình vẽ trên lá.",
  alternates: { canonical: "/la-bai" },
  openGraph: { url: absoluteUrl("/la-bai"), title: "Thư viện 78 lá bài tarot" },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "CollectionPage",
      name: "Thư viện 78 lá bài tarot",
      url: absoluteUrl("/la-bai"),
      inLanguage: "vi-VN",
      isPartOf: { "@type": "WebSite", name: SITE.name, url: SITE.url },
      hasPart: CARDS.slice(0, 78).map((c) => ({
        "@type": "Article",
        name: `${c.vi} · ${c.en}`,
        url: absoluteUrl(`/la-bai/${c.slug}`),
      })),
    },
    breadcrumbLd([{ name: "Thư viện 78 lá" }]),
  ],
};

export default function LibraryPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <SiteHeader back />
      <main id="noi-dung" className="mx-auto max-w-[1440px] px-5 pt-7 pb-4 md:px-[60px] md:pt-14">
        <div className="mb-8 flex flex-col gap-3 md:mb-12">
          <h1 className="font-serif text-[27px]/[1.2] text-balance text-ink md:text-[46px]/[1.05]">
            Thư viện 78 lá
          </h1>
          <p className="max-w-[62ch] text-sm/[1.7] text-pretty text-muted md:text-[17px]">
            Hai mươi hai lá Ẩn Chính và năm mươi sáu lá Ẩn Phụ, tra được nghĩa xuôi, nghĩa
            ngược và từng mặt đời sống.
          </p>
        </div>
        <CardLibrary />
      </main>
      <SiteFooter />
    </>
  );
}
