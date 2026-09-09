import type { Metadata } from "next";
import Image from "next/image";
import { CardLibrary } from "@/components/CardLibrary";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { Eyebrow } from "@/components/ui";
import { CARDS } from "@/lib/cards";
import { SITE, absoluteUrl, breadcrumbLd } from "@/lib/site";

const COVER_IMAGE = {
  src: "/hero/banner-3.webp",
  alt: "Một bộ bài tarot bên hoa trắng trong ánh sáng cửa sổ",
  position: "64% 50%",
};

export const metadata: Metadata = {
  title: "Thư viện 78 lá bài tarot",
  description:
    "Tra nghĩa 78 lá bài tarot bằng tiếng Việt: nghĩa xuôi, nghĩa ngược, tình cảm, công việc, tiền bạc, tâm lý, học hành và chi tiết hình vẽ trên lá.",
  alternates: { canonical: "/la-bai" },
  openGraph: {
    url: absoluteUrl("/la-bai"),
    title: "Thư viện 78 lá bài tarot",
    images: [absoluteUrl(COVER_IMAGE.src)],
  },
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
      <main id="noi-dung" className="relative isolate overflow-hidden pb-4">
        <div aria-hidden className="absolute inset-x-0 top-0 -z-10 h-[540px] md:h-[700px]">
          <Image
            src={COVER_IMAGE.src}
            alt={COVER_IMAGE.alt}
            fill
            priority
            unoptimized
            sizes="100vw"
            className="object-cover opacity-75"
            style={{ objectPosition: COVER_IMAGE.position }}
          />
          <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(11,15,26,0.96)_0%,rgba(11,15,26,0.86)_34%,rgba(11,15,26,0.58)_62%,rgba(11,15,26,0.32)_100%)]" />
          <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-bg to-transparent" />
          <div className="absolute inset-x-0 bottom-0 h-72 bg-gradient-to-t from-bg via-bg/94 to-transparent" />
        </div>

        <div className="mx-auto max-w-[1440px] px-5 pt-7 md:px-[60px] md:pt-14">
          <div className="mb-7 flex min-h-[260px] max-w-[720px] flex-col justify-end gap-3 pb-4 md:mb-10 md:min-h-[360px] md:pb-8">
            <Eyebrow>78 lá tarot</Eyebrow>
            <h1 className="font-serif text-[33px]/[1.12] text-balance text-ink [text-shadow:0_2px_28px_rgba(8,11,19,0.85)] md:text-[54px]/[1.02]">
              Thư viện 78 lá
            </h1>
            <p className="max-w-[62ch] text-sm/[1.7] text-pretty text-muted [text-shadow:0_1px_18px_rgba(8,11,19,0.85)] md:text-[17px]">
              Hai mươi hai lá Ẩn Chính và năm mươi sáu lá Ẩn Phụ, tra được nghĩa xuôi, nghĩa
              ngược và từng mặt đời sống.
            </p>
          </div>
          <CardLibrary />
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
