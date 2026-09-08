import Link from "next/link";
import { Disclaimer } from "./ui";
import { LEGAL_DOCS } from "@/lib/legal";

const LINKS = [
  { href: "/la-bai", label: "Thư viện 78 lá" },
  { href: "/kieu-trai", label: "Kiểu trải" },
  { href: "/kien-thuc", label: "Kiến thức" },
  { href: "/ve-tarot24", label: "Về Tarot24" },
];

const LEGAL_LINKS = [
  ...LEGAL_DOCS.map((d) => ({ href: `/${d.slug}`, label: d.label })),
  { href: "/lien-he", label: "Liên hệ" },
];

export function SiteFooter() {
  return (
    <footer className="mt-16 border-t border-line md:mt-[60px]">
      <div className="mx-auto max-w-[1440px] px-5 py-9 md:flex md:items-start md:justify-between md:gap-15 md:px-[60px] md:py-[70px]">
        <div className="flex flex-col gap-3">
          <div className="font-serif text-xl text-gold">Tarot24</div>
          <Disclaimer className="max-w-[52ch]" />
          <p className="text-[13.5px]/[1.6] text-muted">
            Xem thêm bói Lenormand tại{" "}
            <a
              href="https://lenormand24.online"
              className="text-gold transition-colors hover:text-gold-hi"
              rel="noopener"
            >
              lenormand24.online
            </a>
          </p>
        </div>
        <div className="mt-8 flex gap-x-10 gap-y-3 md:mt-0 md:gap-x-10 lg:gap-x-15">
          <nav
            aria-label="Nội dung"
            className="flex flex-col gap-3 text-[13.5px] whitespace-nowrap text-muted md:text-right"
          >
            {LINKS.map((l) => (
              <Link key={l.href} href={l.href} className="transition-colors hover:text-gold-hi">
                {l.label}
              </Link>
            ))}
          </nav>
          <nav
            aria-label="Pháp lý"
            className="flex flex-col gap-3 text-[13.5px] whitespace-nowrap text-muted md:text-right"
          >
            {LEGAL_LINKS.map((l) => (
              <Link key={l.href} href={l.href} className="transition-colors hover:text-gold-hi">
                {l.label}
              </Link>
            ))}
          </nav>
        </div>
      </div>
      <div className="mx-auto max-w-[1440px] border-t border-line px-5 py-5 md:px-[60px]">
        <p className="text-[12.5px] text-muted">
          © {new Date().getFullYear()} Tarot24. Bài luận do máy viết, dùng để tham khảo.
        </p>
      </div>
    </footer>
  );
}
