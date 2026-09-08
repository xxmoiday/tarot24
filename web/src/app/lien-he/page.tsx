import type { Metadata } from "next";
import Link from "next/link";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { Eyebrow } from "@/components/ui";
import { LEGAL_DOCS, LEGAL_EMAIL } from "@/lib/legal";
import { SITE, absoluteUrl } from "@/lib/site";

export const metadata: Metadata = {
  title: "Liên hệ",
  description:
    "Cách viết thư cho Tarot24: xoá bài đọc, báo nội dung sai, hỏi về bản quyền, hoặc góp ý.",
  alternates: { canonical: "/lien-he" },
  openGraph: {
    title: "Liên hệ",
    description: "Cách viết thư cho Tarot24.",
    url: absoluteUrl("/lien-he"),
  },
};

const REASONS = [
  {
    h: "Xoá bài đọc của bạn",
    p: "Gửi kèm đường dẫn /doc/… của bài cần xoá. Vì trang không có tài khoản nên đường dẫn là thứ duy nhất xác định được bài của bạn. Chúng tôi xoá trong vòng 7 ngày làm việc rồi báo lại.",
  },
  {
    h: "Nội dung sai hoặc gây hiểu nhầm",
    p: "Thấy một nghĩa lá viết sai, một bài luận đi quá xa, hay một chỗ nào đó nói như thể thay được lời khuyên bác sĩ, hãy chỉ giúp chúng tôi đường dẫn và đoạn chữ cụ thể.",
  },
  {
    h: "Bản quyền",
    p: "Nếu bạn cho rằng một nội dung trên trang xâm phạm quyền của bạn, viết thư kèm đường dẫn, phần nội dung liên quan và căn cứ quyền sở hữu. Chúng tôi gỡ trước, làm rõ sau.",
  },
  {
    h: "Góp ý, lỗi kỹ thuật, hợp tác",
    p: "Trang chạy chậm, bài không hiện, chữ vỡ trên máy của bạn, hoặc bạn muốn dùng lại nội dung: cứ viết thư, mô tả càng cụ thể càng nhanh xử lý.",
  },
];

export default function ContactPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ContactPage",
    name: "Liên hệ Tarot24",
    inLanguage: "vi-VN",
    mainEntityOfPage: absoluteUrl("/lien-he"),
    publisher: { "@type": "Organization", name: SITE.name, email: LEGAL_EMAIL },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <SiteHeader back />
      <main id="noi-dung" className="mx-auto max-w-[760px] px-5 pt-7 pb-4 md:px-[60px] md:pt-14">
        <h1 className="font-serif text-[28px]/[1.18] text-balance text-ink md:text-[42px]/[1.1]">
          Liên hệ
        </h1>
        <p className="mt-4 font-serif text-[18px]/[1.7] text-pretty text-ink md:text-[21px]">
          Tarot24 chưa có biểu mẫu liên hệ, vì trang cố ý không thu thập gì của bạn. Một lá thư
          là đủ.
        </p>

        <section className="mt-8 flex flex-col gap-3 rounded-xl border border-gold/40 bg-gold/6 p-5 md:p-6">
          <Eyebrow>Thư về</Eyebrow>
          <a
            href={`mailto:${LEGAL_EMAIL}`}
            className="font-serif text-[22px] break-all text-gold transition-colors hover:text-gold-hi md:text-[26px]"
          >
            {LEGAL_EMAIL}
          </a>
          <p className="text-[14px]/[1.7] text-muted">
            Thường trả lời trong 3–7 ngày làm việc. Thư tiếng Việt hoặc tiếng Anh đều được.
          </p>
        </section>

        <div className="mt-9 flex flex-col gap-6 md:mt-12">
          {REASONS.map((r) => (
            <section key={r.h} className="flex flex-col gap-2">
              <h2 className="font-serif text-xl text-gold md:text-2xl">{r.h}</h2>
              <p className="text-[15px]/[1.8] text-pretty text-ink md:text-[16.5px]">{r.p}</p>
            </section>
          ))}
        </div>

        <section className="mt-10 flex flex-col gap-2 rounded-xl border border-line bg-surface p-5 md:p-6">
          <h2 className="font-serif text-xl text-gold">Đừng gửi qua thư</h2>
          <p className="text-[15px]/[1.7] text-pretty text-muted">
            Đừng gửi cho chúng tôi giấy tờ tuỳ thân, thông tin ngân hàng, bệnh án hay mật khẩu.
            Không có việc gì trên trang này cần tới những thứ đó. Nếu bạn đang trong tình huống
            khẩn cấp, hãy gọi cấp cứu 115 thay vì viết thư.
          </p>
        </section>

        <section className="mt-10 flex flex-col gap-4 border-t border-line pt-8">
          <Eyebrow>Đọc kèm</Eyebrow>
          <div className="grid gap-2.5 md:grid-cols-3">
            {LEGAL_DOCS.map((d) => (
              <Link
                key={d.slug}
                href={`/${d.slug}`}
                className="rounded-xl border border-line bg-surface p-4 text-[14.5px]/[1.4] text-ink transition-colors hover:border-gold/50"
              >
                {d.label}
              </Link>
            ))}
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
