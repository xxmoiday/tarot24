import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { Disclaimer, Eyebrow } from "@/components/ui";
import { ARTICLES, getArticle } from "@/lib/articles";
import { absoluteUrl, breadcrumbLd, ogCover } from "@/lib/site";

export function generateStaticParams() {
  return ARTICLES.map((a) => ({ slug: a.slug }));
}

const ARTICLE_COVERS: Record<string, { src: string; alt: string; position: string }> = {
  "tarot-la-gi": {
    src: "/hero/banner-tarot-mystic.webp",
    alt: "Một bàn tarot với nến, hoa khô và bộ bài trải hình quạt",
    position: "62% 48%",
  },
  "an-chinh-an-phu": {
    src: "/spreads/ba-la-thoi-gian-cover.webp",
    alt: "Ba lá tarot nằm trên bàn trong ánh sáng ấm",
    position: "64% 50%",
  },
  "bon-bo-tarot": {
    src: "/hero/banner-3.webp",
    alt: "Một bộ bài tarot bên hoa trắng trong ánh sáng cửa sổ",
    position: "64% 50%",
  },
  "la-nguoc-tarot": {
    src: "/spreads/banner.webp",
    alt: "Các lá tarot trên bàn tối với ánh nến",
    position: "58% 46%",
  },
  "cach-dat-cau-hoi-tarot": {
    src: "/hero/banner-2.webp",
    alt: "Nến, sách cũ và một bộ bài tarot đang mở trên bàn học",
    position: "66% 50%",
  },
  "chon-kieu-trai": {
    src: "/spreads/banner.webp",
    alt: "Bàn trải tarot với nhiều lá bài và ánh sáng huyền ảo",
    position: "58% 46%",
  },
  "doc-trai-ba-la": {
    src: "/spreads/ba-la-thoi-gian-cover.webp",
    alt: "Ba lá tarot quá khứ hiện tại tương lai trong ánh nắng ấm",
    position: "64% 50%",
  },
};

function getArticleCover(slug: string) {
  return ARTICLE_COVERS[slug] ?? ARTICLE_COVERS["tarot-la-gi"];
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const article = getArticle(slug);
  if (!article) return {};
  const coverImage = getArticleCover(article.slug);
  return {
    title: article.title,
    description: article.excerpt,
    alternates: { canonical: `/kien-thuc/${article.slug}` },
    openGraph: {
      type: "article",
      title: article.title,
      description: article.excerpt,
      url: absoluteUrl(`/kien-thuc/${article.slug}`),
      publishedTime: article.updated,
      images: [ogCover(coverImage.src, coverImage.alt)],
    },
  };
}

export default async function ArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const article = getArticle(slug);
  if (!article) notFound();

  const coverImage = getArticleCover(article.slug);
  const others = ARTICLES.filter((a) => a.slug !== article.slug).slice(0, 3);

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Article",
        headline: article.title,
        description: article.excerpt,
        inLanguage: "vi-VN",
        dateModified: article.updated,
        image: absoluteUrl(coverImage.src),
        mainEntityOfPage: absoluteUrl(`/kien-thuc/${article.slug}`),
      },
      {
        "@type": "FAQPage",
        mainEntity: article.faq.map((f) => ({
          "@type": "Question",
          name: f.q,
          acceptedAnswer: { "@type": "Answer", text: f.a },
        })),
      },
      breadcrumbLd([
        { name: "Kiến thức", path: "/kien-thuc" },
        { name: article.title },
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
      <main id="noi-dung" className="relative isolate overflow-hidden pb-4">
        <div aria-hidden className="absolute inset-x-0 top-0 -z-10 h-[540px] md:h-[700px]">
          <Image
            src={coverImage.src}
            alt={coverImage.alt}
            fill
            priority
            unoptimized
            sizes="100vw"
            className="object-cover opacity-70"
            style={{ objectPosition: coverImage.position }}
          />
          <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(11,15,26,0.95)_0%,rgba(11,15,26,0.84)_36%,rgba(11,15,26,0.56)_62%,rgba(11,15,26,0.24)_100%)]" />
          <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-bg to-transparent" />
          <div className="absolute inset-x-0 bottom-0 h-72 bg-gradient-to-t from-bg via-bg/94 to-transparent" />
        </div>

        <div className="mx-auto max-w-[760px] px-5 pt-6 md:px-[60px] md:pt-14">
          <nav
            aria-label="Đường dẫn"
            className="mb-4 text-[13px] text-muted [text-shadow:0_1px_18px_rgba(8,11,19,0.85)]"
          >
            <Link href="/kien-thuc" className="transition-colors hover:text-gold-hi">
              Kiến thức
            </Link>
            <span className="px-2 text-line">·</span>
            <span>{article.minutes} phút đọc</span>
          </nav>

          <article className="flex flex-col gap-6">
            <div className="flex min-h-[280px] flex-col justify-end gap-3 pb-4 md:min-h-[380px] md:pb-8">
              <Eyebrow>Kiến thức tarot · {article.minutes} phút đọc</Eyebrow>
              <h1 className="font-serif text-[33px]/[1.12] text-balance text-ink [text-shadow:0_2px_28px_rgba(8,11,19,0.85)] md:text-[54px]/[1.02]">
                {article.title}
              </h1>
              <p className="font-serif text-[18px]/[1.7] text-pretty text-ink [text-shadow:0_1px_18px_rgba(8,11,19,0.85)] md:text-[21px]">
                {article.intro}
              </p>
            </div>

            {article.sections.map((s) => (
              <section key={s.heading} className="mt-3 flex flex-col gap-3">
                <h2 className="font-serif text-xl text-gold md:text-2xl">{s.heading}</h2>
                {s.paragraphs.map((p, i) => (
                  <p
                    key={i}
                    className="text-[15px]/[1.8] text-pretty text-ink md:text-[16.5px]"
                  >
                    {p}
                  </p>
                ))}
                {s.list ? (
                  <ul className="mt-1 flex flex-col gap-2.5">
                    {s.list.map((li) => (
                      <li key={li} className="flex gap-3">
                        <span className="mt-[10px] size-[5px] shrink-0 rounded-full bg-gold" />
                        <span className="text-[14.5px]/[1.7] text-pretty text-ink">{li}</span>
                      </li>
                    ))}
                  </ul>
                ) : null}
              </section>
            ))}

            {article.faq.length ? (
              <section className="mt-6 flex flex-col gap-4 border-t border-line pt-8">
                <Eyebrow>Hỏi nhanh</Eyebrow>
                {article.faq.map((f) => (
                  <div key={f.q} className="flex flex-col gap-1.5">
                    <h3 className="font-serif text-[18px] text-ink">{f.q}</h3>
                    <p className="text-[14.5px]/[1.7] text-pretty text-muted">{f.a}</p>
                  </div>
                ))}
              </section>
            ) : null}

            <Disclaimer className="mt-4 border-t border-line pt-6" />
          </article>

          <section className="mt-10 flex flex-col gap-4">
            <h2 className="font-serif text-xl text-gold">Đọc tiếp</h2>
            <div className="grid gap-2.5 md:grid-cols-3">
              {others.map((a) => (
                <Link
                  key={a.slug}
                  href={`/kien-thuc/${a.slug}`}
                  className="rounded-xl border border-line bg-surface p-4 text-[14.5px]/[1.4] text-ink transition-colors hover:border-gold/50"
                >
                  {a.title}
                </Link>
              ))}
            </div>
          </section>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
