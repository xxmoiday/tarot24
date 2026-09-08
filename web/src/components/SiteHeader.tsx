import Link from "next/link";
import { BackButton } from "./BackButton";

const NAV = [
  { href: "/kieu-trai", label: "Kiểu trải" },
  { href: "/la-bai", label: "Thư viện 78 lá" },
  { href: "/kien-thuc", label: "Kiến thức" },
  { href: "/ve-tarot24", label: "Về Tarot24" },
];

/**
 * Trên desktop luôn là thanh điều hướng đầy đủ.
 * Trên mobile, trang trong hiện mũi tên quay lại đúng như thiết kế màn M2–M8.
 */
export function SiteHeader({ back = false }: { back?: boolean }) {
  return (
    <header className="sticky top-0 z-40 border-b border-line bg-bg/85 backdrop-blur-md">
      <div className="mx-auto flex h-[62px] max-w-[1440px] items-center gap-3.5 px-5 md:h-[76px] md:px-[60px]">
        {back ? (
          <div className="md:hidden">
            <BackButton />
          </div>
        ) : null}
        <Link
          href="/"
          className="font-serif text-[17px] text-gold transition-colors hover:text-gold-hi md:text-[22px]"
        >
          Tarot24
        </Link>
        <nav className="ml-auto hidden items-center gap-[34px] text-[14.5px] text-muted md:flex">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="transition-colors hover:text-gold-hi"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
