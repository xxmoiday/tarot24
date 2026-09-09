"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent as ReactKeyboardEvent,
  type PointerEvent as ReactPointerEvent,
} from "react";
import { TarotCardFace } from "@/components/TarotCardFace";
import { buttonClass } from "@/components/ui";
import {
  autoShuffle,
  cutDeck,
  mixSeed,
  mulberry32,
  overhand,
  riffle,
  type DrawnCard,
} from "@/lib/draw";
import { ShuffleDeck, SHUFFLE_MS, SHUFFLE_MS_REDUCED } from "./ShuffleDeck";

/** Số lá vẽ trong chồng. Đủ dày để thấy bề dày cỗ, ít để còn chạy mượt. */
const STACK = 18;

/** Bề dày một lá, tính bằng px chiều sâu. */
const ZSTEP = 2.4;

/** Chồng đang cắt được nhấc khỏi mặt cỗ ngần này. */
const LIFT = 22;

/** Mặt bàn ngả đi bấy nhiêu độ, để nhìn cỗ bài chéo từ trên xuống. */
const TILT = 52;

/**
 * Kéo trên màn một px thì trong mặt bàn đi được ngần này. Bàn ngả 52° nên
 * chiều sâu bị nén còn cos(52°) ≈ 0,62 — muốn chồng bài chạy kịp ngón tay thì
 * phải bù ngược lại.
 */
const PULL_SCALE = 1 / Math.cos((TILT * Math.PI) / 180);

/**
 * Kéo hết ngần này px là cắt tới sát đáy cỗ. Đừng nới thêm nếu không nới cả
 * chiều cao vùng chạm: chồng bài kéo xuống là đi lại gần mắt nhìn, nên nó vừa
 * tụt xuống vừa to ra, ăn nhiều chỗ hơn đúng quãng kéo.
 */
const PULL_MAX = 96;

/**
 * Kéo xuống thì chồng bài dạt ngang thêm một quãng bằng ngần này lần quãng
 * kéo. Kéo thẳng xuống thì chồng nhấc lên che mất cỗ còn lại, mà cắt bài ngoài
 * đời có ai kéo thẳng vào bụng mình đâu — đưa nó chếch sang bên.
 */
const PULL_DRIFT = 0.45;

/** Kéo chưa tới đây thì coi như chưa cắt, chồng bài trượt về chỗ cũ. */
const PULL_MIN = 26;

/** Vuốt ngang được ngần này px thì tính một lượt xào. */
const SWIPE_STEP = 44;

/** Tay phải đi được ngần này mới biết là vuốt ngang hay kéo dọc. */
const LOCK_SLOP = 10;

/** Một lượt xào chạy trong bấy nhiêu; vuốt liền tay thì lượt sau cắt lượt trước. */
const PASS_MS = 440;

/** Xào ít hơn ngần này lượt thì chưa cho cắt cỗ. */
const MIN_PASSES = 3;

/** Đặt chồng xuống rồi chồng phần còn lại lên, hết bấy nhiêu. */
const CUT_MS = 620;

/** Kéo hụt thì chồng bài trượt về chỗ cũ trong bấy nhiêu. */
const SNAP_MS = 280;

/** Cắt xong thì vỗ cỗ về giữa bàn cho gọn, hết bấy nhiêu. */
const SETTLE_MS = 380;

/** Tắt hiệu ứng thì mọi thứ về gần như tức thì, chỉ chừa một nhịp. */
const REDUCED_MS = 220;

const prefersReduced = () =>
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/**
 * Dấu để tìm lại từng lá lúc gắn hoạt cảnh. Phải là class chứ không phải thuộc
 * tính data-, vì TarotCardFace chỉ chuyển tiếp className xuống DOM.
 */
const CARD = "t24-deck-card";

const clamp = (v: number, lo: number, hi: number) =>
  Math.max(lo, Math.min(hi, v));

