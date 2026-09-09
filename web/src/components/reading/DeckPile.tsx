"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import type {
  CSSProperties,
  KeyboardEvent as ReactKeyboardEvent,
  PointerEvent as ReactPointerEvent,
} from "react";
import { TarotCardFace } from "@/components/TarotCardFace";
import { spotOf, type DeckSpot } from "./deck-spot";

/** Số lá vẽ trong chồng. Đủ dày để thấy bề dày cỗ, ít để còn xoè kịp ngón tay. */
const STACK = 14;

/** Bề dày một lá nhìn từ trước: chồng bài nhích lên và lệch trái từng chút. */
const LIFT = 0.9;
const SKEW = 0.35;

/** Nhúc nhích quá ngần này px thì coi là đang kéo, không còn là chạm rút nữa. */
const TAP_SLOP = 6;

/** Kéo sang phải tới đây thì thả tay ra là xoè; chưa tới thì cỗ khép lại. */
const FAN_MIN = 48;

/** Quãng kéo mà cỗ đã hé hết cỡ. Kéo xa hơn nữa cũng không mở thêm được. */
const FAN_FULL = 132;

/** Kéo hụt thì cỗ khép lại trong bấy nhiêu. */
const SNAP_MS = 260;

/** Cỗ bài rời bàn xào về góc trái hết bấy nhiêu. */
const LAND_MS = 620;

const clamp = (v: number, lo: number, hi: number) =>
  Math.max(lo, Math.min(hi, v));

const prefersReduced = () =>
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export interface DeckPileProps {
  /** Cả cỗ có bao nhiêu lá. */
  total: number;
  /** Đã rút ra mấy lá — chồng còn lại mỏng đi theo. */
  taken: number;
  /** Rút đủ rồi thì khoá, không chạm cũng không xoè được nữa. */
  locked: boolean;
  /** Chỗ cỗ bài vừa đứng ở màn xào; có thì cỗ bay từ đó về đây. */
  from: DeckSpot | null;
  /** Rút xong rồi: đẩy cỗ còn lại sang bên như người đọc vẫn làm. */
  aside?: boolean;
  /** Kéo sang phải đủ xa: trải cả cỗ ra cho người rút tự chọn. */
  onFan: () => void;
  /** Chạm vào cỗ: rút lá trên cùng, kèm chỗ nó rời cỗ để lá bay từ đúng đó. */
  onDraw: (from: DeckSpot) => void;
}

/**
 * Cỗ bài úp nằm ở góc trái bàn, chưa xoè.
 *
 * Ngoài đời rút bài đâu phải lúc nào cũng trải cả bộ ra: có người chỉ cắt cỗ
 * rồi lật lá trên cùng. Nên cỗ nằm nguyên đó, chạm vào là rút lá trên xuống —
 * còn ai muốn tự chọn thì giữ tay lên cỗ kéo sang phải, cỗ hé ra theo ngón tay,
 * kéo đủ xa rồi buông là nó trải thành dải bài như cũ.
 */
