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

/** Ngón tay phải đi được ngần này mới coi là đang kéo, chứ không phải chạm hụt. */
const LOCK_SLOP = 10;

/** Đẩy chồng bài về sát cỗ tới ngần này là coi như đã nhập xong vào cỗ. */
const BACK_PX = 8;

/** Nhịp cỗ lún xuống rồi nảy lại lúc chồng bài nhập vào. */
const PASS_MS = 340;

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
 * Cả bước này chỉ có một cử động, đúng động tác tráo dồn ngoài đời. Kéo cỗ
 * xuống phía mình là bốc một chồng ra — kéo càng sâu thì chồng càng dày. Đẩy nó
 * lên nhập lại vào cỗ là xong một lượt xào: một lượt chẻ bài hoặc tráo dồn thật
 * chạy trên chính mảng 78 lá, entropy lấy từ độ sâu vừa bốc, chỗ ngón tay đặt
 * và thời điểm. Một lần giữ tay làm được mấy vòng liền.
 *
 * Chỗ rẽ giữa xào và cắt cũng chính là chỗ rẽ ngoài đời: bỏ chồng lại vào cỗ
 * thì là xào, còn đặt nó xuống bàn thì là cắt. Nên thả tay lúc chồng bài vẫn
 * đang tách ra là cắt ở đúng chỗ đó.
 *
 * Kéo chuột và chạm ngón tay đi chung một đường qua Pointer Events. Ai không
 * kéo được thì có phím mũi tên đi đúng đường đó — xuống là bốc ra, lên là nhập
 * lại, Enter là đặt xuống — hoặc lối "xào giúp tôi" ở cuối màn.
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
  const boxRef = useRef<HTMLDivElement>(null);
  const startRef = useRef<HTMLButtonElement>(null);
  /** Quãng kéo bằng bàn phím, px — bản sao có thể đọc ngay của `pull`. */
  const kb = useRef(0);

  /*
    Cắt xong thì đưa tiêu điểm sang nút. Vùng chạm vừa rời khỏi vòng tab, ai
    dùng bàn phím mà không dời tiêu điểm đi thì nhấn Tab một cái là lạc mất chỗ.
  */
  useEffect(() => {
    if (ready) startRef.current?.focus();
  }, [ready]);

  const total = deck.length;
  /** Đang cầm bao nhiêu lá trên tay — hễ nhấc là có, dù mới nhấc một tí. */
  const held = pull === null ? 0 : cutAtFor(pull, total);
  const packet = held ? packetFor(held, total) : 0;
  /* Nhưng chưa kéo qua ngưỡng thì thả tay ra bài về chỗ cũ, chưa cắt được. */
  const cutAt = pull !== null && pull >= PULL_MIN ? held : 0;

  /* ---------- Xào ---------- */

  /** Đang có hoạt cảnh chạy trên cỗ bài hay không. */
  const anim = useRef(false);

  /**
   * Gắn hoặc gỡ hoạt cảnh trên chính những lá đang có, khỏi dựng lại cả chồng.
   * Gỡ đi là chuyện bắt buộc chứ không phải dọn dẹp: hoạt cảnh đè lên transform
   * trong style, còn đang chạy mà người rút tách chồng tiếp thì bài không đi
   * theo tay được.
   */
  const setAnim = useCallback((value: string | null) => {
    const plane = planeRef.current;
    if (!plane) return;
    const cards = Array.from(plane.querySelectorAll<HTMLElement>(`.${CARD}`));
    for (const c of cards) c.style.animation = "none";
    anim.current = false;
    if (!value) return;
    /*
      Đọc một thuộc tính bố cục để trình duyệt chốt lại khung "không hoạt cảnh".
      Không có nhịp này thì gán lại đúng tên hoạt cảnh cũ sẽ không chạy lại, nên
      vòng thứ hai trở đi cỗ bài đứng im.
    */
    void plane.offsetWidth;
    for (const c of cards) c.style.animation = value;
    anim.current = true;
  }, []);

  /**
   * Một lượt xào, tính khi chồng bài vừa được đẩy trở lại cỗ.
   *
   * Nghiêng về tráo dồn vì đó đúng là động tác vừa làm — bốc một tệp ra rồi
   * chồng lại; thi thoảng chen một lượt chẻ bài cho cỗ khỏi trộn mãi một kiểu.
   * `deep` là chồng vừa rồi nhấc sâu bao nhiêu, đi thẳng vào entropy.
   */
  const runPass = useCallback(
    (deep: number, x: number) => {
      const next = mixSeed(entropyRef.current, deep, x, performance.now());
      entropyRef.current = next;
      const rand = mulberry32(next);
      deckRef.current =
        rand() < 0.65
          ? overhand(deckRef.current, rand)
          : riffle(deckRef.current, rand, rand() < 0.5);
      setPasses((n) => n + 1);
      setTooSoon(false);
      setAnim(`t24-deck-merge ${PASS_MS}ms`);
    },
    [setAnim],
  );

  /* ---------- Cắt ---------- */

  /**
   * Đặt chồng vừa nhấc xuống bàn, chồng phần còn lại lên, rồi vỗ cỗ về giữa.
   * Cắt xong là dừng ở đây chứ không nhảy thẳng sang bàn bài: nhát cắt vừa rồi
   * là một nhịp của nghi thức, phải cho người rút nhìn thấy nó xong đã.
   */
  const commitCut = useCallback((at: number) => {
    kb.current = 0;
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
    kb.current = 0;
    setSnapping(true);
    setPull(null);
    setTimeout(() => setSnapping(false), SNAP_MS);
  }, []);

  /* ---------- Ngón tay ---------- */

  const drag = useRef<{
    id: number;
    y0: number;
    /** Vòng này đã nhấc chồng bài xa nhất tới đâu. */
    deep: number;
    /** Đã kéo đủ xa để coi là có nhấc, hay mới chỉ rung tay. */
    keo: boolean;
  } | null>(null);

  const onPointerDown = useCallback(
    (e: ReactPointerEvent<HTMLElement>) => {
      if (cutting || ready) return;
      e.currentTarget.setPointerCapture(e.pointerId);
      kb.current = 0;
      drag.current = { id: e.pointerId, y0: e.clientY, deep: 0, keo: false };
    },
    [cutting, ready],
  );

  /**
   * Một lần giữ tay có thể làm mấy vòng liền: kéo xuống tách chồng ra, đẩy lên
   * nhập vào là xong một lượt, rồi lại kéo xuống. Mốc đo neo ở chỗ đặt tay ban
   * đầu suốt cả lần giữ, nên chồng bài luôn nằm đúng nơi ngón tay đang ở.
   */
  const onPointerMove = useCallback(
    (e: ReactPointerEvent<HTMLElement>) => {
      const d = drag.current;
      if (!d || d.id !== e.pointerId) return;
      const dy = e.clientY - d.y0;
      if (!d.keo) {
        if (dy <= LOCK_SLOP) return;
        d.keo = true;
      }

      const p = clamp(dy - LOCK_SLOP, 0, PULL_MAX);
      /* Nhịp nhập vào của vòng trước còn đang chạy thì gỡ, kẻo bài không theo tay. */
      if (p > 0 && anim.current) setAnim(null);
      setSnapping(false);
      /* Về sát cỗ thì coi như không cầm gì nữa — số 0 và "không cầm" là hai
         chuyện khác nhau, dòng nhắc với chồng bài trên tay đều đọc chỗ này. */
      setPull(p > 0 ? p : null);
      d.deep = Math.max(d.deep, p);

      /* Nhấc đủ sâu rồi đẩy về sát cỗ: chồng bài đã nhập vào, xong một lượt. */
      if (d.deep >= PULL_MIN && p <= BACK_PX) {
        const deep = d.deep;
        d.deep = 0;
        setPull(null);
        runPass(deep, e.clientX);
      }
    },
    [runPass, setAnim],
  );

  /**
   * Thả tay lúc chồng bài còn tách khỏi cỗ tức là đặt nó xuống bàn — đó là cắt.
   * Đẩy nó về nhập vào cỗ rồi mới thả thì chẳng có gì xảy ra, vì lượt xào đã
   * tính xong ngay lúc nhập vào.
   */
  const onPointerUp = useCallback(
    (e: ReactPointerEvent<HTMLElement>) => {
      const d = drag.current;
      if (!d || d.id !== e.pointerId) return;
      drag.current = null;

      /* Chạm một cái mà không kéo đi đâu cũng là một lượt, cho ai quen gõ hơn kéo. */
      if (!d.keo) {
        runPass(PULL_MIN, e.clientX);
        return;
      }

      const p = clamp(e.clientY - d.y0 - LOCK_SLOP, 0, PULL_MAX);
      if (p < PULL_MIN) {
        cancelPull();
        return;
      }
      /* Cỗ chưa xào mấy mà đã đòi cắt thì nhắc một câu chứ không cắt. */
      if (passes < MIN_PASSES) {
        setTooSoon(true);
        cancelPull();
        return;
      }
      commitCut(cutAtFor(p, total));
    },
    [cancelPull, commitCut, passes, runPass, total],
  );

  const onKeyDown = useCallback(
    (e: ReactKeyboardEvent<HTMLElement>) => {
      if (cutting || ready) return;
      const k = e.key;
      /*
        Mũi tên dọc đi đúng đường ngón tay đi: xuống là tách chồng ra, lên là
        đẩy nhập lại, một vòng như thế là một lượt. Quãng kéo giữ trong ref chứ
        không đọc từ state — giữ phím thì mấy nhịp liền nhau rơi vào cùng một
        lượt dựng, đọc từ state là nhịp sau đè nhịp trước, bấm mười cái vẫn đứng
        yên một chỗ.
      */
      if (k === "ArrowDown" || k === "ArrowUp") {
        e.preventDefault();
        const step = (k === "ArrowDown" ? 1 : -1) * (PULL_MAX / 12);
        /*
          Nhịp đầu nhảy thẳng tới ngưỡng. Nhích từng tí từ 0 lên thì có lúc chỗ
          cắt đã hiện trên màn mà Enter lại chưa cắt được, vì quãng kéo chưa qua
          ngưỡng.
        */
        let next =
          kb.current === 0
            ? k === "ArrowDown"
              ? PULL_MIN
              : 0
            : clamp(kb.current + step, 0, PULL_MAX);
        if (next < PULL_MIN) next = 0;
        const daTach = kb.current >= PULL_MIN;
        kb.current = next;
        setSnapping(false);
        setPull(next > 0 ? next : null);
        /* Đẩy về sát cỗ sau khi đã tách ra: chồng bài nhập vào, xong một lượt. */
        if (daTach && next === 0) runPass(PULL_MIN, 0);
        return;
      }
      if (k === "Enter" && kb.current >= PULL_MIN) {
        e.preventDefault();
        /* Cỗ chưa xào mấy mà đã đòi cắt thì nhắc một câu chứ không cắt. */
        if (passes < MIN_PASSES) {
          setTooSoon(true);
          cancelPull();
          return;
        }
        commitCut(cutAtFor(kb.current, total));
        return;
      }
      if (k === "Enter" || k === " ") {
        e.preventDefault();
        runPass(PULL_MIN, 0);
      }
    },
    [cancelPull, commitCut, cutting, passes, ready, runPass, total],
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
  /*
    Lúc chồng bài đang trên tay thì câu nhắc phải nói cả hai lối ra, vì đẩy lên
    hay thả tay đều là một quyết định thật: đẩy lên là xào thêm một lượt, thả
    tay là đặt chồng xuống, tức là cắt.
  */
  const hint = ready
    ? "Cỗ bài đã xào và cắt xong"
    : cutting
      ? "Đang cắt cỗ…"
      : cutAt
        ? `Đẩy lên để nhập lại · thả tay ra là cắt ở lá thứ ${cutAt}`
        : pull !== null
          ? passes < MIN_PASSES
            ? "Đẩy lên để nhập lại · một vòng là một lượt xào"
            : "Đẩy lên để nhập lại · kéo sâu thêm mới cắt được"
          : tooSoon
            ? "Xào thêm vài lượt rồi hãy cắt"
            : passes === 0
              ? "Kéo cỗ bài xuống phía bạn để tách một chồng ra"
              : passes < MIN_PASSES
                ? `Đã xào ${passes} lượt · làm thêm ${MIN_PASSES - passes} vòng nữa`
                : `Đã xào ${passes} lượt · thả tay khi bài còn tách ra là cắt`;

  return (
    <div className="mx-auto flex w-full max-w-[720px] flex-col px-5 pt-6 pb-10 md:px-0">
      <h1 className="font-serif text-xl text-ink md:text-2xl">Xào bài</h1>
      <p className="mt-1.5 text-[13.5px]/[1.65] text-pretty text-muted">
        Giữ câu hỏi trong đầu rồi kéo cỗ bài xuống phía bạn để tách một chồng
        ra, đẩy lên cho nhập lại vào cỗ — một vòng như thế là một lượt xào. Thấy
        đủ thì thả tay lúc bài còn đang tách ra, đó là nhát cắt.
      </p>

      <div
        ref={boxRef}
        role="button"
        tabIndex={cutting || ready ? -1 : 0}
        aria-label={
          ready
            ? "Cỗ bài đã xào và cắt xong."
            : /* Nhãn kể cả đường bàn phím, vì dòng nhắc dưới màn chỉ nói tới ngón tay. */
              `Cỗ bài. Kéo xuống rồi đẩy lên là một lượt xào, thả tay lúc bài còn tách ra là cắt cỗ. Bằng bàn phím: mũi tên xuống bốc chồng ra, mũi tên lên nhập lại, Enter để cắt. Đã xào ${passes} lượt.`
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
        <>
          <button
            ref={startRef}
            type="button"
            onClick={() => onDone(deckRef.current)}
            className={buttonClass("primary", "md", "mt-8 animate-rise self-center")}
          >
            Bắt đầu rút bài
          </button>
          {/*
            Lỡ tay thả sớm thì nhát cắt đã xuống rồi. Cắt sớm chẳng hỏng gì cỗ
            bài, nhưng phải có đường quay lại bàn xào, kẻo người rút mắc kẹt ở
            một cỗ mình chưa thấy ưng.
          */}
          <button
            type="button"
            onClick={() => {
              setReady(false);
              boxRef.current?.focus();
            }}
            className="mt-3.5 self-center text-[13px] text-muted underline underline-offset-4 transition-colors hover:text-gold-hi"
          >
            Xào thêm
          </button>
        </>
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
