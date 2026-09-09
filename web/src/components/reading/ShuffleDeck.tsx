"use client";

import type { CSSProperties } from "react";
import { TarotCardFace } from "@/components/TarotCardFace";

/** Thời lượng phần chuyển động, mọi kiểu xào đều gói gọn trong bấy nhiêu. */
const ANIM_MS = 2200;

/** Nghỉ trên chồng bài vừa xào xong trước khi mở bộ bài ra cho chạm chọn. */
const HOLD_MS = 500;

/** Cả bước xào bài kéo dài bấy nhiêu, tính cả nhịp nghỉ cuối. */
export const SHUFFLE_MS = ANIM_MS + HOLD_MS;

/** Rút gọn còn một nhịp khi người dùng tắt hiệu ứng chuyển động. */
export const SHUFFLE_MS_REDUCED = 550;

interface Phase {
  text: string;
  at: number;
  last: number;
}

/** Câu chốt, dùng chung cho mọi kiểu, đứng nguyên suốt nhịp nghỉ cuối. */
const READY: Phase = { text: "Bài đã sẵn sàng", at: 2150, last: 1200 };

interface ShuffleStyle {
  key: string;
  /** Tên keyframes trong globals.css. */
  keyframes: string;
  cards: number;
  /** Bề ngang mỗi lá; kiểu rải rộng thì lá nhỏ lại cho đỡ chồng lên nhau. */
  card?: number;
  /** Biến CSS riêng của từng lá, khớp với keyframes của kiểu đó. */
  vars: (i: number, cards: number) => Record<string, string>;
  /** Kiểu nào chạy theo lượt thì mỗi lá có độ trễ và thời lượng riêng. */
  each?: number;
  delay?: (i: number, cards: number) => number;
  phases: Phase[];
}

/** Chỗ đứng của lá so với giữa chồng, dùng để xếp chồng bài cho có bề dày. */
const stackOffset = (i: number, cards: number) => String(i - (cards - 1) / 2);

/** Cọc nào trong ba cọc, chia theo khối liền nhau chứ không xen kẽ. */
const pileOf = (i: number, cards: number) =>
  Math.min(2, Math.floor((i / cards) * 3));

const SHUFFLES: ShuffleStyle[] = [
  {
    key: "riffle",
    keyframes: "t24-riffle",
    cards: 14,
    vars: (i, cards) => ({
      "--c": stackOffset(i, cards),
      /* Chẻ bài thì hai nửa xen kẽ nhau, đúng kiểu chẻ thật. */
      "--dir": i % 2 ? "1" : "-1",
      /* Cắt cỗ thì nửa trên mới là phần được nhấc lên. */
      "--cut": i >= cards / 2 ? "1" : "0",
    }),
    phases: [
      { text: "Đang chẻ bài…", at: 0, last: 1050 },
      { text: "Đang cắt cỗ…", at: 1050, last: 580 },
      { text: "Đang xòe lại…", at: 1630, last: 520 },
    ],
  },
  {
    key: "overhand",
    keyframes: "t24-overhand",
    cards: 15,
    each: 880,
    /* Tệp trên cùng rời chồng trước, ba tệp nối đuôi nhau. */
    delay: (i, cards) => (2 - pileOf(i, cards)) * 640,
    vars: (i, cards) => ({
      "--c": stackOffset(i, cards),
      /* Tệp giữa dồn sang trái, hai tệp kia sang phải, cho đỡ đều đều một bên. */
      "--dir": pileOf(i, cards) === 1 ? "-1" : "1",
    }),
    phases: [
      { text: "Đang tráo dồn…", at: 0, last: 1180 },
      { text: "Dồn thêm nhịp nữa…", at: 1180, last: 970 },
    ],
  },
  {
    key: "wash",
    keyframes: "t24-wash",
    cards: 18,
    card: 92,
    vars: (i, cards) => {
      /*
       * Góc vàng cho các lá tản đều chứ không dồn cục. Ba điểm rơi cùng nằm
       * trên một hình bầu dục nhưng lệch pha, nên cả cỗ trông như đang xoay.
       */
      const a = i * 2.39996;
      const point = (turn: number) => ({
        x: Math.cos(a + turn) * 118,
        y: Math.sin(a + turn) * 46,
      });
      const p1 = point(0);
      const p2 = point(0.75);
      const p3 = point(1.5);
      return {
        "--c": stackOffset(i, cards),
        "--x1": p1.x.toFixed(1),
        "--y1": p1.y.toFixed(1),
        "--r1": (Math.sin(a * 3) * 24).toFixed(1),
        "--x2": p2.x.toFixed(1),
        "--y2": p2.y.toFixed(1),
        "--r2": (Math.cos(a * 2) * 21).toFixed(1),
        "--x3": p3.x.toFixed(1),
        "--y3": p3.y.toFixed(1),
        "--r3": (Math.sin(a + 1) * 18).toFixed(1),
      };
    },
    phases: [
      { text: "Đang xoa bài…", at: 0, last: 1300 },
      { text: "Gom bài lại…", at: 1300, last: 850 },
    ],
  },
  {
    key: "piles",
    keyframes: "t24-piles",
    cards: 15,
    card: 96,
    vars: (i, cards) => {
      const p = pileOf(i, cards);
      return {
        "--c": stackOffset(i, cards),
        "--p": String(p),
        "--side": String(p - 1),
      };
    },
    phases: [
      { text: "Chia ba cọc…", at: 0, last: 900 },
      { text: "Đổi chỗ ba cọc…", at: 900, last: 800 },
      { text: "Chồng lại…", at: 1700, last: 450 },
    ],
  },
];

