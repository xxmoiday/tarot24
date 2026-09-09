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
 * Kéo dọc hết cỡ là ngần này px — đủ để chồng bốc ra rời hẳn khỏi cỗ chứ không
 * còn nằm đè lên. Cỗ nhìn nghiêng cao chừng 115px trên màn, cộng thêm phần nở
 * ra khi chồng bài đi lại gần mắt nhìn, nên phải ngần này mới hở được một
 * khoảng giữa hai chồng.
 */
const PULL_MAX = 130;

/**
 * Kéo ngang hết cỡ là ngần này px. Chật hơn chiều dọc vì bị bề ngang màn chặn:
 * màn 320px thì khung nội dung còn 280, lá bài rộng 128 nằm giữa, dạt quá ngần
 * này là lòi ra ngoài mép.
 */
const CUT_MAX = 76;

/** Kéo chưa tới đây thì chưa đủ thành một vòng hay một nhát cắt. */
const GRIP_MIN = 26;

/**
 * Bốc một tệp thì nhiều nhất cũng chỉ ngần này lá trong chồng vẽ. Bốc nửa cỗ
 * lên tay không phải là tráo dồn, mà là cắt — hai việc khác nhau.
 */
const GRAB_MAX = 7;

/**
 * Kéo xuống thì chồng bài dạt ngang thêm một quãng bằng ngần này lần quãng
 * kéo. Kéo thẳng xuống thì chồng nhấc lên che mất cỗ còn lại, mà bốc bài ngoài
 * đời có ai kéo thẳng vào bụng mình đâu — đưa nó chếch sang bên.
 */
const PULL_DRIFT = 0.45;

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

/** Quãng kéo ngang đổi ra chỗ cắt, tính bằng lá từ nóc cỗ xuống. */
const cutAtFor = (d: number, total: number) =>
  clamp(Math.round((d / CUT_MAX) * (total - 1)), 1, total - 1);

/** Chỗ cắt đổi ra số lá phải vẽ trong chồng đang nhấc. */
const packetFor = (at: number, total: number) =>
  clamp(Math.round((at / total) * STACK), 1, STACK - 1);

/**
 * Quãng kéo dọc đổi ra số lá bốc lên tay. Không dùng chung thang với nhát cắt:
 * cắt là chia đôi cỗ nên quãng kéo phải trải hết 78 lá, còn bốc một tệp thì chỉ
 * quanh quẩn vài lá. `grab` là cái tay bốc của riêng vòng này, hơi nặng hơi nhẹ
 * mỗi lần một khác — ngoài đời có ai bốc hai lần đúng bằng nhau đâu.
 */
const grabFor = (d: number, grab: number) =>
  clamp(Math.round((d / PULL_MAX) * GRAB_MAX * grab), 1, GRAB_MAX);

/**
 * Gieo cái tay bốc cho một vòng. Chỉ để nhìn nên gieo bằng Math.random, không
 * đụng vào chuỗi entropy quyết định thứ tự cỗ bài.
 */
const tayBoc = () => 0.6 + Math.random() * 0.8;

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
 * Hai chiều tay, hai việc, đúng như ngoài đời.
 *
 * Kéo dọc là xào: kéo cỗ xuống phía mình để bốc một chồng ra — kéo càng sâu
 * chồng càng dày — rồi đẩy lên cho nhập lại vào cỗ, thế là xong một lượt. Mỗi
 * lượt chạy một lần chẻ bài hoặc tráo dồn thật trên chính mảng 78 lá, entropy
 * lấy từ độ sâu vừa bốc, chỗ ngón tay đặt và thời điểm. Một lần giữ tay làm
 * được mấy vòng liền.
 *
 * Kéo ngang là cắt: cỗ tách làm hai chồng nằm cạnh nhau, thả tay ra thì phần
 * gốc tự chồng lên phần vừa tách. Vì cắt có đường riêng nên buông tay giữa
 * chừng ở chiều dọc chẳng cắt nhầm gì cả, chồng bài chỉ rơi trở lại vào cỗ.
 *
 * Kéo chuột và chạm ngón tay đi chung một đường qua Pointer Events. Ai không
 * kéo được thì có phím mũi tên đi đúng hai đường đó — dọc để xào, ngang để
 * chọn chỗ cắt rồi Enter — hoặc lối "xào giúp tôi" ở cuối màn.
 */
