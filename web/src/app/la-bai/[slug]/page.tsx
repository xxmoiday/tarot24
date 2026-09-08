import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { TarotCardFace } from "@/components/TarotCardFace";
import { ButtonLink, Chip, Disclaimer, Eyebrow } from "@/components/ui";
import {
  ASPECT_LABEL,
  ASPECT_ORDER,
  CARDS,
  cardSubtitle,
  getCard,
  neighbours,
  type TarotCard,
} from "@/lib/cards";
import { absoluteUrl } from "@/lib/site";

export function generateStaticParams() {
  return CARDS.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const card = getCard(slug);
  if (!card) return {};
  const title = `${card.vi} · ${card.en}`;
  const description = `Ý nghĩa lá ${card.vi} (${card.en}): ${card.core} Tra nghĩa xuôi, nghĩa ngược và từng mặt đời sống.`;
  return {
    title,
    description,
    alternates: { canonical: `/la-bai/${card.slug}` },
    openGraph: {
      type: "article",
      title,
      description,
      url: absoluteUrl(`/la-bai/${card.slug}`),
    },
  };
}

/** Ba cách đọc chỉ có ở 16 lá hoàng gia nên mục lục phải dựng theo từng lá. */
function tocFor(card: TarotCard) {
  return [
    { id: "cot-loi", label: "Cốt lõi" },
    { id: "xuoi-nguoc", label: "Xuôi và ngược" },
    ...(card.courtReading ? [{ id: "ba-cach-doc", label: "Ba cách đọc" }] : []),
    ...ASPECT_ORDER.map((a) => ({ id: a, label: ASPECT_LABEL[a] })),
    { id: "tren-la-bai", label: "Trên lá bài" },
    { id: "nguoi-viet-hay-noi", label: "Người Việt hay nói" },
    { id: "khi-la-lech", label: "Khi lá lệch" },
  ];
}

const COURT_WAYS = [
  {
    key: "asPerson" as const,
    label: "Là một người",
    hint: "khi câu hỏi có một người cụ thể",
  },
  {
    key: "asEnergy" as const,
    label: "Là năng lượng",
    hint: "khi lá nói về tâm thế bạn đang mang",
  },
  {
    key: "asSituation" as const,
    label: "Là tình huống",
    hint: "khi lá nói về hoàn cảnh chứ không về ai",
  },
];