/** Quãng kéo trên màn đổi ra chỗ cắt, tính bằng lá từ nóc cỗ xuống. */
const cutAtFor = (dy: number, total: number) =>
  clamp(Math.round((dy / PULL_MAX) * (total - 1)), 1, total - 1);

/** Chỗ cắt đổi ra số lá phải vẽ trong chồng đang nhấc. */
const packetFor = (at: number, total: number) =>
  clamp(Math.round((at / total) * STACK), 1, STACK - 1);

export interface ShuffleRitualProps {
  /** Cỗ bài lúc bắt đầu, tức là thứ tự nó nằm sau lượt đọc trước. */
  deck: DrawnCard[];
  /** Seed của lượt này: gieo chiều xuôi ngược ban đầu và chọn kiểu xào hộ. */
  seed: number;
  onDone: (deck: DrawnCard[]) => void;
}

/**
 * Nghi thức xào bài: cỗ bài nằm nghiêng trên mặt bàn, người rút thao tác thẳng
 * lên nó, không qua nút nào.
 *
 * Vuốt ngang là xào — mỗi cú vuốt chạy một lượt chẻ bài hoặc tráo dồn thật trên
 * chính mảng 78 lá, entropy lấy từ quãng vuốt, chỗ ngón tay đặt và thời điểm
 * vuốt. Kéo cỗ xuống phía mình là cắt — kéo càng xa thì chồng nhấc lên càng
 * dày, thả tay ra là phần còn lại chồng lên trên nó rồi cỗ mở ra cho rút.
 *
 * Kéo chuột và chạm ngón tay đi chung một đường qua Pointer Events. Ai không
 * kéo được thì có phím mũi tên, hoặc lối "xào giúp tôi" ở cuối màn.
 */