export function ShuffleRitual({ deck, seed, onDone }: ShuffleRitualProps) {
  const [phase, setPhase] = useState<"hand" | "auto">("hand");
  const [passes, setPasses] = useState(0);
  /**
   * Cái nắm tay đang diễn ra: `ngang` là đang cắt hay đang xào, `d` là quãng đã
   * kéo tính bằng px trên màn — chiều ngang có dấu để biết dạt sang trái hay
   * phải — và `grab` là cái tay bốc của riêng vòng này. Chưa nắm gì thì null.
   */
  const [grip, setGrip] = useState<{
    ngang: boolean;
    d: number;
    grab: number;
  } | null>(null);
  /** Đang chạy nốt hoạt cảnh đặt chồng bài xuống. */
  const [cutting, setCutting] = useState(false);
  /**
   * Đã cắt ít nhất một nhát, tức là cỗ sẵn sàng cho bàn bài. Chỉ có nghĩa là
   * nút "bắt đầu rút" hiện ra chứ không khoá gì cả: cỗ bài vẫn nằm đó, xào
   * thêm hay cắt lại đều được, chừng nào người rút chưa bấm nút.
   */
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
  /** Cái nắm tay dựng bằng bàn phím — bản sao có thể đọc ngay của `grip`. */
  const kb = useRef<{ ngang: boolean; d: number; grab: number } | null>(null);

  const total = deck.length;
  /** Quãng đã kéo, bỏ dấu đi. */
  const depth = grip ? Math.abs(grip.d) : 0;
  /**
   * Số lá vẽ trong chồng đang cầm. Kéo ngang thì nó phải khớp với chỗ cắt đang
   * hiện trên màn; kéo dọc thì chỉ là một tệp mỏng bốc lên tay.
   */
  const packet = !grip
    ? 0
    : grip.ngang
      ? packetFor(cutAtFor(depth, total), total)
      : grabFor(depth, grip.grab);
  /*
   * Chỗ cắt chỉ có nghĩa khi nhát cắt đó thật sự sẽ xuống: đang kéo ngang, đã
   * qua ngưỡng, và cỗ đã xào đủ. Thiếu một điều kiện là dòng nhắc hứa cắt mà
   * thả tay ra lại chẳng cắt gì.
   */
  const cutAt =
    grip?.ngang && depth >= GRIP_MIN && passes >= MIN_PASSES
      ? cutAtFor(depth, total)
      : 0;

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
    (deep: number, x: number, nhipNhap = true) => {
      const next = mixSeed(entropyRef.current, deep, x, performance.now());
      entropyRef.current = next;
      const rand = mulberry32(next);
      deckRef.current =
        rand() < 0.65
          ? overhand(deckRef.current, rand)
          : riffle(deckRef.current, rand, rand() < 0.5);
      setPasses((n) => n + 1);
      setTooSoon(false);
      /*
        Buông tay giữa chừng thì chồng bài đã có nhịp trượt về chỗ cũ lo phần
        nhìn rồi; chồng thêm hoạt cảnh nhập vào nữa là nó giật một cái, vì hoạt
        cảnh khởi đi từ chỗ cỗ đã liền chứ không phải chỗ tay đang cầm.
      */
      if (nhipNhap) setAnim(`t24-deck-merge ${PASS_MS}ms`);
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
    kb.current = null;
    setCutting(true);
    const wait = prefersReduced() ? REDUCED_MS : CUT_MS + 140;
    setTimeout(() => {
      deckRef.current = cutDeck(deckRef.current, at);
      setCutting(false);
      setReady(true);
      setSettling(true);
      setGrip(null);
      setTimeout(() => setSettling(false), SETTLE_MS);
    }, wait);
  }, []);

  /** Kéo hụt: trả chồng bài về chỗ cũ rồi xoá dấu vết cú kéo. */
  /** Trả chồng bài về cỗ rồi xoá dấu vết cái nắm tay vừa rồi. */
  const cancelPull = useCallback(() => {
    kb.current = null;
    setSnapping(true);
    setGrip(null);
    setTimeout(() => setSnapping(false), SNAP_MS);
  }, []);

  /* ---------- Ngón tay ---------- */

  const drag = useRef<{
    id: number;
    x0: number;
    y0: number;
    /** Chiều đã chốt cho cả lần giữ tay này; chưa biết thì null. */
    ngang: boolean | null;
    /** Vòng dọc này đã bốc chồng bài sâu nhất tới đâu. */
    deep: number;
    /** Cái tay bốc của vòng dọc đang làm. */
    grab: number;
  } | null>(null);

  const onPointerDown = useCallback(
    (e: ReactPointerEvent<HTMLElement>) => {
      if (cutting) return;
      e.currentTarget.setPointerCapture(e.pointerId);
      /* Cắt xong cỗ đang trượt về giữa; chạm vào là cắt ngang nhịp đó cho bài
         bám tay ngay, chứ không để nó vừa theo tay vừa còn trớn cũ. */
      setSettling(false);
      setSnapping(false);
      kb.current = null;
      drag.current = {
        id: e.pointerId,
        x0: e.clientX,
        y0: e.clientY,
        ngang: null,
        deep: 0,
        grab: tayBoc(),
      };
    },
    [cutting],
  );

  /**
   * Chốt chiều ngay từ đoạn đầu rồi giữ nguyên tới lúc nhả tay. Không chốt thì
   * một cú kéo chéo vừa xào vừa cắt, mà cắt xong là cỗ bài khác hẳn.
   *
   * Chiều dọc: một lần giữ tay làm được mấy vòng liền — bốc ra, đẩy về là xong
   * một lượt, rồi lại bốc ra. Mốc đo neo ở chỗ đặt tay ban đầu suốt cả lần giữ,
   * nên chồng bài luôn nằm đúng nơi ngón tay đang ở.
   */
  const onPointerMove = useCallback(
    (e: ReactPointerEvent<HTMLElement>) => {
      const d = drag.current;
      if (!d || d.id !== e.pointerId) return;
      const dx = e.clientX - d.x0;
      const dy = e.clientY - d.y0;

      if (d.ngang === null) {
        if (Math.abs(dx) > LOCK_SLOP && Math.abs(dx) >= Math.abs(dy)) {
          d.ngang = true;
        } else if (dy > LOCK_SLOP && Math.abs(dy) > Math.abs(dx)) {
          d.ngang = false;
        } else {
          return;
        }
      }

      /* Nhịp nhập vào của vòng trước còn đang chạy thì gỡ, kẻo bài không theo tay. */
      if (anim.current) setAnim(null);
      setSnapping(false);
      setSettling(false);

      if (d.ngang) {
        const s = clamp(Math.abs(dx) - LOCK_SLOP, 0, CUT_MAX);
        setGrip(s > 0 ? { ngang: true, d: dx < 0 ? -s : s, grab: 1 } : null);
        /* Cỗ chưa xào mấy mà đã đòi cắt thì nhắc ngay từ lúc còn đang kéo. */
        if (s >= GRIP_MIN && passes < MIN_PASSES) setTooSoon(true);
        return;
      }

      const p = clamp(dy - LOCK_SLOP, 0, PULL_MAX);
      /* Về sát cỗ thì coi như không cầm gì nữa — số 0 và "không cầm" là hai
         chuyện khác nhau, dòng nhắc với chồng bài trên tay đều đọc chỗ này. */
      setGrip(p > 0 ? { ngang: false, d: p, grab: d.grab } : null);
      d.deep = Math.max(d.deep, p);

      /* Bốc đủ sâu rồi đẩy về sát cỗ: chồng bài đã nhập vào, xong một lượt. */
      if (d.deep >= GRIP_MIN && p <= BACK_PX) {
        const deep = d.deep;
        d.deep = 0;
        /* Vòng sau bốc bằng một tay khác, cho tệp mỗi lần một dày một mỏng. */
        d.grab = tayBoc();
        setGrip(null);
        runPass(deep, e.clientX);
      }
    },
    [passes, runPass, setAnim],
  );

  /**
   * Buông tay ở chiều ngang là đặt hai chồng chồng lại với nhau — đó là nhát
   * cắt. Buông ở chiều dọc thì chồng bài rơi trở lại vào cỗ, tính luôn thành
   * một lượt: nó đã nhập vào cỗ thật, chẳng có cớ gì bắt làm lại.
   */
  const onPointerUp = useCallback(
    (e: ReactPointerEvent<HTMLElement>) => {
      const d = drag.current;
      if (!d || d.id !== e.pointerId) return;
      drag.current = null;

      /* Chạm một cái mà không kéo đi đâu cũng là một lượt, cho ai quen gõ hơn kéo. */
      if (d.ngang === null) {
        runPass(GRIP_MIN, e.clientX);
        return;
      }

      if (!d.ngang) {
        /* Nhịp trượt về lo phần nhìn, nên lượt này không kèm hoạt cảnh nhập vào. */
        if (d.deep >= GRIP_MIN) runPass(d.deep, e.clientX, false);
        cancelPull();
        return;
      }

      const s = clamp(Math.abs(e.clientX - d.x0) - LOCK_SLOP, 0, CUT_MAX);
      if (s < GRIP_MIN) {
        cancelPull();
        return;
      }
      /* Cỗ chưa xào mấy mà đã đòi cắt thì nhắc một câu chứ không cắt. */
      if (passes < MIN_PASSES) {
        setTooSoon(true);
        cancelPull();
        return;
      }
      commitCut(cutAtFor(s, total));
    },
    [cancelPull, commitCut, passes, runPass, total],
  );

  const onKeyDown = useCallback(
    (e: ReactKeyboardEvent<HTMLElement>) => {
      if (cutting) return;
      const k = e.key;
      const ngang = k === "ArrowLeft" || k === "ArrowRight";
      const doc = k === "ArrowDown" || k === "ArrowUp";
      /*
        Mũi tên đi đúng hai đường ngón tay đi: dọc để bốc chồng ra rồi nhập lại,
        ngang để tách cỗ làm hai. Quãng kéo giữ trong ref chứ không đọc từ state
        — giữ phím thì mấy nhịp liền nhau rơi vào cùng một lượt dựng, đọc từ
        state là nhịp sau đè nhịp trước, bấm mười cái vẫn đứng yên một chỗ.
      */
      if (ngang || doc) {
        e.preventDefault();
        /* Đổi chiều là bỏ cái nắm cũ, y như nhả tay ra rồi nắm lại. */
        const cu = kb.current?.ngang === ngang ? kb.current.d : 0;
        const max = ngang ? CUT_MAX : PULL_MAX;
        const buoc = (k === "ArrowDown" || k === "ArrowRight" ? 1 : -1) * (max / 12);
        /* Bắt đầu một vòng dọc mới thì gieo lại tay bốc, y như bên ngón tay. */
        const grab = cu === 0 ? tayBoc() : (kb.current?.grab ?? 1);
        /*
          Nhịp đầu nhảy thẳng tới ngưỡng. Nhích từng tí từ 0 lên thì có lúc chỗ
          cắt đã hiện trên màn mà Enter lại chưa cắt được, vì quãng kéo chưa qua
          ngưỡng.
        */
        let moi =
          cu === 0
            ? buoc > 0 || ngang
              ? Math.sign(buoc) * GRIP_MIN
              : 0
            : cu + buoc;
        moi = clamp(moi, -max, max);
        if (Math.abs(moi) < GRIP_MIN) moi = 0;

        const daBoc = !ngang && Math.abs(cu) >= GRIP_MIN;
        kb.current = moi === 0 ? null : { ngang, d: moi, grab };
        /*
          Nhịp nhập vào của lượt trước còn đang chạy thì gỡ, y như bên ngón tay:
          hoạt cảnh đè lên transform trong style, không gỡ thì bấm phím ngay sau
          một lượt xào là chồng bài đứng im mất một nhịp.
        */
        if (anim.current) setAnim(null);
        setSnapping(false);
        setSettling(false);
        setGrip(kb.current);
        /* Đẩy về sát cỗ sau khi đã bốc ra: chồng bài nhập vào, xong một lượt. */
        if (daBoc && moi === 0) runPass(GRIP_MIN, 0);
        if (ngang && Math.abs(moi) >= GRIP_MIN && passes < MIN_PASSES) {
          setTooSoon(true);
        }
        return;
      }
      if (k === "Enter" && kb.current?.ngang) {
        e.preventDefault();
        /* Cỗ chưa xào mấy mà đã đòi cắt thì nhắc một câu chứ không cắt. */
        if (passes < MIN_PASSES) {
          setTooSoon(true);
          cancelPull();
          return;
        }
        commitCut(cutAtFor(Math.abs(kb.current.d), total));
        return;
      }
      if (k === "Enter" || k === " ") {
        e.preventDefault();
        runPass(GRIP_MIN, 0);
      }
    },
    [cancelPull, commitCut, cutting, passes, runPass, setAnim, total],
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
      /*
        Ghi đúng số lượt máy vừa làm: autoShuffle chạy hai lượt chẻ bài và một
        lượt tráo dồn. Không ghi thì màn hình vừa báo "đã cắt xong" vừa bảo
        "xào thêm vài lượt rồi hãy cắt" nếu người rút muốn tự cắt lại.
      */
      setPasses((n) => Math.max(n, MIN_PASSES));
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
    /*
      Kéo ngang thì chồng dạt hẳn sang bên, nằm cùng mặt bàn với cỗ. Kéo dọc thì
      nó đi về phía người rút, kèm một quãng chếch ngang cho khỏi che mất cỗ.
    */
    const x = grip ? (grip.ngang ? grip.d : depth * PULL_DRIFT) : 0;
    const y = grip && !grip.ngang ? depth * PULL_SCALE : 0;

    if (cutting) {
      /* Chồng vừa tách hạ xuống thành đáy cỗ mới, phần gốc chồng lên trên nó. */
      const nz = inPacket ? (i - (STACK - packet)) * ZSTEP : (i + packet) * ZSTEP;
      return `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, ${nz.toFixed(1)}px)`;
    }
    if (inPacket) {
      return `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, ${(z + LIFT).toFixed(1)}px)`;
    }
    return `translate3d(0, 0, ${z.toFixed(1)}px)`;
  };

  const moving = cutting || snapping || settling;
  const moveMs = cutting ? CUT_MS : settling ? SETTLE_MS : SNAP_MS;
  const hint = cutting
    ? "Đang cắt cỗ…"
    : cutAt
      ? `Cắt ở lá thứ ${cutAt} · thả tay ra là chồng lại`
      : grip?.ngang
        ? passes < MIN_PASSES
          ? "Xào thêm vài lượt rồi hãy cắt"
          : "Kéo ngang thêm chút nữa để cắt"
        : grip
          ? "Đẩy lên để nhập lại · một vòng là một lượt xào"
          : ready
            ? `Đã xào ${passes} lượt và cắt xong · làm tiếp hoặc bắt đầu rút`
            : tooSoon
              ? "Xào thêm vài lượt rồi hãy cắt"
              : passes === 0
                ? "Kéo cỗ bài xuống phía bạn để tách một chồng ra"
                : passes < MIN_PASSES
                  ? `Đã xào ${passes} lượt · làm thêm ${MIN_PASSES - passes} vòng nữa`
                  : `Đã xào ${passes} lượt · kéo ngang để cắt cỗ`;

  return (
    <div className="mx-auto flex w-full max-w-[720px] flex-col px-5 pt-6 pb-10 md:px-0">
      <h1 className="font-serif text-xl text-ink md:text-2xl">Xào bài</h1>
      <p className="mt-1.5 text-[13.5px]/[1.65] text-pretty text-muted">
        Giữ câu hỏi trong đầu. Kéo cỗ xuống rồi đẩy lên là một lượt xào, kéo
        ngang cho cỗ tách làm hai rồi thả tay là cắt.
      </p>

      <div
        role="button"
        tabIndex={cutting ? -1 : 0}
        /* Nhãn kể cả đường bàn phím, vì dòng nhắc dưới màn chỉ nói tới ngón tay. */
        aria-label={`Cỗ bài. Kéo xuống rồi đẩy lên là một lượt xào, kéo ngang rồi thả tay là cắt cỗ. Bằng bàn phím: mũi tên xuống bốc chồng ra, mũi tên lên nhập lại, mũi tên trái phải chọn chỗ cắt rồi Enter. Đã xào ${passes} lượt${
          ready ? ", đã cắt" : ""
        }.`}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        onKeyDown={onKeyDown}
        /*
          touch-none vì ở đây cả hai chiều đều là thao tác: ngang thì xào, dọc
          thì cắt. Bù lại cả bước này gói trong một màn, không có gì để cuộn.
        */
        className={`relative mx-auto mt-6 h-[292px] w-full max-w-[360px] touch-none select-none ${
          cutting ? "cursor-default" : "cursor-grab active:cursor-grabbing"
        }`}
      >
        {/* Quầng ấm hắt quanh cỗ, nằm ngoài mặt bàn nên không bị ngả theo. */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-[26px] h-[140px] rounded-[50%]"
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
            className="absolute top-[10px] left-1/2 h-[192px] w-[128px] -translate-x-1/2 [transform-style:preserve-3d]"
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
                  ? `translate3d(${(grip?.ngang ? grip.d : 0).toFixed(1)}px, 0, -1px)`
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
        <p
          role="status"
          className={`text-center text-[13px] ${
            cutAt
              ? "text-gold"
              : tooSoon || (grip?.ngang && passes < MIN_PASSES)
                ? "text-rust"
                : "text-muted"
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
