"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { CSSProperties } from "react";
import { TarotCardFace } from "@/components/TarotCardFace";

/** Kéo quá ngần này px thì coi là kéo dải bài, không tính là chạm chọn lá. */
const DRAG_SLOP = 6;

/** Một lá mất bấy nhiêu để trượt về chồng. */
const GATHER_EACH_MS = 820;

/** Lá càng xa giữa càng về trễ, nhưng trễ nhất cũng chỉ tới đây. */
const GATHER_STAGGER_MS = 220;

/** Cả cỗ thu xong sau chừng này, tính cả lá về trễ nhất. */
export const GATHER_MS = GATHER_EACH_MS + GATHER_STAGGER_MS;

export interface DeckSpreadProps {
  /** Số lá đang trải, thường là cả bộ 78. */
  total: number;
  /** Chỉ số những lá đã rút, chúng biến khỏi dải bài. */
  picked: number[];
  /** Đã rút đủ thì khoá không cho chạm nữa. */
  locked: boolean;
  /** Rút xong lá cuối: thu cả dải bài về một chồng, như vỗ bài lại ngoài đời. */
  gathering?: boolean;
  onPick: (index: number) => void;
}

/**
 * Cả bộ bài trải thành một dải dài, cuộn ngang được.
 *
 * Bộ 78 lá không thể vừa một màn nếu còn muốn chạm trúng, nên dải chỉ hiện một
 * khúc và người đọc kéo qua lại — đúng kiểu trải dải ngoài đời. Chuột không
 * "vuốt" được như ngón tay nên phải tự dựng thao tác kéo cho desktop.
 */