export function ShuffleRitual({ deck, seed, onDone }: ShuffleRitualProps) {
  const [phase, setPhase] = useState<"hand" | "auto">("hand");
  const [passes, setPasses] = useState(0);
  /** Quãng đang kéo, tính bằng px trên màn; chưa kéo thì null. */
  const [pull, setPull] = useState<number | null>(null);
  /** Đang chạy nốt hoạt cảnh đặt chồng bài xuống. */
  const [cutting, setCutting] = useState(false);
  /** Cắt xong, cỗ nằm chờ — người rút bấm nút mới sang bàn bài. */
  const [ready, setReady] = useState(false);
  /** Nhịp vỗ cỗ về giữa bàn ngay sau khi cắt. */
  const [settling, setSettling] = useState(false);
  /** Kéo hụt hoặc kéo sớm thì cho chồng bài trượt về, có nhắc một câu. */
  const [snapping, setSnapping] = useState(false);
  const [tooSoon, setTooSoon] = useState(false);

  /*
    Cỗ bài và entropy nằm trong ref chứ không phải state: suốt bước này màn hình
    chỉ vẽ mười tám lá úp giống hệt nhau, thứ tự thật không ai nhìn thấy, nên
    đổi nó không đáng để dựng lại cả cây.
  */
  const deckRef = useRef(deck);
  const entropyRef = useRef(seed);

  const planeRef = useRef<HTMLDivElement>(null);
  const startRef = useRef<HTMLButtonElement>(null);

  /*
    Cắt xong thì đưa tiêu điểm sang nút. Vùng chạm vừa rời khỏi vòng tab, ai
    dùng bàn phím mà không dời tiêu điểm đi thì nhấn Tab một cái là lạc mất chỗ.
  */
  useEffect(() => {
    if (ready) startRef.current?.focus();
  }, [ready]);

  const total = deck.length;
  /* Chưa kéo qua ngưỡng thì chưa có chỗ cắt nào cả — thả tay ra là bài về chỗ cũ. */
  const cutAt = pull !== null && pull >= PULL_MIN ? cutAtFor(pull, total) : 0;
  const packet = cutAt ? packetFor(cutAt, total) : 0;

  /* ---------- Xào ---------- */

  /** Chạy lại hoạt cảnh trên chính những lá đang có, khỏi dựng lại cả chồng. */
  const play = useCallback((dir: 1 | -1) => {
    const plane = planeRef.current;
    if (!plane) return;
    plane.style.setProperty("--dir", String(dir));
    const cards = Array.from(plane.querySelectorAll<HTMLElement>(`.${CARD}`));
    for (const c of cards) c.style.animation = "none";
    /*
      Đọc một thuộc tính bố cục để trình duyệt chốt lại khung "không hoạt cảnh".
      Không có nhịp này thì gán lại đúng tên hoạt cảnh cũ sẽ không chạy lại, nên
      vuốt cú thứ hai trở đi cỗ bài đứng im.
    */
    void plane.offsetWidth;
    for (const c of cards) c.style.animation = `t24-deck-riffle ${PASS_MS}ms`;
  }, []);

  /** Một lượt xào: chẻ bài, thi thoảng tráo dồn cho khỏi một màu. */
  const runPass = useCallback(
    (dir: 1 | -1, dist: number, y: number) => {
      const next = mixSeed(entropyRef.current, dist, y, performance.now());
      entropyRef.current = next;
      const rand = mulberry32(next);
      deckRef.current =
        rand() < 0.34
          ? overhand(deckRef.current, rand)
          : riffle(deckRef.current, rand, rand() < 0.5);
      setPasses((n) => n + 1);
      setTooSoon(false);
      play(dir);
    },
    [play],
  );

  /* ---------- Cắt ---------- */

  /**
   * Đặt chồng vừa nhấc xuống bàn, chồng phần còn lại lên, rồi vỗ cỗ về giữa.
   * Cắt xong là dừng ở đây chứ không nhảy thẳng sang bàn bài: nhát cắt vừa rồi
   * là một nhịp của nghi thức, phải cho người rút nhìn thấy nó xong đã.
   */
  const commitCut = useCallback((at: number) => {
    setCutting(true);
    const wait = prefersReduced() ? REDUCED_MS : CUT_MS + 140;
    setTimeout(() => {
      deckRef.current = cutDeck(deckRef.current, at);
      setCutting(false);
      setReady(true);
      setSettling(true);
      setPull(null);
      setTimeout(() => setSettling(false), SETTLE_MS);
    }, wait);
  }, []);

  /** Kéo hụt: trả chồng bài về chỗ cũ rồi xoá dấu vết cú kéo. */
  const cancelPull = useCallback(() => {
    setSnapping(true);
    setPull(null);
    setTimeout(() => setSnapping(false), SNAP_MS);
  }, []);

  /* ---------- Ngón tay ---------- */

  const drag = useRef<{
    id: number;
    x0: number;
    y0: number;
    lastX: number;
    mode: "chua" | "xao" | "cat" | "chan";
  } | null>(null);

  const onPointerDown = useCallback(
    (e: ReactPointerEvent<HTMLElement>) => {
      if (cutting || ready) return;
      e.currentTarget.setPointerCapture(e.pointerId);
      drag.current = {
        id: e.pointerId,
        x0: e.clientX,
        y0: e.clientY,
        lastX: e.clientX,
        mode: "chua",
      };
    },
    [cutting, ready],
  );

  const onPointerMove = useCallback(
    (e: ReactPointerEvent<HTMLElement>) => {
      const d = drag.current;
      if (!d || d.id !== e.pointerId) return;
      const dx = e.clientX - d.x0;
      const dy = e.clientY - d.y0;

      /*
        Chốt hướng ngay từ đoạn đầu rồi giữ nguyên tới lúc nhả tay. Không chốt
        thì một cú kéo chéo vừa xào vừa cắt, mà cắt xong là sang màn khác.
      */
      if (d.mode === "chua") {
        if (Math.abs(dx) > LOCK_SLOP && Math.abs(dx) >= Math.abs(dy)) {
          d.mode = "xao";
        } else if (dy > LOCK_SLOP && Math.abs(dy) > Math.abs(dx)) {
          /* Cỗ chưa xào mấy mà đã đòi cắt thì nhắc một câu chứ không cắt. */
          d.mode = passes >= MIN_PASSES ? "cat" : "chan";
          if (d.mode === "chan") setTooSoon(true);
        } else {
          return;
        }
      }

      if (d.mode === "xao") {
        const step = e.clientX - d.lastX;
        if (Math.abs(step) < SWIPE_STEP) return;
        d.lastX = e.clientX;
        runPass(step > 0 ? 1 : -1, Math.abs(step), e.clientY);
        return;
      }

      if (d.mode === "cat") {
        setSnapping(false);
        setPull(clamp(dy - LOCK_SLOP, 0, PULL_MAX));
      }
    },
    [passes, runPass],
  );

  const onPointerUp = useCallback(
    (e: ReactPointerEvent<HTMLElement>) => {
      const d = drag.current;
      if (!d || d.id !== e.pointerId) return;
      drag.current = null;

      if (d.mode === "cat") {
        const dy = clamp(e.clientY - d.y0 - LOCK_SLOP, 0, PULL_MAX);
        if (dy >= PULL_MIN) commitCut(cutAtFor(dy, total));
        else cancelPull();
        return;
      }
      /* Chạm một cái mà không đi đâu cũng là một lượt — có người quen gõ hơn vuốt. */
      if (d.mode === "chua") runPass(passes % 2 ? -1 : 1, SWIPE_STEP, e.clientY);
      if (d.mode === "chan") setPull(null);
    },
    [cancelPull, commitCut, passes, runPass, total],
  );

  const onKeyDown = useCallback(
    (e: ReactKeyboardEvent<HTMLElement>) => {
      if (cutting || ready) return;
      const k = e.key;
      /* Mũi tên dọc thay cho cú kéo: mỗi nhịp lấy thêm hoặc bớt đi mấy lá. */
      if (k === "ArrowDown" || k === "ArrowUp") {
        e.preventDefault();
        if (passes < MIN_PASSES) {
          setTooSoon(true);
          return;
        }
        const step = (k === "ArrowDown" ? 1 : -1) * (PULL_MAX / 12);
        setSnapping(false);
        /*
          Cộng dồn trên giá trị hiện có chứ không trên giá trị đọc được lúc dựng
          màn: giữ phím thì mấy nhịp liền nhau rơi vào cùng một lượt dựng, đọc
          kiểu kia là nhịp sau đè lên nhịp trước, bấm mười cái vẫn đứng yên một chỗ.
        */
        setPull((prev) => {
          /*
            Nhịp đầu nhảy thẳng tới ngưỡng cắt. Nhích từng tí một từ 0 lên thì
            có lúc chỗ cắt đã hiện trên màn mà Enter lại rơi vào nhánh xào, vì
            quãng kéo vẫn chưa qua ngưỡng.
          */
          if (prev === null) return k === "ArrowDown" ? PULL_MIN : null;
          const next = clamp(prev + step, 0, PULL_MAX);
          return next >= PULL_MIN ? next : null;
        });
        return;
      }
      if (k === "Enter" && pull !== null && pull >= PULL_MIN) {
        e.preventDefault();
        commitCut(cutAtFor(pull, total));
        return;
      }
      if (k === "Enter" || k === " " || k === "ArrowLeft" || k === "ArrowRight") {
        e.preventDefault();
        runPass(k === "ArrowLeft" ? -1 : 1, SWIPE_STEP, 0);
      }
    },
    [commitCut, cutting, passes, pull, ready, runPass, total],
  );

  /* ---------- Xào hộ ---------- */

  /*
    Xào hộ cũng dừng ở đúng chỗ người tự xào dừng: cỗ nằm chờ, có nút mới sang
    bàn bài. Một cửa ra cho cả hai lối, người rút không phải đoán xem lần này
    màn hình có tự nhảy hay không.
  */
  useEffect(() => {
    if (phase !== "auto") return;
    const wait = prefersReduced() ? SHUFFLE_MS_REDUCED : SHUFFLE_MS;
    const t = setTimeout(() => {
      deckRef.current = autoShuffle(deckRef.current, entropyRef.current);
      setPhase("hand");
      setReady(true);
    }, wait);
    return () => clearTimeout(t);
  }, [phase]);

  if (phase === "auto") return <ShuffleDeck seed={seed} />;

  /* ---------- Chỗ đứng của từng lá ---------- */

  /**
   * Lá số 0 nằm đáy cỗ, lá cuối nằm trên nóc. Chồng đang cắt là mấy lá trên
   * nóc, nên nó chạy từ chỉ số STACK − packet trở lên.
   */
  const cardTransform = (i: number) => {
    const z = i * ZSTEP;
    const inPacket = packet > 0 && i >= STACK - packet;
    const y = pull === null ? 0 : pull * PULL_SCALE;

    if (cutting) {
      /* Chồng vừa nhấc hạ xuống thành đáy cỗ mới, phần còn lại chồng lên trên. */
      const nz = inPacket ? (i - (STACK - packet)) * ZSTEP : (i + packet) * ZSTEP;
      const x = (pull ?? 0) * PULL_DRIFT;
      return `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, ${nz.toFixed(1)}px)`;
    }
    if (inPacket) {
      const x = (pull ?? 0) * PULL_DRIFT;
      return `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, ${(z + LIFT).toFixed(1)}px)`;
    }
    return `translate3d(0, 0, ${z.toFixed(1)}px)`;
  };

  const moving = cutting || snapping || settling;
  const moveMs = cutting ? CUT_MS : settling ? SETTLE_MS : SNAP_MS;
  const hint = ready
    ? "Cỗ bài đã xào và cắt xong"
    : cutting
      ? "Đang cắt cỗ…"
      : cutAt
        ? `Cắt ở lá thứ ${cutAt} · thả tay ra là xong`
        : pull !== null
          ? "Kéo thêm chút nữa để cắt cỗ"
          : tooSoon
            ? "Xào thêm vài lượt rồi hãy cắt"
            : passes === 0
              ? "Vuốt ngang qua cỗ bài để xào"
              : passes < MIN_PASSES
                ? `Đã xào ${passes} lượt · vuốt thêm ${MIN_PASSES - passes} lượt nữa`
                : `Đã xào ${passes} lượt · kéo cỗ bài xuống để cắt`;

  return (
    <div className="mx-auto flex w-full max-w-[720px] flex-col px-5 pt-6 pb-10 md:px-0">
      <h1 className="font-serif text-xl text-ink md:text-2xl">Xào bài</h1>
      <p className="mt-1.5 text-[13.5px]/[1.65] text-pretty text-muted">
        Giữ câu hỏi trong đầu rồi vuốt ngang qua cỗ bài. Thấy đủ thì kéo cỗ
        xuống phía mình để cắt — cỗ bài này do tay bạn xào.
      </p>

      <div
        role="button"
        tabIndex={cutting || ready ? -1 : 0}
        aria-label={
          ready
            ? "Cỗ bài đã xào và cắt xong."
            : `Cỗ bài. Vuốt ngang để xào, kéo xuống để cắt cỗ. Đã xào ${passes} lượt.`
        }
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        onKeyDown={onKeyDown}
        /*
          touch-none vì ở đây cả hai chiều đều là thao tác: ngang thì xào, dọc
          thì cắt. Bù lại cả bước này gói trong một màn, không có gì để cuộn.
        */
        className={`relative mx-auto mt-6 h-[340px] w-full max-w-[360px] touch-none select-none ${
          cutting || ready ? "cursor-default" : "cursor-grab active:cursor-grabbing"
        }`}
      >
        {/* Quầng ấm hắt quanh cỗ, nằm ngoài mặt bàn nên không bị ngả theo. */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-[44px] h-[150px] rounded-[50%]"
          style={{
            background:
              "radial-gradient(ellipse,rgba(201,169,97,0.16),rgba(201,169,97,0) 70%)",
          }}
        />

        <div className="absolute inset-0 [perspective:1100px]">
          <div
            ref={planeRef}
            /*
              Căn giữa bằng lớp -translate-x-1/2, mà Tailwind v4 dựng bằng thuộc
              tính `translate` riêng chứ không phải `transform` — nên đừng lặp
              lại translateX ở dưới, kẻo cỗ bài dịch sang trái hai lần.
            */
            className="absolute top-[24px] left-1/2 h-[213px] w-[142px] -translate-x-1/2 [transform-style:preserve-3d]"
            style={
              { "--dir": "1", transform: `rotateX(${TILT}deg)` } as CSSProperties
            }
          >
            {/*
              Bóng cỗ bài đổ trên mặt bàn, nằm ngay dưới lá đáy. Lúc đặt chồng
              bài xuống thì bóng đi theo, kẻo cỗ bài sang chỗ mới mà bóng còn
              nằm lại chỗ cũ.
            */}
            <div
              aria-hidden
              className="absolute -inset-x-6 -inset-y-4 rounded-[40px]"
              style={{
                background:
                  "radial-gradient(ellipse,rgba(0,0,0,0.6),rgba(0,0,0,0) 72%)",
                transform: cutting
                  ? `translate3d(${((pull ?? 0) * PULL_DRIFT).toFixed(1)}px, ${((pull ?? 0) * PULL_SCALE).toFixed(1)}px, -1px)`
                  : "translateZ(-1px)",
                transition: moving
                  ? `transform ${moveMs}ms cubic-bezier(0.32,0.72,0.2,1)`
                  : undefined,
              }}
            />
            {Array.from({ length: STACK }, (_, i) => (
              <TarotCardFace
                key={i}
                face="down"
                className={`${CARD} absolute inset-0 will-change-transform`}
                style={
                  {
                    "--z": `${(i * ZSTEP).toFixed(1)}px`,
                    /* Hai nửa cỗ đan vào nhau, nên lá chẵn lá lẻ đi ngược chiều. */
                    "--s": i % 2 ? "1" : "-1",
                    transform: cardTransform(i),
                    transition: moving
                      ? `transform ${moveMs}ms cubic-bezier(0.32,0.72,0.2,1)`
                      : undefined,
                  } as CSSProperties
                }
              />
            ))}
          </div>
        </div>
      </div>

      <div className="mt-1 flex flex-col items-center gap-2.5">
        {/* Xong rồi thì hàng chấm tiến độ hết nghĩa, cất đi cho gọn màn. */}
        {ready ? null : (
          <div className="flex h-4 items-center gap-2">
            {Array.from({ length: MIN_PASSES }, (_, i) => (
              <span
                key={i}
                className={`size-1.5 rounded-full transition-colors duration-200 ${
                  i < passes ? "bg-gold" : "bg-line"
                }`}
              />
            ))}
            {passes > MIN_PASSES ? (
              <span className="text-[12px] font-medium text-gold">
                +{passes - MIN_PASSES}
              </span>
            ) : null}
          </div>
        )}
        <p
          role="status"
          className={`text-center text-[13px] ${
            tooSoon && !cutAt ? "text-rust" : cutAt ? "text-gold" : "text-muted"
          }`}
        >
          {hint}
        </p>
      </div>

      {/*
        Cắt xong mới hiện nút. Chỗ này cố ý là một cái nút thật: xào và cắt là
        việc của bàn tay, còn rời bàn xào sang bàn bài là một quyết định, nên để
        người rút tự bấm khi thấy sẵn sàng.
      */}
      {ready ? (
        <button
          ref={startRef}
          type="button"
          onClick={() => onDone(deckRef.current)}
          className={buttonClass("primary", "md", "mt-8 animate-rise self-center")}
        >
          Bắt đầu rút bài
        </button>
      ) : (
        <button
          type="button"
          onClick={() => setPhase("auto")}
          disabled={cutting}
          className="mt-8 self-center text-[13.5px] text-muted underline underline-offset-4 transition-colors hover:text-gold-hi disabled:opacity-50"
        >
          Xào và cắt giúp tôi
        </button>
      )}
    </div>
  );
}
