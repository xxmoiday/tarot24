import type { Metadata } from "next";
import Image from "next/image";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { SpreadCard } from "@/components/SpreadCard";
import { Eyebrow } from "@/components/ui";
import { SITE, absoluteUrl, breadcrumbLd } from "@/lib/site";
import { SPREADS, SPREAD_TIERS } from "@/lib/spreads";

export const metadata: Metadata = {
  title: "Kiểu trải bài tarot",
  description:
    "Mười lăm kiểu trải bài tarot tiếng Việt: một lá, ba lá quá khứ hiện tại tương lai, năm lá tình cảm, móng ngựa bảy lá, Thập tự Celtic và các trải chuyên đề.",
  alternates: { canonical: "/kieu-trai" },
  openGraph: { url: absoluteUrl("/kieu-trai"), title: "Kiểu trải bài tarot" },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "CollectionPage",
      name: "Kiểu trải bài tarot",
      url: absoluteUrl("/kieu-trai"),
      inLanguage: "vi-VN",
      isPartOf: { "@type": "WebSite", name: SITE.name, url: SITE.url },
      hasPart: SPREADS.map((s) => ({
        "@type": "HowTo",
        name: s.name,
        alternateName: s.nameEn,
        description: s.blurb,
        url: absoluteUrl(`/kieu-trai/${s.slug}`),
      })),
    },
    breadcrumbLd([{ name: "Kiểu trải" }]),
  ],
};

export default function SpreadsPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <SiteHeader back />
      <main id="noi-dung" className="relative isolate overflow-hidden pb-4">
        <div aria-hidden className="absolute inset-x-0 top-0 -z-10 h-[560px] md:h-[720px]">
          <Image
            src="/spreads/banner.webp"
            alt=""
            fill
            unoptimized
            sizes="100vw"
            className="object-cover opacity-45"
            style={{ objectPosition: "58% 46%" }}
          />
          <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(11,15,26,0.93)_0%,rgba(11,15,26,0.72)_42%,rgba(11,15,26,0.48)_100%)]" />
          <div className="absolute inset-x-0 top-0 h-36 bg-gradient-to-b from-bg to-transparent" />
          <div className="absolute inset-x-0 bottom-0 h-72 bg-gradient-to-t from-bg via-bg/92 to-transparent" />
        </div>

        <div className="mx-auto max-w-[1440px] px-5 pt-7 md:px-[60px] md:pt-14">
          <div className="flex min-h-[260px] max-w-[700px] flex-col justify-end gap-3 pb-4 md:min-h-[360px] md:pb-8">
            <Eyebrow>15 kiểu trải tarot</Eyebrow>
            <h1 className="font-serif text-[33px]/[1.12] text-balance text-ink [text-shadow:0_2px_28px_rgba(8,11,19,0.85)] md:text-[54px]/[1.02]">
              Kiểu trải
            </h1>
            <p className="max-w-[62ch] text-sm/[1.7] text-pretty text-muted [text-shadow:0_1px_18px_rgba(8,11,19,0.85)] md:text-[17px]">
              Chọn kiểu trải theo cỡ của câu hỏi. Một lá cho chuyện trong ngày, ba lá cho một
              mạch, năm lá khi có nhiều bên. Phần lớn câu hỏi dừng ở đó; trải bảy lá trở lên
              để dành cho chuyện lớn.
            </p>
          </div>

          <section className="mt-7 flex flex-col gap-4 md:mt-10 md:gap-6">
            <Eyebrow>Bắt đầu ở đây</Eyebrow>
            <div className="grid gap-2.5 md:grid-cols-3 md:gap-4.5">
              {SPREAD_TIERS.start.map((s) => (
                <SpreadCard key={s.slug} spread={s} />
              ))}
            </div>
          </section>

          <section className="mt-8 flex flex-col gap-4 md:mt-14 md:gap-6">
            <Eyebrow>Chuyên đề</Eyebrow>
            <div className="grid gap-2.5 md:grid-cols-3 md:gap-4.5">
              {SPREAD_TIERS.topic.map((s) => (
                <SpreadCard key={s.slug} spread={s} />
              ))}
            </div>
          </section>

          <section className="mt-8 flex flex-col gap-4 md:mt-14 md:gap-6">
            <div className="flex flex-col gap-2">
              <Eyebrow>Trải dài</Eyebrow>
              <p className="max-w-[62ch] text-[13.5px]/[1.7] text-pretty text-muted md:text-sm">
                Bảy lá trở lên thì đọc lâu và dễ loãng nếu câu hỏi còn chung chung. Để dành
                cho chuyện lớn, và hỏi cho thật cụ thể trước khi rút.
              </p>
            </div>
            <div className="grid gap-2.5 md:grid-cols-3 md:gap-4.5">
              {SPREAD_TIERS.long.map((s) => (
                <SpreadCard key={s.slug} spread={s} />
              ))}
            </div>
          </section>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
