import Link from "next/link";
import { HeroFan } from "@/components/HeroFan";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { SpreadCard } from "@/components/SpreadCard";
import { TarotCardFace } from "@/components/TarotCardFace";
import { ButtonLink, Eyebrow } from "@/components/ui";
import { cardOfTheDay } from "@/lib/draw";
import { SITE, absoluteUrl } from "@/lib/site";
import { SPREADS } from "@/lib/spreads";
import { ARTICLES } from "@/lib/articles";

/** Lá hôm nay đổi theo ngày nên dựng lại trang mỗi giờ, vẫn là trang tĩnh cho SEO. */
export const revalidate = 3600;

export const metadata = {
  title: `${SITE.name} · ${SITE.tagline}`,
  description: SITE.description,
  alternates: { canonical: "/" },
  openGraph: {
    title: `${SITE.name} · ${SITE.tagline}`,
    description: SITE.description,
    url: absoluteUrl("/"),
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      "@id": `${SITE.url}#website`,
      name: SITE.name,
      url: SITE.url,
      inLanguage: "vi-VN",
      description: SITE.description,
    },
    {
      "@type": "Organization",
      "@id": `${SITE.url}#org`,
      name: SITE.name,
      url: SITE.url,
      slogan: SITE.tagline,
    },
  ],
};