export function DeckPile({
  total,
  taken,
  locked,
  from,
  aside = false,
  onFan,
  onDraw,
}: DeckPileProps) {
  const pileRef = useRef<HTMLDivElement>(null);
  /** Cỗ đã hé ra bao nhiêu px theo ngón tay. */
  const [pull, setPull] = useState(0);
  /** Kéo hụt: cỗ đang tự khép lại, lúc này lá mới cần chạy có nhịp. */
  const [snapping, setSnapping] = useState(false);
  /**
   * Cỗ còn đang bay về góc thì chưa nhận tay. Tắt hiệu ứng thì chẳng có cú bay
   * nào, cỗ nằm sẵn ở góc và chạm được ngay.
   */
  const [landing, setLanding] = useState(
    () => from !== null && typeof window !== "undefined" && !prefersReduced(),
  );
  const drag = useRef<{ id: number; x0: number; moved: boolean } | null>(null);
  const snapTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  /*
    Đón cỗ bài từ màn xào: đo chỗ nó vừa đứng rồi cho nó bay về đúng đây. Phải
    là useLayoutEffect — bước rút bài chỉ hiện ra sau khi người rút bấm nút nên
    thành phần này không bao giờ dựng ở máy chủ, mà gắn hoạt cảnh sau khi màn đã
    vẽ thì loé mất một khung hình cỗ bài nằm sẵn ở góc.
  */
  useLayoutEffect(() => {
    const el = pileRef.current;
    if (!from || !el || prefersReduced()) return;
    /*
      Gỡ hoạt cảnh cũ rồi đọc một thuộc tính bố cục trước khi đo. Không có nhịp
      này thì lượt chạy thứ hai — StrictMode gọi lại, hay `from` đổi — sẽ đo
      chính lá bài đang đứng ở điểm xuất phát của lượt trước, ra quãng đường
      bằng không, và cỗ bài đứng ỳ ở góc thay vì bay về. Nó cũng là nhịp cần có
      để gán lại đúng tên hoạt cảnh cũ mà nó vẫn chạy lại.
    */
    el.style.animation = "none";
    void el.offsetWidth;
    const r = el.getBoundingClientRect();
    el.style.setProperty("--lx", `${Math.round(from.x - (r.left + r.width / 2))}px`);
    el.style.setProperty("--ly", `${Math.round(from.y - (r.top + r.height / 2))}px`);
    el.style.setProperty("--ls", (from.w / r.width).toFixed(3));
    el.style.animation = `t24-deck-land ${LAND_MS}ms cubic-bezier(0.32,0.72,0.2,1) both`;
    const t = setTimeout(() => setLanding(false), LAND_MS);
    return () => clearTimeout(t);
  }, [from]);

  useEffect(() => () => clearTimeout(snapTimer.current), []);

  const snapBack = useCallback(() => {
    setSnapping(true);
    setPull(0);
    clearTimeout(snapTimer.current);
    snapTimer.current = setTimeout(() => setSnapping(false), SNAP_MS);
  }, []);

  const onPointerDown = useCallback(
    (e: ReactPointerEvent<HTMLElement>) => {
      if (locked || landing) return;
      e.currentTarget.setPointerCapture(e.pointerId);
      clearTimeout(snapTimer.current);
      setSnapping(false);
      drag.current = { id: e.pointerId, x0: e.clientX, moved: false };
    },
    [landing, locked],
  );

  const onPointerMove = useCallback((e: ReactPointerEvent<HTMLElement>) => {
    const d = drag.current;
    if (!d || d.id !== e.pointerId) return;
    const dx = e.clientX - d.x0;
    if (Math.abs(dx) > TAP_SLOP) d.moved = true;
    /* Chỉ chiều sang phải mới mở cỗ ra; kéo ngược lại thì cỗ cứ nằm khép. */
    setPull(clamp(dx, 0, FAN_FULL));
  }, []);

  const onPointerUp = useCallback(
    (e: ReactPointerEvent<HTMLElement>) => {
      const d = drag.current;
      if (!d || d.id !== e.pointerId) return;
      drag.current = null;
      /* Đặt tay xuống rồi nhấc lên tại chỗ: rút lá trên cùng. */
      if (!d.moved) {
        setPull(0);
        onDraw(spotOf(e.currentTarget));
        return;
      }
      if (e.clientX - d.x0 >= FAN_MIN) {
        onFan();
        return;
      }
      snapBack();
    },
    [onDraw, onFan, snapBack],
  );

  const onKeyDown = useCallback(
    (e: ReactKeyboardEvent<HTMLElement>) => {
      if (locked || landing) return;
      if (e.key === "ArrowRight") {
        e.preventDefault();
        onFan();
        return;
      }
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        onDraw(spotOf(e.currentTarget));
      }
    },
    [landing, locked, onDraw, onFan],
  );

  /** Cỗ mỏng đi theo số lá đã rút, nhưng vẫn phải còn ra dáng một cỗ bài. */
  const con = Math.max(total - taken, 1);
  const day = Math.max(Math.round((con / Math.max(total, 1)) * STACK), 6);

  const hint = locked
    ? "Đã rút đủ lá"
    : pull >= FAN_MIN
      ? `Thả tay ra là xoè cả ${con} lá`
      : pull > 0
        ? "Kéo thêm chút nữa để xoè cả cỗ"
        : "Chạm cỗ bài để rút lá trên cùng · kéo sang phải để xoè cả cỗ";

  return (
    /*
      Máy hẹp: cỗ nằm mép trái, dòng nhắc xuống dưới. Máy rộng: cỗ lên mặt bàn
      cùng khung với hàng ô bài chứ không dán mép màn nữa — cỗ bài đặt ở góc
      bàn, không phải góc phòng — và dòng nhắc sang đứng cạnh nó. Câu ấy nói về
      cỗ bài, mà canh giữa màn thì nó đứng cách cái nó đang nói tới cả gang.
    */
    <div className="mx-auto flex w-full max-w-[720px] flex-col gap-3 md:flex-row md:items-center md:gap-8">
      <div className="relative h-[150px] w-full shrink-0 md:h-[176px] md:w-[176px]">
        <div
          ref={pileRef}
          role="button"
          tabIndex={locked || landing ? -1 : 0}
          aria-label={`Cỗ bài, còn ${con} lá. Chạm hoặc bấm Enter để rút lá trên cùng. Kéo sang phải hoặc bấm mũi tên phải để xoè cả cỗ ra mà tự chọn.`}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
          onKeyDown={onKeyDown}
          /*
            touch-none vì kéo ngang ở đây là thao tác xoè bài, để trình duyệt
            hiểu thành cuộn trang thì cỗ chẳng bao giờ hé ra được.
          */
          className={`absolute top-2 left-5 h-[129px] w-[86px] touch-none select-none transition-[translate,opacity] duration-300 ease-out md:left-10 md:h-[150px] md:w-[100px] ${
            locked
              ? "cursor-default"
              : "cursor-grab hover:-translate-y-1 focus-visible:-translate-y-1 focus-visible:outline-2 focus-visible:outline-offset-[6px] focus-visible:outline-gold active:cursor-grabbing"
          } ${aside ? "-translate-x-8 opacity-0" : ""}`}
        >
          {/* Quầng ấm hắt quanh cỗ, nằm dưới bài nên không cản tay. */}
          <div
            aria-hidden
            className="pointer-events-none absolute -inset-x-14 -inset-y-6 rounded-[50%]"
            style={{
              background:
                "radial-gradient(ellipse,rgba(201,169,97,0.13),rgba(201,169,97,0) 70%)",
            }}
          />
          {Array.from({ length: day }, (_, k) => {
            /* 0 là lá đáy, day-1 là lá trên cùng. */
            const t = k / Math.max(day - 1, 1);
            /*
              Xoè cỗ bằng ngón cái thì lá càng gần nóc càng trượt ra xa, mấy lá
              dưới đáy gần như đứng yên — nên quãng ra không chia đều mà dồn về
              phía trên chồng.
            */
            const ra = pull * Math.pow(t, 1.3);
            return (
              <TarotCardFace
                key={k}
                face="down"
                className="absolute inset-0 will-change-transform"
                style={
                  {
                    transform: `translate3d(${(ra - k * SKEW).toFixed(1)}px, ${(
                      -k * LIFT -
                      ra * 0.05
                    ).toFixed(1)}px, 0) rotate(${(
                      Math.sin(k * 1.7) * 0.6 +
                      (ra / FAN_FULL) * 10
                    ).toFixed(2)}deg)`,
                    transition: snapping
                      ? `transform ${SNAP_MS}ms cubic-bezier(0.32,0.72,0.2,1)`
                      : undefined,
                  } as CSSProperties
                }
              />
            );
          })}
        </div>
      </div>

      <p
        role="status"
        className={`px-5 text-center text-[13px] text-balance transition-colors duration-200 md:px-0 md:text-left ${
          pull >= FAN_MIN ? "text-gold" : "text-muted"
        } ${aside ? "opacity-0" : ""}`}
      >
        {hint}
      </p>
    </div>
  );
}
