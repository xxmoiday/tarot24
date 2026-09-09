import Link from "next/link";
import { BackButton } from "./BackButton";
import { SiteLogo } from "./SiteLogo";

const NAV = [
  { href: "/kieu-trai", label: "Kiểu trải" },
  { href: "/la-bai", label: "Thư viện 78 lá" },
  { href: "/kien-thuc", label: "Kiến thức" },
  { href: "/ve-tarot24", label: "Về Tarot24" },
];

/**
 * Trên desktop luôn là thanh điều hướng đầy đủ.
 * Trên mobile, trang trong hiện mũi tên quay lại đúng như thiết kế màn M2–M8.
 *
 * `overlay` dành cho trang chủ: thanh nằm đè lên hero banner, nền chỉ là một
 * lớp tối mờ dần nên ảnh vẫn chạy hết lên mép trên màn hình. Ở đó thanh cuộn
 * đi cùng hero — trang chủ vốn đã bọc header trong một div nên `sticky` chưa
 * từng có tác dụng, `relative` chỉ nói đúng chuyện đang xảy ra.
 */
export function SiteHeader({
  back = false,
  overlay = false,
}: {
  back?: boolean;
  overlay?: boolean;
}) {
  return (
    <header
      className={
        overlay
          ? "relative z-40 bg-gradient-to-b from-bg/70 via-bg/25 to-transparent"
          : "sticky top-0 z-40 border-b border-line bg-bg/85 backdrop-blur-md"
      }
    >
      <div className="mx-auto flex h-[62px] max-w-[1440px] items-center gap-3.5 px-5 md:h-[76px] md:px-[60px]">
        {back ? (
          <div className="md:hidden">
            <BackButton />
          </div>
        ) : null}
        <Link
          href="/"
          className="group transition-colors"
          aria-label="Tarot24"
        >
          <SiteLogo />
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
