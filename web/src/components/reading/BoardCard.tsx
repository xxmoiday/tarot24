"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { TarotCardFace } from "@/components/TarotCardFace";
import type { DeckSpot } from "./deck-spot";

/** Lá rời cỗ bay về ô của nó hết bấy nhiêu. */
export const FLY_MS = 560;

/** Tới ô rồi còn nằm úp thêm bấy nhiêu mới lật — một nhịp nín thở. */
export const FACE_WAIT = 500;

/** Lật ngửa hết bấy nhiêu. */
export const FLIP_MS = 520;

/** Từ lúc rút tới lúc lá nằm ngửa hẳn trên bàn. */
export const REVEAL_MS = FLY_MS + FACE_WAIT + FLIP_MS;

const prefersReduced = () =>
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export interface BoardCardProps {
  /** Mã tranh trong KB; không có thì lá hiện mặt chữ. */
  imageId?: string;
  title: string;
  reversed: boolean;
  /** Chỗ lá vừa rời khỏi — chồng bài ở góc hay chính lá trong dải bài. */
  from: DeckSpot | null;
}

/**
 * Lá vừa rút, đang về chỗ của nó trên bàn.
 *
 * Ngoài đời lá rút ra không ngửa ngay: người đọc rút nó khỏi cỗ, đặt úp vào vị
 * trí của nó, rồi mới lật. Khoảng lặng giữa hai việc ấy là chỗ người ta hồi hộp,
 * nên ở đây cũng để nguyên: lá bay về ô vẫn úp, nằm im nửa giây, rồi mới lật
 * ngửa. Hai mặt lá cùng nằm trong một khung xoay, mặt nào quay đi thì khuất,
 * nên cú lật là một lá bài thật lật mình chứ không phải hai ảnh thay nhau.
 */
export function BoardCard({ imageId, title, reversed, from }: BoardCardProps) {
  const ref = useRef<HTMLDivElement>(null);
  /* Tắt hiệu ứng thì chẳng bay chẳng lật, lá nằm ngửa sẵn ở ô của nó. */
  const [up, setUp] = useState(
    () => typeof window !== "undefined" && prefersReduced(),
  );

  /*
    Cho lá bay từ chỗ nó vừa rời đi. Phải là useLayoutEffect: gắn hoạt cảnh sau
    khi màn đã vẽ thì loé mất một khung hình lá nằm sẵn ở ô.
  */
  useLayoutEffect(() => {
    const el = ref.current;
    if (!from || !el || prefersReduced()) return;
    /* Gỡ hoạt cảnh cũ rồi đọc bố cục trước khi đo, kẻo lượt chạy thứ hai đo
       chính lá đang đứng ở điểm xuất phát và ra quãng đường bằng không. */
    el.style.animation = "none";
    void el.offsetWidth;
    const r = el.getBoundingClientRect();
    el.style.setProperty("--fx", `${Math.round(from.x - (r.left + r.width / 2))}px`);
    el.style.setProperty("--fy", `${Math.round(from.y - (r.top + r.height / 2))}px`);
    el.style.setProperty("--fs", (from.w / r.width).toFixed(3));
    el.style.animation = `t24-card-fly ${FLY_MS}ms both`;
  }, [from]);

  useEffect(() => {
    if (prefersReduced()) return;
    const t = setTimeout(() => setUp(true), (from ? FLY_MS : 0) + FACE_WAIT);
    return () => clearTimeout(t);
  }, [from]);

  return (
    /* z-10 để lá đang bay đi trên đầu mấy ô còn trống chứ không lách xuống dưới. */
    <div ref={ref} className="relative z-10 w-full [perspective:900px]">
      <div
        className={`relative transition-transform ease-out [transform-style:preserve-3d] ${
          up ? "[transform:rotateY(180deg)]" : ""
        }`}
        style={{ transitionDuration: `${FLIP_MS}ms` }}
      >
        <TarotCardFace
          face="down"
          className="w-full [backface-visibility:hidden]"
        />
        <TarotCardFace
          imageId={imageId}
          title={title}
          face="up"
          reversed={reversed}
          className="absolute inset-0 w-full [backface-visibility:hidden] [transform:rotateY(180deg)]"
        />
      </div>
    </div>
  );
}
