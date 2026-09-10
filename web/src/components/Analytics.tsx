"use client";

import { usePathname } from "next/navigation";
import Script from "next/script";
import { useEffect, useRef } from "react";
import { GA_ID } from "@/lib/site";

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

/**
 * Tham số mang chuyện riêng của người rút. `q` là câu hỏi gõ nguyên văn, mang
 * từ ô hỏi ngoài trang chủ sang màn rút bài; `r` là mã bài đọc, giải ra cũng ra
 * đúng câu hỏi ấy. Cả hai nằm ngay trên thanh địa chỉ, mà GA thì đính đường dẫn
 * vào mọi sự kiện chứ không riêng lượt xem — để nguyên là mỗi lần đo lại gửi
 * kèm chuyện nhà người ta sang Google.
 */
const RIENG_TU = ["q", "r"];

/** Đường dẫn đang đứng, đã gột hai tham số trên. Chỉ gọi được ở trình duyệt. */
function duongDanSach() {
  const u = new URL(window.location.href);
  for (const k of RIENG_TU) u.searchParams.delete(k);
  return u.toString();
}

/**
 * Google Analytics.
 *
 * Khác bản dán sẵn của Google ở hai chỗ, cùng một lý do là chỗ RIENG_TU nói:
 * tắt lượt đếm tự động (`send_page_view: false`) để tự gửi lấy với đường dẫn đã
 * gột, và `gtag('set')` để những sự kiện GA tự bắn về sau — cuộn trang, bấm ra
 * ngoài, thời gian đọc — cũng đọc đường dẫn sạch ấy chứ không đọc thanh địa chỉ.
 *
 * Lượt xem đầu tiên do chính đoạn mã nhúng gửi, không đợi React: đợi thì hoặc
 * là mất lượt của người vào rồi đi ngay, hoặc là đua với chính đoạn mã nhúng.
 * React chỉ lo những lần chuyển trang sau đó.
 */
export function Analytics() {
  const pathname = usePathname();
  const daVao = useRef(false);

  useEffect(() => {
    /* Lượt đầu đã có người gửi rồi, đây chỉ ghi nhận là đã qua nó. */
    if (!daVao.current) {
      daVao.current = true;
      return;
    }
    const sach = duongDanSach();
    window.gtag?.("set", { page_location: sach });
    window.gtag?.("event", "page_view", { page_location: sach });
  }, [pathname]);

  if (!GA_ID) return null;

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
        strategy="afterInteractive"
      />
      <Script id="ga4" strategy="afterInteractive">
        {`window.dataLayer=window.dataLayer||[];
function gtag(){dataLayer.push(arguments);}
window.gtag=gtag;
gtag('js',new Date());
var u=new URL(location.href);${RIENG_TU.map((k) => `u.searchParams.delete('${k}');`).join("")}
gtag('set',{page_location:u.toString()});
gtag('config','${GA_ID}',{send_page_view:false});
gtag('event','page_view',{page_location:u.toString()});`}
      </Script>
    </>
  );
}
