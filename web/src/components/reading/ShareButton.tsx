"use client";

import { useState } from "react";
import { buttonClass } from "@/components/ui";

export function ShareButton({
  url,
  title,
  className = "",
}: {
  url: string;
  title: string;
  className?: string;
}) {
  const [copied, setCopied] = useState(false);

  async function share() {
    const absolute = new URL(url, window.location.origin).toString();
    if (navigator.share) {
      try {
        await navigator.share({ title, url: absolute });
        return;
      } catch {
        /* người dùng đóng bảng chia sẻ thì rơi xuống chép link */
      }
    }
    try {
      await navigator.clipboard.writeText(absolute);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      window.prompt("Chép đường dẫn bài đọc", absolute);
    }
  }

  return (
    <button
      type="button"
      onClick={share}
      className={buttonClass("outline", "sm", className)}
      aria-live="polite"
    >
      {copied ? "Đã chép link" : "Chia sẻ"}
    </button>
  );
}