export function DeckSpread({
  total,
  picked,
  locked,
  gathering = false,
  onPick,
}: DeckSpreadProps) {
  const boxRef = useRef<HTMLDivElement>(null);
  const [scrollable, setScrollable] = useState(false);
  /** Vừa kéo xong thì bỏ qua cú click ngay sau đó, kẻo lỡ tay rút mất lá. */
  const draggedRef = useRef(false);
  const dragRef = useRef({ active: false, startX: 0, startLeft: 0 });

  /** Mở ra ở giữa dải để hai đầu đều lộ bài, tự nó nói là còn kéo được. */
  useEffect(() => {
    const el = boxRef.current;
    if (!el) return;
    el.scrollLeft = (el.scrollWidth - el.clientWidth) / 2;

    const check = () => setScrollable(el.scrollWidth - el.clientWidth > 8);
    check();
    const ro = new ResizeObserver(check);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  /*
    Thu bài. Quãng đường của từng lá chỉ biết được lúc này, vì nó phụ thuộc chỗ
    đang cuộn của dải bài, nên đo rồi gắn thẳng hoạt cảnh lên từng nút: gắn một
    lượt như vậy thì biến và hoạt cảnh vào cùng một khung hình, chứ để React
    dựng lại 78 nút thì lá có thể chạy trước khi biết mình phải chạy đi đâu.
  */
  useEffect(() => {
    const el = boxRef.current;
    if (!gathering || !el) return;
    const midX = el.scrollLeft + el.clientWidth / 2;
    const cards = el.querySelectorAll<HTMLElement>("button");
    let far = 1;
    cards.forEach((c) => {
      far = Math.max(far, Math.abs(midX - (c.offsetLeft + c.offsetWidth / 2)));
    });
    cards.forEach((c) => {
      const dx = midX - (c.offsetLeft + c.offsetWidth / 2);
      c.style.setProperty("--dx", `${Math.round(dx)}px`);
      c.style.setProperty("--dy", `${Math.round(14 - c.offsetTop)}px`);
      const delay = Math.round((Math.abs(dx) / far) * GATHER_STAGGER_MS);
      c.style.animation = `t24-deck-gather ${GATHER_EACH_MS}ms ${delay}ms both`;
    });
  }, [gathering]);

  const onMouseDown = useCallback((e: React.MouseEvent) => {
    const el = boxRef.current;
    if (!el || e.button !== 0) return;
    dragRef.current = {
      active: true,
      startX: e.clientX,
      startLeft: el.scrollLeft,
    };
    draggedRef.current = false;
  }, []);

  useEffect(() => {
    const move = (e: MouseEvent) => {
      const el = boxRef.current;
      if (!el || !dragRef.current.active) return;
      const dx = e.clientX - dragRef.current.startX;
      if (Math.abs(dx) > DRAG_SLOP) draggedRef.current = true;
      el.scrollLeft = dragRef.current.startLeft - dx;
      /* Chặn bôi đen chữ trong lúc kéo. */
      e.preventDefault();
    };
    const up = () => {
      dragRef.current.active = false;
      /* Nhả chuột xong, cú click bị chặn đã đi qua, trả cờ về cho lượt sau. */
      if (draggedRef.current) {
        setTimeout(() => {
          draggedRef.current = false;
        }, 0);
      }
    };
    window.addEventListener("mousemove", move);
    window.addEventListener("mouseup", up);
    return () => {
      window.removeEventListener("mousemove", move);
      window.removeEventListener("mouseup", up);
    };
  }, []);

  /**
   * Dải dài mấy nghìn px mà uốn một vòng cung duy nhất thì khúc giữa phẳng lì,
   * nhìn như bức tường. Cho nó lượn hai nhịp sóng để màn nào cũng thấy đường
   * cong, lá nghiêng theo đúng độ dốc của sóng tại chỗ nó nằm.
   */
  const shape = (i: number) => {
    const phase = (i / Math.max(total - 1, 1)) * Math.PI * 4;
    return { top: 14 - Math.sin(phase) * 13, rotate: -Math.cos(phase) * 7 };
  };

  return (
    <div className="flex flex-col gap-3">
      <p
        className={`text-center text-[13px] transition-opacity duration-200 ${
          gathering ? "text-muted opacity-0" : "text-muted"
        }`}
      >
        {scrollable
          ? `Kéo ngang để xem hết ${total} lá, chạm để rút`
          : `Cả ${total} lá đang ở đây, chạm để rút`}
      </p>

      <div className="relative">
        {/* Quầng sáng nằm dưới dải bài, không đỡ chuột nên không cản kéo. */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-2 mx-auto h-[130px] w-[280px] rounded-[50%]"
          style={{
            background:
              "radial-gradient(ellipse,rgba(201,169,97,0.10),rgba(201,169,97,0) 70%)",
          }}
        />
        <div
          ref={boxRef}
          onMouseDown={onMouseDown}
          className="no-scrollbar relative h-[152px] cursor-grab overflow-x-auto overscroll-x-contain select-none active:cursor-grabbing md:h-[182px] [--card:76px] [--step:34px] md:[--card:92px] md:[--step:40px]"
          style={
            scrollable
              ? {
                  /* Nhoè hai mép cho thấy dải bài còn chạy tiếp ra ngoài màn. */
                  maskImage:
                    "linear-gradient(90deg,transparent 0,#000 40px,#000 calc(100% - 40px),transparent 100%)",
                }
              : undefined
          }
        >
          <div
            className="relative h-full"
            style={{
              width: `calc(${total - 1} * var(--step) + var(--card) + 40px)`,
            }}
          >
            {Array.from({ length: total }, (_, i) => {
              const { top, rotate } = shape(i);
              const used = picked.includes(i);
              return (
                <button
                  key={i}
                  type="button"
                  disabled={used || locked}
                  aria-label={`Chọn lá thứ ${i + 1}`}
                  onClick={() => {
                    if (draggedRef.current) return;
                    onPick(i);
                  }}
                  /*
                    Chỉ lá đã rút mới biến mất. Trước đây khoá cả dải là mọi lá
                    cùng tàng hình, nên rút xong lá cuối là cỗ bài biến mất phụt
                    một cái — giờ nó còn phải ở lại mà thu về chồng.
                  */
                  className={`absolute w-[var(--card)] cursor-pointer transition-transform duration-200 hover:-translate-y-3 focus-visible:-translate-y-3 disabled:pointer-events-none ${
                    used ? "opacity-0" : ""
                  }`}
                  style={
                    {
                      left: `calc(${i} * var(--step) + 20px)`,
                      top,
                      rotate: `${rotate}deg`,
                      zIndex: i,
                    } as CSSProperties
                  }
                >
                  <TarotCardFace face="down" className="w-full" />
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
