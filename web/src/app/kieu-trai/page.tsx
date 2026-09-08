import type { Metadata } from "next";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { SpreadCard } from "@/components/SpreadCard";
import { Eyebrow } from "@/components/ui";
import { absoluteUrl } from "@/lib/site";
import { SPREADS } from "@/lib/spreads";

export const metadata: Metadata = {
  title: "Kiểu trải bài tarot",
  description:
    "Mười một kiểu trải bài tarot tiếng Việt: một lá, ba lá quá khứ hiện tại tương lai, năm lá tình cảm, Thập tự Celtic và các trải chuyên đề.",
  alternates: { canonical: "/kieu-trai" },
  openGraph: { url: absoluteUrl("/kieu-trai"), title: "Kiểu trải bài tarot" },
};

export default function SpreadsPage() {
  const basic = SPREADS.filter((s) => s.group === "basic");
  const topical = SPREADS.filter((s) => s.group === "topic");

  return (
    <>
      <SiteHeader back />
      <main id="noi-dung" className="mx-auto max-w-[1440px] px-5 pt-7 pb-4 md:px-[60px] md:pt-14">
        <div className="flex flex-col gap-3">
          <h1 className="font-serif text-[27px]/[1.2] text-balance text-ink md:text-[46px]/[1.05]">
            Kiểu trải
          </h1>
          <p className="max-w-[62ch] text-sm/[1.7] text-pretty text-muted md:text-[17px]">
            Chọn kiểu trải theo cỡ của câu hỏi. Một lá cho chuyện trong ngày, ba lá cho một
            mạch, năm lá khi có nhiều bên, mười lá cho một chuyện lớn.
          </p>
        </div>

        <section className="mt-9 flex flex-col gap-4 md:mt-14 md:gap-6">
          <Eyebrow>Cơ bản</Eyebrow>
          <div className="grid gap-2.5 md:grid-cols-3 md:gap-4.5">
            {basic.map((s) => (
              <SpreadCard key={s.slug} spread={s} />
            ))}
          </div>
        </section>

        <section className="mt-8 flex flex-col gap-4 md:mt-14 md:gap-6">
          <Eyebrow>Chuyên đề</Eyebrow>
          <div className="grid gap-2.5 md:grid-cols-3 md:gap-4.5">
            {topical.map((s) => (
              <SpreadCard key={s.slug} spread={s} />
            ))}
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
