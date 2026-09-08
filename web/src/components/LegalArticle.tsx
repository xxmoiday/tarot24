import Link from "next/link";
import { SiteFooter } from "./SiteFooter";
import { SiteHeader } from "./SiteHeader";
import { Eyebrow } from "./ui";
import {
  EMAIL_TOKEN,
  LEGAL_DOCS,
  LEGAL_EMAIL,
  LEGAL_UPDATED,
  formatLegalDate,
  type LegalDoc,
} from "@/lib/legal";

/** Thay {email} trong câu văn bằng một liên kết thư bấm được. */
function withEmail(text: string) {
  const parts = text.split(EMAIL_TOKEN);
  if (parts.length === 1) return text;
  return parts.flatMap((part, i) =>
    i === 0
      ? [part]
      : [
          <a
            key={i}
            href={`mailto:${LEGAL_EMAIL}`}
            className="text-gold transition-colors hover:text-gold-hi"
          >
            {LEGAL_EMAIL}
          </a>,
          part,
        ],
  );
}

export function LegalArticle({ doc }: { doc: LegalDoc }) {
  const others = LEGAL_DOCS.filter((d) => d.slug !== doc.slug);

  return (
    <>
      <SiteHeader back />
      <main id="noi-dung" className="mx-auto max-w-[760px] px-5 pt-6 pb-4 md:px-[60px] md:pt-14">
        <nav aria-label="Đường dẫn" className="mb-4 text-[13px] text-muted">
          <Link href="/" className="transition-colors hover:text-gold-hi">
            Trang chủ
          </Link>
          <span className="px-2 text-line">·</span>
          <span>Cập nhật {formatLegalDate(LEGAL_UPDATED)}</span>
        </nav>

        <article className="flex flex-col gap-6">
          <h1 className="font-serif text-[28px]/[1.18] text-balance text-ink md:text-[42px]/[1.1]">
            {doc.title}
          </h1>
          <p className="font-serif text-[18px]/[1.7] text-pretty text-ink md:text-[21px]">
            {doc.intro}
          </p>

          {doc.sections.map((s) => (
            <section key={s.heading} className="mt-3 flex flex-col gap-3">
              <h2 className="font-serif text-xl text-gold md:text-2xl">{s.heading}</h2>
              {s.paragraphs.map((p, i) => (
                <p key={i} className="text-[15px]/[1.8] text-pretty text-ink md:text-[16.5px]">
                  {withEmail(p)}
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
        </article>

        <section className="mt-10 flex flex-col gap-4 border-t border-line pt-8">
          <Eyebrow>Đọc kèm</Eyebrow>
          <div className="grid gap-2.5 md:grid-cols-3">
            {others.map((d) => (
              <Link
                key={d.slug}
                href={`/${d.slug}`}
                className="rounded-xl border border-line bg-surface p-4 text-[14.5px]/[1.4] text-ink transition-colors hover:border-gold/50"
              >
                {d.label}
              </Link>
            ))}
            <Link
              href="/lien-he"
              className="rounded-xl border border-line bg-surface p-4 text-[14.5px]/[1.4] text-ink transition-colors hover:border-gold/50"
            >
              Liên hệ
            </Link>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
