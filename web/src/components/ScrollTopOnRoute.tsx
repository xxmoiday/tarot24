"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

/**
 * Đưa trang về đầu mỗi khi đổi đường dẫn.
 *
 * Next mặc định giữ nguyên chỗ đang cuộn nếu phần trang mới còn nằm trong tầm
 * nhìn. Nó bỏ qua thanh điều hướng dính rồi xét tới `<main>`, mà `<main>` ở đây
 * trang nào cũng cao hơn màn hình nên luôn được tính là "còn thấy" — thành ra
 * bấm một mục ở giữa danh sách thì sang trang mới vẫn đang lơ lửng giữa trang.
 *
 * Bấm lùi hay tiến thì trả người đọc về đúng chỗ họ đang dở. Next đặt
 * `scrollRestoration` sang `manual` và không tự khôi phục cho điều hướng trong
 * ứng dụng, nên chỗ cuộn của từng trang phải tự nhớ lấy.
 *
 * Hai trường hợp cố ý không đụng tới: lần dựng đầu (tải lại trang thì trình
 * duyệt tự trả về chỗ cũ, đừng giành) và đường dẫn có neo (#) vì trình duyệt
 * tự nhảy tới neo đó.
 */
export function ScrollTopOnRoute() {
  const pathname = usePathname();
  const lastPath = useRef<string | null>(null);
  const backForward = useRef(false);
  /** Chỗ cuộn của từng đường dẫn, để lượt lùi trả lại đúng chỗ. */
  const saved = useRef(new Map<string, number>());

  useEffect(() => {
    const onPop = () => {
      backForward.current = true;
    };
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  useEffect(() => {
    const prev = lastPath.current;
    lastPath.current = pathname;
    /* Lần đầu, hoặc chỉ đổi tham số truy vấn trên cùng một trang. */
    if (prev === null || prev === pathname) return;

    /*
      Lúc này trang vẫn đang đứng ở chỗ cuộn của trang vừa rời — chính là cái
      Next không chịu bỏ — nên lượt nào cũng ghi lại được chỗ dở của trang cũ.
      html đang để scroll-behavior: smooth nên mọi lệnh cuộn phải nói rõ là
      nhảy thẳng.
    */
    saved.current.set(prev, window.scrollY);

    if (backForward.current) {
      backForward.current = false;
      window.scrollTo({ top: saved.current.get(pathname) ?? 0, behavior: "instant" });
      return;
    }

    if (window.location.hash) return;
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [pathname]);

  return null;
}
