import Link from "next/link";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { TarotCardFace } from "@/components/TarotCardFace";
import { ButtonLink } from "@/components/ui";

export default function NotFound() {
  return (
    <>
      <SiteHeader />
      <main
        id="noi-dung"
        className="mx-auto flex min-h-[60vh] max-w-[640px] flex-col items-center justify-center gap-6 px-5 py-16 text-center"
      >
        <TarotCardFace face="down" className="w-[110px]" />
        <h1 className="font-serif text-[28px]/[1.2] text-ink md:text-[36px]">
          Lá này không có trong bộ
        </h1>
        <p className="max-w-[46ch] text-sm/[1.7] text-pretty text-muted md:text-base">
          Đường dẫn bạn vừa mở không tồn tại hoặc đã đổi. Quay về trang chủ hoặc mở thư viện 78
          lá.
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <ButtonLink href="/">Về trang chủ</ButtonLink>
          <Link
            href="/la-bai"
            className="inline-flex items-center rounded-lg border border-gold px-6 py-3 text-[15px] text-ink transition-colors hover:border-gold-hi hover:text-gold-hi"
          >
            Thư viện 78 lá
          </Link>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
