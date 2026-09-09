"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { TarotCardFace } from "@/components/TarotCardFace";
import { Chip } from "@/components/ui";
import { ASPECT_LABEL, type TarotCard } from "@/lib/cards";
import type { TopicKey } from "@/lib/spreads";

export interface DrawerCard {
  card: TarotCard;
  reversed: boolean;
  positionLabel: string;
}

export function CardDrawer({
  entry,
  topic,
  onClose,
}: {
  entry: DrawerCard | null;
  topic: TopicKey;
  onClose: () => void;
}) {
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!entry) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    /* Đưa tiêu điểm vào chính khung, không vào nút đóng — nút đóng ở mobile và
       ở desktop là hai nút khác nhau, nút nào đang ẩn thì không nhận được. */
    panelRef.current?.focus();
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [entry, onClose]);

  if (!entry) return null;
  const { card, reversed, positionLabel } = entry;
  const aspect = topic === "general" ? null : { label: ASPECT_LABEL[topic], text: card.aspects[topic] };
  const keywords = (reversed ? card.reversed : card.upright).slice(0, 4);

  return (
    /*
      Máy hẹp thì đây là ngăn kéo trượt lên từ mép dưới. Máy rộng mà vẫn dán
      xuống đáy màn thì trông như bị rơi, nên từ md trở lên nó thành hộp thoại
      nằm giữa. Canh bằng flex chứ không dùng transform, vì animate-rise cũng
      chạy trên transform, hai thứ đè nhau là khung nhảy chỗ.
    */
    <div className="fixed inset-0 z-50 flex items-end justify-center md:items-center md:p-6">
      <button
        type="button"
        aria-label="Đóng"
        className="absolute inset-0 bg-deep/72 backdrop-blur-[2px]"
        onClick={onClose}
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={card.vi}
        tabIndex={-1}
        className="relative flex max-h-[86vh] w-full max-w-[560px] animate-rise flex-col gap-4.5 overflow-y-auto rounded-t-[18px] border-t border-line bg-surface px-5 pt-3 pb-6.5 shadow-drawer outline-none md:max-h-[82vh] md:rounded-[18px] md:border md:px-7 md:pt-6 md:pb-7"
      >
        {/* Thanh kéo chỉ có nghĩa với ngón tay. */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Đóng"
          className="mx-auto h-1 w-10 shrink-0 rounded-sm bg-line md:hidden"
        />
        {/* Máy rộng thì cần một nút đóng thấy được, không có mép dưới để vuốt. */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Đóng"
          className="absolute top-3.5 right-3.5 hidden size-8 items-center justify-center rounded-full text-[15px] text-muted transition-colors hover:bg-surface-2 hover:text-ink md:flex"
        >
          ✕
        </button>

        <div className="flex items-start gap-4">
          <TarotCardFace
            imageId={card.id}
            title={card.vi}
            face="up"
            reversed={reversed}
            className="w-[86px] shrink-0"
          />
          <div className="flex flex-col gap-1.5 pt-1">
            <p className="label-eyebrow text-gold">{positionLabel}</p>
            <h2 className="font-serif text-[22px] text-ink">{card.vi}</h2>
            <p className="text-[13px] text-muted">
              {card.en}
              {reversed ? " · lá ngược" : ""}
            </p>
          </div>
        </div>

        <p className="font-serif text-[17px]/[1.7] text-pretty text-ink">
          {reversed ? card.skewed : card.core}
        </p>

        <div className="flex flex-wrap gap-2">
          {keywords.map((k) => (
            <Chip key={k} tone={reversed ? "rust" : "gold"}>
              {k}
            </Chip>
          ))}
        </div>

        {aspect ? (
          <div className="flex flex-col gap-2 border-t border-line pt-4">
            <p className="label-eyebrow text-gold">Trong {aspect.label.toLowerCase()}</p>
            <p className="text-[14.5px]/[1.7] text-pretty text-ink">{aspect.text}</p>
          </div>
        ) : null}

        <Link
          href={`/la-bai/${card.slug}`}
          className="text-[15px] font-medium text-gold transition-colors hover:text-gold-hi"
        >
          Xem trang lá →
        </Link>
      </div>
    </div>
  );
}
