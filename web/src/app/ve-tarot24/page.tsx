import type { Metadata } from "next";
import Link from "next/link";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { Disclaimer } from "@/components/ui";
import { SITE, absoluteUrl } from "@/lib/site";

export const metadata: Metadata = {
  title: "Về Tarot24",
  description:
    "Tarot24 là chỗ rút bài tarot tiếng Việt: một câu hỏi thật, một trải bài, và một bài luận nói thẳng chuyện của bạn đang đứng ở đâu.",
  alternates: { canonical: "/ve-tarot24" },
  openGraph: { url: absoluteUrl("/ve-tarot24"), title: "Về Tarot24" },
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
      <main id="noi-dung" className="mx-auto max-w-[760px] px-5 pt-7 pb-4 md:px-[60px] md:pt-14">
        <h1 className="font-serif text-[28px]/[1.18] text-balance text-ink md:text-[42px]/[1.1]">
          Về {SITE.name}
        </h1>
        <p className="mt-4 font-serif text-[18px]/[1.7] text-pretty text-ink md:text-[21px]">
          {SITE.tagline}. Đặt một câu hỏi thật, rút bài, và nhận một bài luận nói thẳng chuyện
          của bạn đang đứng ở đâu.
        </p>

        <div className="mt-9 flex flex-col gap-6 md:mt-12">
          {BLOCKS.map((b) => (
            <section key={b.h} className="flex flex-col gap-2">
              <h2 className="font-serif text-xl text-gold md:text-2xl">{b.h}</h2>
              <p className="text-[15px]/[1.8] text-pretty text-ink md:text-[16.5px]">{b.p}</p>
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
      </main>
      <SiteFooter />
    </>
  );
}
