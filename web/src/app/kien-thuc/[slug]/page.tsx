import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { Disclaimer, Eyebrow } from "@/components/ui";
import { ARTICLES, getArticle } from "@/lib/articles";
import { absoluteUrl } from "@/lib/site";

export function generateStaticParams() {
  return ARTICLES.map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const article = getArticle(slug);
  if (!article) return {};
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
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <SiteHeader back />
      <main id="noi-dung" className="mx-auto max-w-[760px] px-5 pt-6 pb-4 md:px-[60px] md:pt-14">
        <nav aria-label="Đường dẫn" className="mb-4 text-[13px] text-muted">
          <Link href="/kien-thuc" className="transition-colors hover:text-gold-hi">
            Kiến thức
          </Link>
          <span className="px-2 text-line">·</span>
          <span>{article.minutes} phút đọc</span>
        </nav>

        <article className="flex flex-col gap-6">
          <h1 className="font-serif text-[28px]/[1.18] text-balance text-ink md:text-[42px]/[1.1]">
            {article.title}
          </h1>
          <p className="font-serif text-[18px]/[1.7] text-pretty text-ink md:text-[21px]">
            {article.intro}
          </p>

          {article.sections.map((s) => (
            <section key={s.heading} className="mt-3 flex flex-col gap-3">
              <h2 className="font-serif text-xl text-gold md:text-2xl">{s.heading}</h2>
              {s.paragraphs.map((p, i) => (
                <p key={i} className="text-[15px]/[1.8] text-pretty text-ink md:text-[16.5px]">
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
      </main>
      <SiteFooter />
    </>
  );
}
