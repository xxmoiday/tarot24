import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { Disclaimer, Eyebrow } from "@/components/ui";
import { SITE, absoluteUrl, ogCover } from "@/lib/site";

const COVER_IMAGE = {
  src: "/hero/banner-tarot-mystic.webp",
  alt: "Một bàn tarot với nến, hoa khô và bộ bài trải hình quạt",
  position: "62% 48%",
};

export const metadata: Metadata = {
  title: "Về Tarot24",
  description:
    "Tarot24 là chỗ rút bài tarot tiếng Việt: một câu hỏi thật, một trải bài, và một bài luận nói thẳng chuyện của bạn đang đứng ở đâu.",
  alternates: { canonical: "/ve-tarot24" },
  openGraph: {
    url: absoluteUrl("/ve-tarot24"),
    title: "Về Tarot24",
    images: [ogCover(COVER_IMAGE.src, COVER_IMAGE.alt)],
  },
};

const BLOCKS = [
  {
    h: "Bài đọc nói thẳng",
    p: "Bài đọc ở đây không dỗ dành. Nếu trải bài nói cái cản nằm trong bạn chứ không nằm ở hoàn cảnh, thì nó sẽ nói đúng như vậy, và kết bằng một việc bạn làm được trong tuần này.",
  },
  {
    h: "Tiếng Việt của người Việt",
    p: "Nghĩa của 78 lá được viết lại bằng tiếng Việt đời thường, kèm những câu người mình hay nói. Không dịch máy, không giữ nguyên thuật ngữ tiếng Anh khi tiếng Việt đã có chữ.",
  },
  {
    h: "Không tài khoản, không thu thập",
    p: "Bạn không cần đăng nhập để rút bài. Câu hỏi và lá bài của bạn được nén thẳng vào đường dẫn khi bạn bấm chia sẻ, nên chỉ ai có link mới xem được.",
  },
  {
    h: "Dựa trên bộ hình Rider–Waite–Smith",
    p: "Toàn bộ mô tả hình vẽ và nghĩa lá dựa trên bộ Rider–Waite–Smith năm 1909, bộ hình được dùng phổ biến nhất và cũng là bộ dễ học nhất cho người mới. Ảnh 78 lá trên trang là bản quét bộ in gốc năm 1909, nay đã thuộc phạm vi công cộng.",
  },
];

export default function AboutPage() {
  return (
    <>
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

        <div className="mx-auto max-w-[760px] px-5 pt-7 md:px-[60px] md:pt-14">
          <div className="flex min-h-[260px] flex-col justify-end gap-3 pb-4 md:min-h-[360px] md:pb-8">
            <Eyebrow>Tarot24</Eyebrow>
            <h1 className="font-serif text-[33px]/[1.12] text-balance text-ink [text-shadow:0_2px_28px_rgba(8,11,19,0.85)] md:text-[54px]/[1.02]">
              Về {SITE.name}
            </h1>
            <p className="max-w-[58ch] font-serif text-[18px]/[1.7] text-pretty text-ink [text-shadow:0_1px_18px_rgba(8,11,19,0.85)] md:text-[21px]">
              {SITE.tagline}. Đặt một câu hỏi thật, rút bài, và nhận một bài luận nói thẳng
              chuyện của bạn đang đứng ở đâu.
            </p>
          </div>

          <div className="mt-7 flex flex-col gap-6 md:mt-10">
            {BLOCKS.map((b) => (
              <section key={b.h} className="flex flex-col gap-2">
                <h2 className="font-serif text-xl text-gold md:text-2xl">{b.h}</h2>
                <p className="text-[15px]/[1.8] text-pretty text-ink md:text-[16.5px]">
                  {b.p}
                </p>
              </section>
            ))}
          </div>

          <section className="mt-10 flex flex-col gap-2 rounded-xl border border-line bg-surface p-5 md:p-6">
            <h2 className="font-serif text-xl text-gold">Bói Lenormand</h2>
            <p className="text-[15px]/[1.7] text-pretty text-muted">
              Nếu bạn muốn một hệ bài khác, gọn và thẳng hơn tarot, xem thêm tại{" "}
              <a
                href="https://lenormand24.online"
                rel="noopener"
                className="text-gold transition-colors hover:text-gold-hi"
              >
                lenormand24.online
              </a>
              .
            </p>
          </section>

          <div className="mt-9 flex flex-wrap gap-4 text-[15px]">
            <Link href="/kieu-trai" className="text-gold transition-colors hover:text-gold-hi">
              Kiểu trải →
            </Link>
            <Link href="/la-bai" className="text-gold transition-colors hover:text-gold-hi">
              Thư viện 78 lá →
            </Link>
            <Link href="/kien-thuc" className="text-gold transition-colors hover:text-gold-hi">
              Kiến thức →
            </Link>
          </div>

          <Disclaimer className="mt-10 border-t border-line pt-6" />
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
