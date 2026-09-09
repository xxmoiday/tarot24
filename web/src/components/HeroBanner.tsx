import Image from "next/image";
import { ButtonLink, buttonClass, Eyebrow } from "./ui";

/** Ba ảnh chạy vòng ở hero. Thay tệp trong `public/hero/` là đổi được cả trang chủ. */
const HERO_IMAGES = [
  "/hero/banner-tarot-mystic.webp",
  "/hero/banner-2.webp",
  "/hero/banner-3.webp",
];

/**
 * Một vòng chạy hết ba ảnh, phải khớp với --animate-hero-fade trong globals.css.
 * Mỗi ảnh đứng khoảng 5–7 giây, chuyển cảnh mất 1,3 giây.
 */
const CYCLE_MS = 21000;

export interface HeroBannerProps {
  /**
   * Ảnh nền hero. Đúng ba ảnh thì chúng mờ chồng nhau chạy vòng; ít hơn hoặc
   * nhiều hơn thì chỉ ảnh đầu đứng yên, vì mốc phần trăm của keyframes chia
   * sẵn cho ba.
   */
  images?: string[];
  /** Điểm neo khi ảnh bị cắt theo khung; chỉnh khi chủ thể lệch khỏi giữa. */
  position?: string;
  eyebrow?: string;
  title: string;
  description: string;
}

/**
 * Hero trang chủ: banner tràn viền chạy vòng ba ảnh, chữ nằm trên nền tối dần.
 * Ảnh là nền, không mang nghĩa, nên `alt` rỗng — nghĩa nằm ở h1 phía trên.
 */
export function HeroBanner({
  images = HERO_IMAGES,
  position = "50% 45%",
  eyebrow = "Tarot tiếng Việt · 78 lá",
  title,
  description,
}: HeroBannerProps) {
  const looping = images.length === 3;
  return (
    <section className="relative isolate overflow-hidden">
      {/* Nền dự phòng: ảnh chưa tải hay tải hụt thì hero vẫn đúng tông. */}
      <div
        aria-hidden
        className="absolute inset-0 bg-[radial-gradient(120%_95%_at_68%_38%,#151c30_0%,#0b0f1a_58%,#080b13_100%)]"
      />

      {/*
        Ảnh đầu là ảnh LCP nên nạp sớm (Next 16 thay `priority` bằng `preload`)
        và nó nằm im làm nền; hai ảnh sau chồng lên, để `lazy` cho trình duyệt
        hạ thứ tự ưu tiên, khỏi giành băng thông với ảnh đang hiển thị.

        Hoạt cảnh đặt bằng lớp chứ không phải style, để `motion-reduce` còn tắt
        được — style nội tuyến thì lớp không đè lại nổi. Tắt hoạt cảnh xong thì
        opacity ở lớp nền quyết định, nên chỉ còn ảnh đầu đứng yên.
      */}
      {(looping ? images : images.slice(0, 1)).map((src, i) => (
        <Image
          key={src}
          src={src}
          alt=""
          fill
          unoptimized
          sizes="100vw"
          {...(i === 0 ? { preload: true } : { loading: "lazy" as const })}
          className={`object-cover ${i === 0 ? "opacity-100" : "opacity-0"} ${
            looping && i > 0 ? "animate-hero-fade motion-reduce:animate-none" : ""
          }`}
          style={{
            objectPosition: position,
            animationDelay:
              looping && i > 0
                ? `${Math.round((i * CYCLE_MS) / 3)}ms`
                : undefined,
          }}
        />
      ))}

      {/* Mobile: tối dần từ đáy lên để khối chữ dưới cùng luôn đọc được. */}
      <div
        aria-hidden
        className="absolute inset-0 bg-[linear-gradient(0deg,rgba(11,15,26,0.97)_0%,rgba(11,15,26,0.86)_24%,rgba(11,15,26,0.45)_58%,rgba(11,15,26,0.12)_100%)] lg:hidden"
      />
      {/* Desktop: chữ nằm bên trái nên kéo tối theo chiều ngang. */}
      <div
        aria-hidden
        className="absolute inset-0 hidden lg:block bg-[linear-gradient(90deg,rgba(11,15,26,0.78)_0%,rgba(11,15,26,0.54)_32%,rgba(11,15,26,0.08)_64%,rgba(11,15,26,0.14)_100%)]"
      />
      {/* Mép trên nhường chỗ cho thanh điều hướng, mép dưới tan vào nền trang. */}
      <div
        aria-hidden
        className="absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-bg/35 to-transparent"
      />
      <div
        aria-hidden
        className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-bg to-transparent md:h-40"
      />

      <div className="relative mx-auto flex min-h-[520px] max-w-[1440px] flex-col px-5 pt-6 pb-11 md:min-h-[600px] md:px-[60px] md:pt-[104px] md:pb-14 lg:min-h-[680px] lg:pb-20 xl:min-h-[740px]">
        <p className="font-serif text-[19px] tracking-[0.02em] text-gold md:hidden">
          Tarot24
        </p>

        <div className="mt-auto flex max-w-[660px] flex-col items-start gap-4 md:gap-5 lg:mb-auto">
          <Eyebrow>{eyebrow}</Eyebrow>
          <h1 className="font-serif text-[34px]/[1.1] text-balance text-ink [text-shadow:0_2px_28px_rgba(8,11,19,0.8)] sm:text-[42px] lg:text-[54px] xl:text-[62px]">
            {title}
          </h1>
          <p className="max-w-[46ch] text-[15.5px]/[1.7] text-pretty text-muted [text-shadow:0_1px_18px_rgba(8,11,19,0.8)] md:text-[17px]">
            {description}
          </p>
          {/* Trên máy hẹp hai nút xếp dọc và bằng nhau, khỏi so le bề ngang. */}
          <div className="mt-1 flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:items-center md:mt-2 md:gap-4">
            {/*
              Dẫn xuống ô hỏi ngay dưới hero: câu hỏi có trước, kiểu trải được
              gợi ý ra sau, chứ không bắt chọn trải trước.

              Thẻ a trần chứ không phải Link: đây là neo trong cùng một trang,
              không phải chuyển trang, nên để trình duyệt nhảy tới neo theo cách
              của nó thay vì đi qua bộ định tuyến.
            */}
            <a
              href="#cau-hoi"
              className={buttonClass("primary", "lg", "w-full sm:w-auto")}
            >
              Bắt đầu từ câu hỏi
            </a>
            <ButtonLink
              href="/la-bai"
              size="lg"
              variant="outline"
              className="w-full sm:w-auto"
            >
              Thư viện 78 lá
            </ButtonLink>
          </div>
        </div>
      </div>
    </section>
  );
}