export default async function CardPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const card = getCard(slug);
  if (!card) notFound();
  const { prev, next } = neighbours(card.slug);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: `${card.vi} · ${card.en}`,
    description: card.core,
    inLanguage: "vi-VN",
    mainEntityOfPage: absoluteUrl(`/la-bai/${card.slug}`),
    about: { "@type": "Thing", name: `Lá bài tarot ${card.en}` },
    keywords: [...card.upright, ...card.reversed].join(", "),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <SiteHeader back />
      <main
        id="noi-dung"
        className="mx-auto max-w-[1440px] px-5 pt-7 pb-4 md:px-[60px] md:pt-14 lg:grid lg:grid-cols-[300px_minmax(0,1fr)_200px] lg:gap-16"
      >
        {/* Cột lá bài */}
        <div className="flex flex-col items-center gap-5 lg:sticky lg:top-24 lg:items-stretch lg:gap-5.5">
          <TarotCardFace
            imageId={card.id}
            title={card.vi}
            en={card.en}
            face="up"
            className="w-[190px] lg:w-[300px]"
          />
          <div className="flex flex-col items-center gap-2 text-center lg:hidden">
            <h1 className="font-serif text-[32px]/[1.1] text-ink">{card.vi}</h1>
            <p className="text-[13.5px]/[1.6] text-muted">
              {cardSubtitle(card)}
            </p>
            <p className="text-[12.5px] text-muted">
              Golden Dawn: {card.astro}
            </p>
          </div>
          <div className="hidden lg:block">
            <ButtonLink href="/kieu-trai/mot-la-hom-nay" size="block">
              Rút bài với lá này
            </ButtonLink>
          </div>
          <div className="hidden items-center justify-between text-sm lg:flex">
            <Link
              href={`/la-bai/${prev!.slug}`}
              className="text-gold hover:text-gold-hi"
            >
              ← {prev!.vi}
            </Link>
            <Link
              href={`/la-bai/${next!.slug}`}
              className="text-gold hover:text-gold-hi"
            >
              {next!.vi} →
            </Link>
          </div>
        </div>

        {/* Nội dung */}
        <article className="flex min-w-0 flex-col gap-9 pt-7 lg:gap-9.5 lg:pt-0">
          <div className="hidden flex-col gap-2.5 lg:flex">
            <h1 className="font-serif text-[46px]/[1.05] text-ink">
              {card.vi}
            </h1>
            <p className="text-[14.5px] text-muted">{cardSubtitle(card)}</p>
            <p className="text-[13px] text-muted">Golden Dawn: {card.astro}</p>
          </div>

          <section id="cot-loi" className="scroll-mt-24">
            <p className="max-w-[62ch] border-l-2 border-gold pl-4 font-serif text-[19px]/[1.65] text-pretty text-ink lg:pl-5 lg:text-[21px]">
              {card.core}
            </p>
          </section>

          <section
            id="xuoi-nguoc"
            className="grid scroll-mt-24 gap-5 sm:grid-cols-2 lg:gap-8"
          >
            <div className="flex flex-col gap-2.5 lg:gap-3">
              <Eyebrow>Xuôi</Eyebrow>
              <div className="flex flex-wrap gap-2">
                {card.upright.map((k) => (
                  <Chip key={k}>{k}</Chip>
                ))}
              </div>
            </div>
            <div className="flex flex-col gap-2.5 lg:gap-3">
              <Eyebrow tone="rust">Ngược</Eyebrow>
              <div className="flex flex-wrap gap-2">
                {card.reversed.map((k) => (
                  <Chip key={k} tone="rust">
                    {k}
                  </Chip>
                ))}
              </div>
            </div>
          </section>

          {card.courtReading ? (
            <section
              id="ba-cach-doc"
              className="flex scroll-mt-24 flex-col gap-3.5"
            >
              <div className="flex flex-col gap-1.5">
                <h2 className="font-serif text-xl text-gold lg:text-[22px]">
                  Ba cách đọc
                </h2>
                <p className="text-[13.5px]/[1.6] text-muted">
                  Lá hoàng gia đọc theo ba cách; chọn cách nào là tuỳ vị trí
                  trong trải và tuỳ câu hỏi có nhắc tới một người cụ thể hay
                  không.
                </p>
              </div>
              <div className="grid gap-2.5 md:grid-cols-3">
                {COURT_WAYS.map((w) => (
                  <div
                    key={w.key}
                    className="flex flex-col gap-2 rounded-xl border border-line bg-surface p-4"
                  >
                    <div className="flex flex-col gap-0.5">
                      <span className="text-[15px] font-medium text-ink">
                        {w.label}
                      </span>
                      <span className="text-xs text-muted">{w.hint}</span>
                    </div>
                    <p className="text-[14px]/[1.7] text-pretty text-ink">
                      {card.courtReading![w.key]}
                    </p>
                  </div>
                ))}
              </div>
            </section>
          ) : null}

          <section className="flex max-w-[62ch] flex-col gap-5.5 lg:gap-6">
            {ASPECT_ORDER.map((a) => (
              <div key={a} id={a} className="flex scroll-mt-24 flex-col gap-2">
                <h2 className="font-serif text-xl text-gold lg:text-[22px]">
                  {ASPECT_LABEL[a]}
                </h2>
                <p className="font-serif text-[17px]/[1.7] text-pretty text-ink lg:text-[18px]">
                  {card.aspects[a]}
                </p>
              </div>
            ))}
          </section>

          <section
            id="tren-la-bai"
            className="flex max-w-[62ch] scroll-mt-24 flex-col gap-3.5"
          >
            <h2 className="font-serif text-xl text-gold lg:text-[22px]">
              Trên lá bài
            </h2>
            <ul className="flex flex-col gap-3">
              {card.imagery.map((line) => (
                <li key={line} className="flex gap-3 lg:gap-3.5">
                  <span className="mt-[9px] size-[5px] shrink-0 rounded-full bg-gold lg:mt-[11px]" />
                  <span className="text-[14.5px]/[1.7] text-pretty text-ink lg:text-[15px]">
                    {line}
                  </span>
                </li>
              ))}
            </ul>
          </section>

          <section
            id="nguoi-viet-hay-noi"
            className="flex scroll-mt-24 flex-col gap-3.5"
          >
            <h2 className="font-serif text-xl text-gold lg:text-[22px]">
              Người Việt hay nói
            </h2>
            <div className="flex flex-wrap gap-2">
              {card.sayings.map((s) => (
                <Chip key={s} tone="plain">
                  {s}
                </Chip>
              ))}
            </div>
          </section>

          <section
            id="khi-la-lech"
            className="flex max-w-[62ch] scroll-mt-24 flex-col gap-3"
          >
            <h2 className="font-serif text-xl text-gold lg:text-[22px]">
              Khi lá lệch
            </h2>
            <p className="font-serif text-[17px]/[1.7] text-pretty text-ink lg:text-[18px]">
              {card.skewed}
            </p>
          </section>

          <div className="lg:hidden">
            <ButtonLink href="/kieu-trai/mot-la-hom-nay" size="block">
              Rút bài với lá này
            </ButtonLink>
          </div>

          <nav
            aria-label="Lá kế tiếp"
            className="flex items-center justify-between gap-4 border-t border-line pt-7 lg:hidden"
          >
            <Link
              href={`/la-bai/${prev!.slug}`}
              className="text-[14.5px] text-gold"
            >
              ← {prev!.vi}
            </Link>
            <span className="text-line">·</span>
            <Link
              href={`/la-bai/${next!.slug}`}
              className="text-[14.5px] text-gold"
            >
              {next!.vi} →
            </Link>
          </nav>

          <Disclaimer className="border-t border-line pt-6 lg:mt-2" />
        </article>

        {/* Mục lục */}
        <nav
          aria-label="Mục lục"
          className="sticky top-24 hidden flex-col gap-3 border-l border-line pl-5.5 lg:flex"
        >
          <Eyebrow tone="muted">Mục lục</Eyebrow>
          {tocFor(card).map((t) => (
            <a
              key={t.id}
              href={`#${t.id}`}
              className="text-[13.5px] text-muted transition-colors hover:text-gold-hi"
            >
              {t.label}
            </a>
          ))}
        </nav>
      </main>
      <SiteFooter />
    </>
  );
}
