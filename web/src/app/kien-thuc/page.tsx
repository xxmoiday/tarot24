import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { Eyebrow } from "@/components/ui";
import { ARTICLES } from "@/lib/articles";
import { SITE, absoluteUrl, breadcrumbLd, ogCover } from "@/lib/site";

const COVER_IMAGE = {
  src: "/hero/banner-2.webp",
  alt: "Nến, sách cũ và một bộ bài tarot đang mở trên bàn học",
  position: "66% 50%",
};

export const metadata: Metadata = {
  title: "Kiến thức tarot",
  description:
    "Học tarot từ đầu bằng tiếng Việt: bộ bài 78 lá, Ẩn Chính và Ẩn Phụ, bốn bộ nguyên tố, lá ngược, cách đặt câu hỏi và cách đọc một trải bài.",
  alternates: { canonical: "/kien-thuc" },
  openGraph: {
    url: absoluteUrl("/kien-thuc"),
    title: "Kiến thức tarot",
    images: [ogCover(COVER_IMAGE.src, COVER_IMAGE.alt)],
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "CollectionPage",
      name: "Kiến thức tarot",
      url: absoluteUrl("/kien-thuc"),
      inLanguage: "vi-VN",
      isPartOf: { "@type": "WebSite", name: SITE.name, url: SITE.url },
      hasPart: ARTICLES.map((a) => ({
        "@type": "Article",
        headline: a.title,
        description: a.excerpt,
        dateModified: a.updated,
        url: absoluteUrl(`/kien-thuc/${a.slug}`),
      })),
    },
    breadcrumbLd([{ name: "Kiến thức" }]),
  ],
};

export default function KnowledgeIndex() {
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
            className="object-cover opacity-70"
            style={{ objectPosition: COVER_IMAGE.position }}
          />
          <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(11,15,26,0.94)_0%,rgba(11,15,26,0.82)_36%,rgba(11,15,26,0.54)_62%,rgba(11,15,26,0.24)_100%)]" />
          <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-bg to-transparent" />
          <div className="absolute inset-x-0 bottom-0 h-72 bg-gradient-to-t from-bg via-bg/94 to-transparent" />
        </div>

        <div className="mx-auto max-w-[900px] px-5 pt-7 md:px-[60px] md:pt-14">
          <div className="flex min-h-[260px] flex-col justify-end gap-3 pb-4 md:min-h-[360px] md:pb-8">
            <Eyebrow>Học tarot từ đầu</Eyebrow>
            <h1 className="font-serif text-[33px]/[1.12] text-balance text-ink [text-shadow:0_2px_28px_rgba(8,11,19,0.85)] md:text-[54px]/[1.02]">
              Kiến thức tarot
            </h1>
            <p className="max-w-[62ch] text-sm/[1.7] text-pretty text-muted [text-shadow:0_1px_18px_rgba(8,11,19,0.85)] md:text-[17px]">
              Những bài viết nền, đủ để bạn tự đọc được một trải bài mà không cần ai giải hộ.
            </p>
          </div>

          <ul className="mt-7 flex flex-col gap-2.5 md:mt-10 md:gap-3.5">
            {ARTICLES.map((a) => (
              <li key={a.slug}>
                <Link
                  href={`/kien-thuc/${a.slug}`}
                  className="flex flex-col gap-2 rounded-xl border border-line bg-surface p-4 transition-colors hover:border-gold/50 md:p-6"
                >
                  <div className="flex items-baseline justify-between gap-4">
                    <h2 className="font-serif text-[19px]/[1.3] text-ink md:text-[22px]">
                      {a.title}
                    </h2>
                    <span className="shrink-0 text-xs text-gold">{a.minutes} phút đọc</span>
                  </div>
                  <p className="text-[13.5px]/[1.65] text-pretty text-muted md:text-[15px]">
                    {a.excerpt}
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
