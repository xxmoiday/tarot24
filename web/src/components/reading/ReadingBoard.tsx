"use client";

import { useState } from "react";
import { TarotCardFace } from "@/components/TarotCardFace";
import type { TarotCard } from "@/lib/cards";
import { getLayout, type Spread, type TopicKey } from "@/lib/spreads";
import { CardDrawer, type DrawerCard } from "./CardDrawer";

export interface BoardCard {
  card: TarotCard;
  reversed: boolean;
  /** Số thứ tự vị trí, dùng để nối lá với đoạn bài luận nói về nó */
  stt: number;
  /** Tên đầy đủ của vị trí, dùng ở chú giải và ngăn chi tiết */
  positionLabel: string;
  /** Nhãn rút gọn hiện ngay dưới lá */
  positionShort?: string;
}

/** Bày lá đã rút theo đúng kiểu trải, chạm vào một lá thì mở ngăn chi tiết. */
export function ReadingBoard({
  cards,
  spread,
  topic,
  size = "md",
  onReadPart,
}: {
  cards: BoardCard[];
  spread: Spread;
  topic: TopicKey;
  size?: "md" | "lg";
  /** Nhảy tới đoạn bài luận nói về vị trí này; không có thì ngăn không mời. */
  onReadPart?: (stt: number) => void;
}) {
  const [open, setOpen] = useState<DrawerCard | null>(null);

  const drawer = (
    <CardDrawer
      entry={open}
      topic={topic}
      onClose={() => setOpen(null)}
      onReadPart={
        onReadPart
          ? (stt) => {
              setOpen(null);
              onReadPart(stt);
            }
          : undefined
      }
    />
  );

  const cardButton = (c: BoardCard, i: number, extra = "", style?: React.CSSProperties) => (
    <button
      key={`${c.card.slug}-${i}`}
      type="button"
      onClick={() => setOpen(c)}
      aria-label={`${c.positionLabel}: ${c.card.vi}${c.reversed ? ", lá ngược" : ""}`}
      className={`group block w-full cursor-pointer rounded-[10px] transition-transform duration-200 hover:-translate-y-1 focus-visible:-translate-y-1 ${extra}`}
      style={style}
    >
      <TarotCardFace
        imageId={c.card.id}
        title={c.card.vi}
        face="up"
        reversed={c.reversed}
        className="w-full animate-fly"
      />
    </button>
  );

  const layout = getLayout(spread.layout);

  /* Các kiểu trải có hình riêng: đặt lá theo toạ độ, đánh số và kèm chú giải. */
  if (layout) {
    return (
      <>
        <div className="mx-auto w-full max-w-[560px]">
          <div
            className="relative w-full"
            style={{ aspectRatio: `${layout.ratio[0]} / ${layout.ratio[1]}` }}
          >
            {cards.map((c, i) => {
              const pos = layout.points[i] ?? layout.points[0];
              return (
                <div
                  key={`${c.card.slug}-${i}`}
                  className="absolute"
                  style={{
                    left: `${pos.x}%`,
                    top: `${pos.y}%`,
                    width: `${layout.cardWidth}%`,
                    zIndex: pos.z ?? 1,
                    transform: `translate(-50%,-50%) rotate(${pos.rotate ?? 0}deg)`,
                  }}
                >
                  {cardButton(c, i)}
                  <span
                    className="absolute -top-1 -left-1 z-5 flex size-[17px] items-center justify-center rounded-full border border-gold bg-bg text-[10px] text-gold"
                    style={{ transform: `rotate(${-(pos.rotate ?? 0)}deg)` }}
                  >
                    {c.stt}
                  </span>
                </div>
              );
            })}
          </div>
          <ol className="mt-6 grid gap-x-4.5 gap-y-2.5 rounded-xl border border-line bg-surface p-4.5 sm:grid-cols-2">
            {cards.map((c, i) => (
              <li key={i} className="flex gap-2 text-[12.5px] text-ink">
                <span className="w-[15px] shrink-0 text-gold">{c.stt}</span>
                {c.positionLabel}
              </li>
            ))}
          </ol>
        </div>
        {drawer}
      </>
    );
  }

  if (spread.layout === "single") {
    const c = cards[0];
    return (
      <>
        <div className="relative flex w-full justify-center">
          <div
            aria-hidden
            className="absolute top-1/2 left-1/2 size-[280px] -translate-x-1/2 -translate-y-1/2 rounded-full"
            style={{
              background:
                "radial-gradient(circle,rgba(201,169,97,0.10),rgba(201,169,97,0) 70%)",
            }}
          />
          {c ? (
            <div className={`relative ${size === "lg" ? "w-[200px]" : "w-[168px]"}`}>
              {cardButton(c, 0)}
            </div>
          ) : null}
        </div>
        {drawer}
      </>
    );
  }

  return (
    <>
      <div
        className="grid gap-2 sm:gap-3"
        style={{ gridTemplateColumns: `repeat(${cards.length}, minmax(0, 1fr))` }}
      >
        {cards.map((c, i) => (
          <div key={`${c.card.slug}-${i}`} className="flex flex-col items-center gap-2">
            {cardButton(c, i)}
            <span className="text-center text-[10px] font-medium tracking-[0.1em] text-muted uppercase sm:text-[11px] sm:tracking-[0.12em]">
              {c.positionShort ?? c.positionLabel}
            </span>
          </div>
        ))}
      </div>
      {drawer}
    </>
  );
}