/**
 * Cỗ bài tự xào trước khi mở ra cho chạm chọn.
 *
 * Mỗi lượt chạy một trong bốn kiểu — chẻ bài, tráo dồn, xoa bài, chia ba cọc —
 * để người rút nhiều lần không thấy lặp. Kiểu nào là do seed xào bài quyết
 * định chứ không bốc bằng Math.random lúc dựng: seed vốn đã ngẫu nhiên, mà cách
 * này thì máy chủ với trình duyệt luôn dựng ra cùng một thứ.
 *
 * Cả cỗ dùng chung một bộ keyframes của kiểu đang chạy, khác nhau ở mấy biến
 * CSS truyền vào từng lá.
 */
export function ShuffleDeck({ seed }: { seed: number }) {
  const style = SHUFFLES[Math.abs(seed) % SHUFFLES.length];
  const cardW = style.card ?? 108;

  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center gap-12 px-5">
      <div
        className="relative h-[168px] [--wash:0.85] [perspective:1000px] sm:[--wash:1] [--fan:9px] sm:[--fan:13px]"
        style={{ width: cardW }}
      >
        <div
          aria-hidden
          /* Quầng còn phình thêm 15% lúc sáng nhất nên chừa mép, kẻo tràn ngang. */
          className="absolute -inset-x-20 top-8 h-[140px] rounded-[50%]"
          style={{
            background:
              "radial-gradient(ellipse,rgba(201,169,97,0.22),rgba(201,169,97,0) 70%)",
            animation: `t24-deck-glow ${ANIM_MS}ms ease-in-out both`,
          }}
        />
        {Array.from({ length: style.cards }, (_, i) => (
          <TarotCardFace
            key={i}
            face="down"
            className="absolute inset-x-0 top-0 will-change-transform"
            style={
              {
                ...style.vars(i, style.cards),
                zIndex: i,
                animation: `${style.keyframes} ${style.each ?? ANIM_MS}ms both ${
                  style.delay?.(i, style.cards) ?? 0
                }ms`,
              } as CSSProperties
            }
          />
        ))}
      </div>

      {/* Các câu nằm chồng lên nhau một ô, thay phiên hiện nên không xô chữ. */}
      <div aria-hidden className="grid text-sm text-muted">
        {[...style.phases, READY].map((p) => (
          <span
            key={p.text}
            className="col-start-1 row-start-1 text-center motion-reduce:hidden"
            style={{ animation: `t24-say ${p.last}ms ease both ${p.at}ms` }}
          >
            {p.text}
          </span>
        ))}
        {/* Tắt chuyển động thì mọi câu trên đứng ở khung cuối, tức là ẩn. */}
        <span className="col-start-1 row-start-1 hidden text-center motion-reduce:block">
          Đang xào bài…
        </span>
      </div>
      <p role="status" className="sr-only">
        Đang xào bài
      </p>
    </div>
  );
}