export default function HomePage() {
  const today = cardOfTheDay();
  const basic = SPREADS.filter((s) => s.group === "basic");
  const topical = SPREADS.filter((s) => s.group === "topic");

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="hidden md:block">
        <SiteHeader />
      </div>

      <main id="noi-dung" className="mx-auto max-w-[1440px] pb-6">
        {/* Hero */}
        <section className="px-5 pt-6.5 md:px-[60px] lg:grid lg:grid-cols-[1fr_minmax(0,560px)] lg:items-center lg:gap-12 lg:pt-20 xl:grid-cols-[1fr_620px] xl:gap-15">
          <div className="flex flex-col items-center gap-1 lg:hidden">
            <p className="font-serif text-[30px] tracking-[0.02em] text-gold">Tarot24</p>
            <p className="text-sm text-muted">{SITE.tagline}</p>
          </div>

          <div className="hidden flex-col items-start gap-6 lg:flex">
            <h1 className="max-w-[14ch] font-serif text-[46px]/[1.08] text-balance text-ink xl:text-[60px]">
              Rút bài, đọc rõ, làm được
            </h1>
            <p className="max-w-[46ch] text-[17px]/[1.7] text-pretty text-muted">
              Đặt một câu hỏi thật, rút bài, và nhận một bài luận nói thẳng chuyện của bạn
              đang đứng ở đâu.
            </p>
            <ButtonLink href="/kieu-trai" size="lg" className="mt-2">
              Rút bài ngay
            </ButtonLink>
          </div>

          <div className="mt-2 lg:mt-0">
            <HeroFan centerTitle={today.vi} centerId={today.id} />
          </div>
        </section>

        <div className="flex justify-center px-5 pt-2 lg:hidden">
          <ButtonLink href="/kieu-trai" size="lg">
            Rút bài ngay
          </ButtonLink>
        </div>

        {/* Lá hôm nay */}
        <section className="px-5 pt-8.5 md:px-[60px] md:pt-24">
          <div className="flex flex-col gap-3.5 rounded-2xl border border-line bg-surface p-[18px] md:flex-row md:items-center md:gap-10 md:rounded-[14px] md:p-[32px_40px]">
            <div className="flex items-start gap-4 md:contents">
              <TarotCardFace
                imageId={today.id}
                title={today.vi}
                face="up"
                className="w-[78px] shrink-0 md:w-[104px]"
              />
              <div className="flex flex-1 flex-col gap-1.5 md:gap-2">
                <Eyebrow>Lá hôm nay</Eyebrow>
                <div className="flex flex-col md:flex-row md:items-baseline md:gap-4.5">
                  <h2 className="font-serif text-[21px] text-ink md:text-[26px]">
                    {today.vi}
                  </h2>
                  <p className="text-[13px] text-muted md:text-sm">
                    {today.upright.slice(0, 3).join(" · ")}
                  </p>
                </div>
                <p className="max-w-[64ch] font-serif text-base/[1.7] text-pretty text-ink md:text-[18px]">
                  {today.core}
                </p>
                <Link
                  href={`/la-bai/${today.slug}`}
                  className="mt-0.5 text-sm font-medium text-gold transition-colors hover:text-gold-hi md:hidden"
                >
                  Xem lá này
                </Link>
              </div>
            </div>
            <Link
              href={`/la-bai/${today.slug}`}
              className="hidden shrink-0 text-[15px] font-medium text-gold transition-colors hover:text-gold-hi md:block"
            >
              Xem lá này →
            </Link>
          </div>
        </section>

        {/* Kiểu trải */}
        <section className="px-5 pt-9.5 md:px-[60px] md:pt-24">
          <div className="flex flex-col gap-4 md:gap-6">
            <div className="flex flex-col gap-2 md:flex-row md:items-baseline md:gap-5">
              <h2 className="font-serif text-2xl text-ink md:text-[34px]">Kiểu trải</h2>
              <Eyebrow>Cơ bản</Eyebrow>
            </div>
            <div className="grid gap-2.5 md:grid-cols-3 md:gap-4.5">
              {basic.map((s) => (
                <SpreadCard key={s.slug} spread={s} featured={s.slug === "ba-la-thoi-gian"} />
              ))}
            </div>
            <Eyebrow className="mt-2.5 md:mt-4">Chuyên đề</Eyebrow>
            <div className="grid gap-2.5 md:grid-cols-3 md:gap-4.5">
              {topical.map((s) => (
                <SpreadCard key={s.slug} spread={s} />
              ))}
            </div>
          </div>
        </section>

        {/* Thư viện */}
        <section className="px-5 pt-8.5 md:px-[60px] md:pt-24">
          <Link
            href="/la-bai"
            className="flex items-center justify-between gap-3 rounded-xl border border-gold/45 px-5 py-[18px] transition-colors hover:border-gold-hi md:px-10 md:py-8"
          >
            <span className="flex flex-col gap-1">
              <span className="font-serif text-[19px] text-ink md:text-2xl">
                Thư viện 78 lá
              </span>
              <span className="text-[13px] text-muted md:text-[15px]">
                Tra nghĩa xuôi, ngược và từng mặt đời sống
              </span>
            </span>
            <span className="text-xl text-gold">→</span>
          </Link>
        </section>

        {/* Kiến thức */}
        <section className="px-5 pt-8.5 md:px-[60px] md:pt-24">
          <div className="flex flex-col gap-4 md:gap-6">
            <div className="flex items-baseline justify-between gap-4">
              <h2 className="font-serif text-2xl text-ink md:text-[34px]">Kiến thức tarot</h2>
              <Link
                href="/kien-thuc"
                className="text-sm font-medium text-gold transition-colors hover:text-gold-hi"
              >
                Xem tất cả →
              </Link>
            </div>
            <div className="grid gap-2.5 md:grid-cols-3 md:gap-4.5">
              {ARTICLES.slice(0, 3).map((a) => (
                <Link
                  key={a.slug}
                  href={`/kien-thuc/${a.slug}`}
                  className="flex flex-col gap-2 rounded-xl border border-line bg-surface p-4 transition-colors hover:border-gold/50 md:p-[22px]"
                >
                  <h3 className="font-serif text-[18px]/[1.3] text-ink md:text-xl">
                    {a.title}
                  </h3>
                  <p className="text-[13.5px]/[1.65] text-pretty text-muted md:text-sm">
                    {a.excerpt}
                  </p>
                </Link>
              ))}
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </>
  );
}
