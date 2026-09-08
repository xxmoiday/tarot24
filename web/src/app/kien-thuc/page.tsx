import type { Metadata } from "next";
import Link from "next/link";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { ARTICLES } from "@/lib/articles";
import { absoluteUrl } from "@/lib/site";

export const metadata: Metadata = {
  title: "Kiến thức tarot",
  description:
    "Học tarot từ đầu bằng tiếng Việt: bộ bài 78 lá, Ẩn Chính và Ẩn Phụ, bốn bộ nguyên tố, lá ngược, cách đặt câu hỏi và cách đọc một trải bài.",
  alternates: { canonical: "/kien-thuc" },
  openGraph: { url: absoluteUrl("/kien-thuc"), title: "Kiến thức tarot" },
};

export default function KnowledgeIndex() {
  return (
    <>
      <SiteHeader back />
      <main id="noi-dung" className="mx-auto max-w-[900px] px-5 pt-7 pb-4 md:px-[60px] md:pt-14">
        <div className="flex flex-col gap-3">
          <h1 className="font-serif text-[27px]/[1.2] text-balance text-ink md:text-[46px]/[1.05]">
            Kiến thức tarot
          </h1>
          <p className="max-w-[62ch] text-sm/[1.7] text-pretty text-muted md:text-[17px]">
            Những bài viết nền, đủ để bạn tự đọc được một trải bài mà không cần ai giải hộ.
          </p>
        </div>

        <ul className="mt-9 flex flex-col gap-2.5 md:mt-12 md:gap-3.5">
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
      </main>
      <SiteFooter />
    </>
  );
}
