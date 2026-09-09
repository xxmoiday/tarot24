import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { SpreadCard } from "@/components/SpreadCard";
import { TarotCardFace } from "@/components/TarotCardFace";
import { ButtonLink, Disclaimer, Eyebrow } from "@/components/ui";
import { absoluteUrl, breadcrumbLd } from "@/lib/site";
import { SPREADS, getSpread } from "@/lib/spreads";

export function generateStaticParams() {
  return SPREADS.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const spread = getSpread(slug);
  if (!spread) return {};
  return {
    title: spread.seo.title,
    description: spread.seo.description,
    alternates: { canonical: `/kieu-trai/${spread.slug}` },
    openGraph: {
      title: spread.seo.title,
      description: spread.seo.description,
      url: absoluteUrl(`/kieu-trai/${spread.slug}`),
      images: spread.coverImage ? [absoluteUrl(spread.coverImage.src)] : undefined,
    },
  };
}

export default async function SpreadPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const spread = getSpread(slug);
  if (!spread) notFound();

  const coverImage = spread.coverImage;
  const others = SPREADS.filter((s) => s.slug !== spread.slug).slice(0, 3);

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "HowTo",
        name: spread.name,
        alternateName: spread.nameEn,
        description: spread.about,
        inLanguage: "vi-VN",
        mainEntityOfPage: absoluteUrl(`/kieu-trai/${spread.slug}`),
        totalTime: "PT5M",
        step: spread.positions.map((p, i) => ({
          "@type": "HowToStep",
          position: i + 1,
          name: p.label,
          text: `Lá thứ ${i + 1} nói về ${p.meaning}.`,
        })),
      },
      breadcrumbLd([
        { name: "Kiểu trải", path: "/kieu-trai" },
        { name: spread.name },
      ]),
    ],
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
        className="mx-auto max-w-[1100px] px-5 pt-6 pb-4 md:px-[60px] md:pt-14"
      >
        <nav aria-label="Đường dẫn" className="mb-4 text-[13px] text-muted">
          <Link href="/kieu-trai" className="transition-colors hover:text-gold-hi">
            Kiểu trải
          </Link>
          <span className="px-2 text-line">·</span>
          <span>{spread.name}</span>
        </nav>

        {coverImage ? (
          <section className="relative overflow-hidden rounded-2xl border border-line bg-surface shadow-[0_24px_90px_rgba(0,0,0,0.28)]">
            <Image
              src={coverImage.src}
              alt={coverImage.alt}
              fill
              priority
              unoptimized
              sizes="(max-width: 768px) 100vw, 1100px"
              className="object-cover"
              style={{ objectPosition: coverImage.position ?? "center" }}
            />
            <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(11,15,26,0.92)_0%,rgba(11,15,26,0.74)_34%,rgba(11,15,26,0.2)_74%,rgba(11,15,26,0.06)_100%)]" />
            <div className="absolute inset-0 bg-[linear-gradient(0deg,rgba(11,15,26,0.74)_0%,rgba(11,15,26,0)_54%)]" />
            <div className="relative flex min-h-[430px] flex-col justify-end gap-2.5 px-5 py-7 md:min-h-[520px] md:px-8 md:py-9">
              <Eyebrow>{spread.count} lá</Eyebrow>
              <h1 className="max-w-[680px] font-serif text-[31px]/[1.12] text-balance text-ink md:text-[54px]/[1.02]">
                {spread.name}
              </h1>
              <p className="max-w-[58ch] text-sm/[1.65] text-pretty text-muted md:text-[17px]">
                {spread.about}
              </p>
              <div className="mt-5 flex flex-wrap items-center gap-3">
                <ButtonLink href={`/rut-bai/${spread.slug}`} size="lg">
                  Rút bài ngay
                </ButtonLink>
                <span className="text-[13px] text-muted">
                  Miễn phí, không cần đăng nhập
                </span>
              </div>
            </div>
          </section>
        ) : (
          <>
            <div className="flex flex-col gap-2.5">
              <Eyebrow>{spread.count} lá</Eyebrow>
              <h1 className="font-serif text-[27px]/[1.2] text-balance text-ink md:text-[46px]/[1.05]">
                {spread.name}
              </h1>
              <p className="max-w-[62ch] text-sm/[1.65] text-pretty text-muted md:text-[17px]">
                {spread.about}
              </p>
            </div>

            <div className="mt-7 flex flex-wrap items-center gap-3">
              <ButtonLink href={`/rut-bai/${spread.slug}`} size="lg">
                Rút bài ngay
              </ButtonLink>
              <span className="text-[13px] text-muted">
                Miễn phí, không cần đăng nhập
              </span>
            </div>
          </>
        )}

        <section className="mt-11 md:mt-16">
          <h2 className="font-serif text-xl text-gold md:text-[22px]">Các vị trí trong trải</h2>
          <p className="mt-3 max-w-[62ch] border-l border-line pl-3.5 text-[13.5px]/[1.7] text-pretty text-muted md:text-[15px]">
            {spread.how}
          </p>
          <ol className="mt-6 grid gap-2.5 md:grid-cols-2 md:gap-3.5">
            {spread.positions.map((p, i) => (
              <li
                key={p.label}
                className="flex gap-3.5 rounded-xl border border-line bg-surface p-4"
              >
                <span className="mt-0.5 flex size-[22px] shrink-0 items-center justify-center rounded-full border border-gold text-[11px] text-gold">
                  {i + 1}
                </span>
                <span className="flex flex-col gap-1">
                  <span className="text-[15px] font-medium text-ink">{p.label}</span>
                  <span className="text-[13.5px]/[1.6] text-muted">{p.meaning}</span>
                </span>
              </li>
            ))}
          </ol>
        </section>

        <section className="mt-11 md:mt-16">
          <h2 className="font-serif text-xl text-gold md:text-[22px]">Hỏi thế nào cho trúng</h2>
          <div className="mt-5 grid gap-4 md:grid-cols-2 md:gap-6">
            <div className="flex flex-col gap-3">
              <Eyebrow>Hợp với</Eyebrow>
              <ul className="flex flex-col gap-2.5">
                {spread.fits.map((q) => (
                  <li
                    key={q}
                    className="flex gap-3 rounded-xl border border-moss/40 bg-moss/6 px-4 py-2.5 text-[13.5px]/[1.5] text-ink md:text-[14.5px]"
                  >
                    <span aria-hidden className="mt-[7px] size-[5px] shrink-0 rounded-full bg-moss" />
                    {q}
                  </li>
                ))}
              </ul>
            </div>
            <div className="flex flex-col gap-3">
              <Eyebrow tone="rust">Không hợp</Eyebrow>
              <ul className="flex flex-col gap-2.5">
                {spread.notFor.map((q) => (
                  <li
                    key={q}
                    className="flex gap-3 rounded-xl border border-rust/40 bg-rust/6 px-4 py-2.5 text-[13.5px]/[1.5] text-muted md:text-[14.5px]"
                  >
                    <span aria-hidden className="mt-[7px] size-[5px] shrink-0 rounded-full bg-rust" />
                    {q}
                  </li>
                ))}
              </ul>
              <p className="text-[13px]/[1.6] text-pretty text-muted">
                Mấy câu này hỏi bằng kiểu trải khác sẽ ra bài đọc dùng được hơn, hoặc là chuyện
                bài không trả lời thay chuyên môn được.
              </p>
            </div>
          </div>
          <p className="mt-4 max-w-[62ch] text-[13.5px]/[1.7] text-pretty text-muted">
            Câu hỏi càng có bạn ở trong đó thì bài đọc càng nói được việc cụ thể. Xem thêm{" "}
            <Link
              href="/kien-thuc/cach-dat-cau-hoi-tarot"
              className="text-gold transition-colors hover:text-gold-hi"
            >
              cách đặt câu hỏi cho một lần rút bài
            </Link>
            .
          </p>
        </section>

        <section className="mt-11 flex items-center gap-5 rounded-2xl border border-line bg-surface p-5 md:mt-16 md:p-8">
          <div className="flex shrink-0 gap-2">
            {Array.from({ length: Math.min(3, spread.count) }).map((_, i) => (
              <TarotCardFace key={i} face="down" className="w-[52px] md:w-[64px]" />
            ))}
          </div>
          <div className="flex flex-col gap-3">
            <p className="font-serif text-[17px]/[1.6] text-pretty text-ink md:text-xl">
              Sẵn sàng rồi thì xào bài thôi.
            </p>
            <ButtonLink href={`/rut-bai/${spread.slug}`} variant="outline" size="sm">
              Bắt đầu {spread.name.toLowerCase()}
            </ButtonLink>
          </div>
        </section>

        <section className="mt-11 md:mt-16">
          <h2 className="font-serif text-xl text-gold md:text-[22px]">Kiểu trải khác</h2>
          <div className="mt-4 grid gap-2.5 md:grid-cols-3 md:gap-4.5">
            {others.map((s) => (
              <SpreadCard key={s.slug} spread={s} />
            ))}
          </div>
        </section>

        <Disclaimer className="mt-10 border-t border-line pt-6" />
      </main>
      <SiteFooter />
    </>
  );
}
