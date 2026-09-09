"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { TarotCardSlot } from "@/components/TarotCardFace";
import { buttonClass, Disclaimer, Eyebrow } from "@/components/ui";
import { CARDS, getCard } from "@/lib/cards";
import { detectGuard } from "@/lib/guard";
import { betterSpread, detectTopic, detectVague } from "@/lib/question";
import {
  applyUprightOnly,
  makeSeed,
  mulberry32,
  shuffleDeck,
  type DrawnCard,
} from "@/lib/draw";
import { composeClarifier, composeReading } from "@/lib/reading";
import { decodeReading, encodeReading } from "@/lib/share";
import { TOPICS, type Spread, type TopicKey } from "@/lib/spreads";
import { BoardCard, REVEAL_MS } from "./BoardCard";
import { DeckPile } from "./DeckPile";
import { DeckSpread, GATHER_MS } from "./DeckSpread";
import { RitualRoom } from "./RitualRoom";
import type { DeckSpot } from "./deck-spot";
import {
  ReadingView,
  type Clarifier,
  type FollowUp,
  type ReadingParts,
} from "./ReadingView";
import { ShuffleRitual } from "./ShuffleRitual";

type Step = "ask" | "shuffle" | "draw" | "result";

const MAX_QUESTION = 200;

/** Xong hết rồi thì để cả bàn nằm yên một nhịp, đừng cắt cảnh ngay. */
const HOLD_MS = 320;

/**
 * Cả đoạn kết màn rút bài. Hai việc chạy song song: lá cuối bay về ô rồi lật
 * ngửa, và cỗ bài còn lại được thu về — cái nào xong sau thì đợi cái đó, rồi
 * nghỉ một nhịp mới mờ đi. Phải khớp với --animate-step-out trong globals.css,
 * ở đó độ trễ đúng bằng đoạn chờ ấy và thời lượng đúng bằng 320ms.
 */
const OUTRO_MS = Math.max(REVEAL_MS, GATHER_MS) + HOLD_MS + 320;

/** Tắt hiệu ứng chuyển động thì chỉ giữ lại một nhịp cho đỡ giật màn. */
const OUTRO_MS_REDUCED = 220;

export function ReadingFlow({ spread }: { spread: Spread }) {
  const router = useRouter();
  const params = useSearchParams();
  const restored = params.get("r");
  /** Câu hỏi mang sang từ ô hỏi ở trang chủ, đã gõ rồi thì khỏi gõ lại. */
  const carried = params.get("q") ?? "";

  /** Bài đọc có sẵn trong đường dẫn: mở thẳng ở bước kết quả, tải lại trang không mất. */
  const initial = useMemo(() => {
    const state = restored ? decodeReading(restored) : null;
    return state && state.spread === spread.slug ? state : null;
  }, [restored, spread.slug]);

  const [step, setStep] = useState<Step>(initial ? "result" : "ask");
  /* Khởi tạo lười: câu mang sang chỉ đọc một lần lúc dựng, và React Compiler
     giữ được phần ghi nhớ thủ công của cả khối này. */
  const [question, setQuestion] = useState(
    () => initial?.question ?? carried.slice(0, MAX_QUESTION),
  );
  /**
   * Lĩnh vực người rút tự chọn. Chưa chọn thì để null và đoán từ câu hỏi —
   * ngoài đời người đọc nghe chuyện rồi tự biết đang xem mảng nào, không bắt
   * khách khai. Bài mở lại từ đường dẫn thì lĩnh vực đã chốt rồi, giữ nguyên.
   */
  const [pickedTopic, setPickedTopic] = useState<TopicKey | null>(
    initial?.topic ?? null,
  );
  const guessedTopic = useMemo(() => detectTopic(question), [question]);
  const topic: TopicKey = pickedTopic ?? guessedTopic ?? spread.defaultTopic;
  const [seed, setSeed] = useState(0);
  /**
   * Cỗ bài của lượt này. Nó là trạng thái chứ không phải hàm của seed, vì từ
   * bước xào trở đi chính người rút mới là người xáo nó: mỗi cú vuốt, rồi nhát
   * cắt cỗ, đều đổi thật thứ tự mảng này.
   */
  const [deck, setDeck] = useState<DrawnCard[]>([]);
  /**
   * Những lá đã rút, theo đúng thứ tự rút: `at` là chỗ nó nằm trong cỗ, `from`
   * là chỗ trên màn nó vừa rời đi. Hai thứ đi chung một chỗ vì chúng sinh ra
   * cùng một lúc — tách làm hai danh sách thì có ngày lệch nhau một nhịp và lá
   * bay đi từ chỗ của lá khác.
   */
  const [taken, setTaken] = useState<{ at: number; from: DeckSpot }[]>([]);
  const picked = useMemo(() => taken.map((t) => t.at), [taken]);
  /**
   * Cỗ đã xoè ra thành dải bài hay chưa. Mở màn rút bài thì chưa: cỗ nằm úp ở
   * góc trái, chạm vào là rút lá trên cùng. Xoè hay không là việc của người
   * rút, kéo cỗ sang phải thì nó mới trải ra.
   */
  const [fanned, setFanned] = useState(false);
  /** Chỗ cỗ bài vừa đứng ở màn xào, để bàn bài đón nó từ đúng đó. */
  const [deckFrom, setDeckFrom] = useState<DeckSpot | null>(null);
  const [shareId, setShareId] = useState(initial ? restored! : "");
  const [essay, setEssay] = useState<string | null>(null);
  const [parts, setParts] = useState<ReadingParts | null>(null);
  const [clarifiers, setClarifiers] = useState<Clarifier[]>([]);
  /** Mã bài đọc mà lượt xin bài luận đã xong, dùng để suy ra trạng thái chờ */
  const [essayFor, setEssayFor] = useState<string | null>(null);
  const [followUps, setFollowUps] = useState<FollowUp[]>([]);
  const resultRef = useRef<HTMLDivElement>(null);

  const drawn: DrawnCard[] = useMemo(
    () => applyUprightOnly(spread, picked.map((i) => deck[i]).filter(Boolean)),
    [picked, deck, spread],
  );

  const activeCards = step === "result" && initial ? initial.cards : drawn;

  /** Rút đủ lá rồi thì cỗ bài đang được thu lại, không cần giữ thêm trạng thái. */
  const gathering = step === "draw" && picked.length >= spread.count;

  const reading = useMemo(() => {
    if (step !== "result" || activeCards.length < spread.count) return null;
    return composeReading({
      spread: spread.slug,
      question,
      topic,
      cards: activeCards,
      at: 0,
    });
  }, [step, activeCards, spread.slug, spread.count, question, topic]);

  const startShuffle = useCallback(() => {
    const s = makeSeed();
    setSeed(s);
    /* Cỗ bài mở ra đúng như nó nằm sau lượt đọc trước, chứ không xếp theo bộ. */
    setDeck(shuffleDeck(s));
    setTaken([]);
    setFanned(false);
    setDeckFrom(null);
    setStep("shuffle");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  /**
   * Người rút xào và cắt xong thì nhận lại cỗ bài của họ. Cỗ sang bàn bài vẫn
   * nằm úp nguyên chồng — `from` là chỗ nó vừa đứng ở màn xào, để nó bay từ đó
   * về góc trái bàn chứ không hiện ra ở chỗ khác.
   */
  const finishShuffle = useCallback(
    (shuffled: DrawnCard[], from: DeckSpot | null) => {
      setDeck(shuffled);
      setDeckFrom(from);
      setStep("draw");
      window.scrollTo({ top: 0, behavior: "smooth" });
    },
    [],
  );

  /** Nhận một lá vào bàn, nhớ luôn chỗ nó vừa rời đi để nó bay từ đúng đó. */
  const takeCard = useCallback(
    (at: number, from: DeckSpot) => {
      setTaken((t) =>
        t.length >= spread.count || t.some((x) => x.at === at)
          ? t
          : [...t, { at, from }],
      );
    },
    [spread.count],
  );

  /**
   * Chạm vào cỗ úp: rút lá trên cùng. Cỗ nằm theo thứ tự vừa xào, lá đầu mảng
   * là lá trên cùng — đúng lá mà người đọc lật lên nếu không trải cả bộ ra.
   */
  const drawTop = useCallback(
    (from: DeckSpot) => {
      setTaken((t) => {
        if (t.length >= spread.count) return t;
        for (let i = 0; i < deck.length; i++) {
          if (!t.some((x) => x.at === i)) return [...t, { at: i, from }];
        }
        return t;
      });
    },
    [deck.length, spread.count],
  );

  /**
   * Chọn đủ lá thì thu cỗ bài lại — ngoài đời người đọc cũng vỗ gọn cỗ còn lại
   * rồi để sang bên — xong mới sang kết quả và ghi mã bài đọc vào đường dẫn.
   */
  useEffect(() => {
    if (step !== "draw" || picked.length < spread.count) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const t = setTimeout(() => {
      const id = encodeReading({
        spread: spread.slug,
        question,
        topic,
        cards: picked.map((i) => deck[i]),
        at: Date.now(),
      });
      setShareId(id);
      setStep("result");
      router.replace(`/rut-bai/${spread.slug}?r=${id}`, { scroll: false });
      window.scrollTo({ top: 0, behavior: "smooth" });
    }, reduced ? OUTRO_MS_REDUCED : OUTRO_MS);
    return () => clearTimeout(t);
  }, [step, picked, spread.count, spread.slug, deck, question, topic, router]);

  /** Xin bài luận cho mã hiện tại; chưa cấu hình mô hình thì giữ bản dựng cục bộ. */
  useEffect(() => {
    if (step !== "result" || !shareId || essayFor === shareId) return;
    const ctl = new AbortController();
    let alive = true;
    void (async () => {
      let text: string | null = null;
      let shaped: ReadingParts | null = null;
      let list: FollowUp[] = [];
      let hints: Clarifier[] = [];
      try {
        const res = await fetch("/api/reading", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ id: shareId }),
          signal: ctl.signal,
        });
        const data = (await res.json()) as {
          essay?: string | null;
          parts?: ReadingParts | null;
          followUps?: FollowUp[];
          clarifiers?: Clarifier[];
        };
        text = data.essay ?? null;
        shaped = data.parts ?? null;
        list = data.followUps ?? [];
        hints = data.clarifiers ?? [];
      } catch {
        /* Mạng hỏng hoặc máy chủ lỗi thì rơi về bản dựng cục bộ. */
      }
      if (!alive) return;
      setEssay(text);
      setParts(shaped);
      setFollowUps(list);
      setClarifiers(hints);
      setEssayFor(shareId);
    })();
    return () => {
      alive = false;
      ctl.abort();
    };
  }, [step, shareId, essayFor]);

  const essayState: "loading" | "ready" =
    step === "result" && shareId && essayFor !== shareId ? "loading" : "ready";

  const askServer = useCallback(
    async (question: string) => {
      if (!shareId || !essay) return false;
      try {
        const res = await fetch("/api/reading/hoi-them", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ id: shareId, question }),
        });
        const data = (await res.json()) as {
          answer?: string | null;
          followUps?: FollowUp[];
        };
        if (!data.answer) return false;
        setFollowUps(data.followUps ?? []);
        return true;
      } catch {
        return false;
      }
    },
    [shareId, essay],
  );

  /**
   * Rút một lá làm rõ cho một vị trí.
   *
   * Lá lấy từ chỗ cỗ bài đang nằm sau lượt rút, tức là lá trên cùng của phần
   * chưa ai đụng tới — đúng như ngoài đời người đọc lật thêm một lá đặt cạnh
   * vị trí đang tối nghĩa. Mở lại bài từ đường dẫn thì không còn cỗ nữa, lúc
   * đó bốc theo mã bài để cùng một bài đọc luôn ra cùng một lá.
   */
  const drawClarifier = useCallback(
    (stt: number): DrawnCard | null => {
      const used = new Set([
        ...activeCards.map((c) => c.slug),
        ...clarifiers.map((c) => c.slug),
      ]);

      if (deck.length) {
        const taken = new Set(picked);
        for (let i = 0; i < deck.length; i++) {
          if (!taken.has(i) && !used.has(deck[i].slug)) return deck[i];
        }
      }

      const pool = CARDS.filter((c) => !used.has(c.slug));
      if (!pool.length) return null;
      let h = stt;
      for (const ch of shareId) h = (h * 31 + ch.charCodeAt(0)) | 0;
      const rand = mulberry32(h >>> 0);
      return { slug: pool[Math.floor(rand() * pool.length)].slug, reversed: rand() < 0.32 };
    },
    [activeCards, clarifiers, deck, picked, shareId],
  );

  const clarify = useCallback(
    async (stt: number) => {
      const card = drawClarifier(stt);
      if (!card) return;

      try {
        const res = await fetch("/api/reading/lam-ro", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ id: shareId, stt, ...card }),
        });
        const data = (await res.json()) as { clarifiers?: Clarifier[] | null };
        if (data.clarifiers?.length) {
          setClarifiers(data.clarifiers);
          return;
        }
      } catch {
        /* Máy chủ im thì vẫn đọc được lá vừa rút bằng bộ soạn cục bộ. */
      }

      const pos = spread.positions[stt - 1];
      const tc = getCard(card.slug);
      if (!pos || !tc) return;
      setClarifiers((prev) => [
        ...prev,
        {
          stt,
          slug: card.slug,
          reversed: card.reversed,
          answer: composeClarifier(tc, card.reversed, pos, topic),
        },
      ]);
    },
    [drawClarifier, shareId, spread.positions, topic],
  );

  const redraw = useCallback(() => {
    setShareId("");
    setEssay(null);
    setParts(null);
    setEssayFor(null);
    setFollowUps([]);
    setClarifiers([]);
    setTaken([]);
    setFanned(false);
    setDeckFrom(null);
    setDeck([]);
    setSeed(0);
    setPickedTopic(null);
    setStep("ask");
    router.replace(`/rut-bai/${spread.slug}`, { scroll: false });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [router, spread.slug]);

  const guard = useMemo(() => detectGuard(question), [question]);
  const vague = useMemo(() => detectVague(question), [question]);
  /** Kiểu trải khác hợp câu này hơn hẳn kiểu đang mở; không có thì null. */
  const other = useMemo(() => betterSpread(question, spread), [question, spread]);

  /* ---------- Bước 1 · đặt câu hỏi ---------- */
  if (step === "ask") {
    return (
      <div className="mx-auto flex max-w-[720px] flex-col gap-3 px-5 pt-4 pb-8 md:px-0 md:pt-10">
        <div className="flex flex-col gap-2.5">
          <h1 className="font-serif text-[27px]/[1.2] text-balance text-ink md:text-[38px]/[1.15]">
            {spread.name}
          </h1>
          <p className="text-sm/[1.65] text-pretty text-muted md:text-base">
            {spread.blurb}
          </p>
        </div>

        <div className="mt-3 flex flex-col gap-2.5">
          <Eyebrow>Gợi ý câu hỏi</Eyebrow>
          {spread.fits.slice(0, 3).map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setQuestion(s)}
              className="rounded-full border border-line bg-surface px-4 py-2.5 text-left text-[13.5px] text-ink transition-colors hover:border-gold/50 md:text-[15px]"
            >
              {s}
            </button>
          ))}
        </div>

        <div className="mt-2 flex flex-col rounded-xl border border-line bg-surface p-4 focus-within:border-gold/50">
          <label htmlFor="cau-hoi" className="sr-only">
            Câu hỏi của bạn
          </label>
          <textarea
            id="cau-hoi"
            value={question}
            onChange={(e) => setQuestion(e.target.value.slice(0, MAX_QUESTION))}
            rows={3}
            placeholder={spread.placeholder}
            className="min-h-[72px] resize-none bg-transparent text-[15px]/[1.6] text-ink outline-none placeholder:text-muted"
          />
          <span className="self-end text-xs text-muted">
            {question.length} / {MAX_QUESTION}
          </span>
        </div>

        {guard ? (
          <div className="mt-1 flex flex-col gap-1.5 rounded-xl border border-rust/45 bg-rust/8 p-3.5">
            <p className="label-eyebrow text-rust">{guard.label}</p>
            <p className="text-[13.5px]/[1.6] text-pretty text-ink">
              {guard.hint}
            </p>
          </div>
        ) : null}

        {/*
          Câu hỏi mơ hồ thì nhắc chứ không chặn, y như người đọc ngoài đời gặng
          lại một câu rồi vẫn rút. Đã có cảnh báo chủ đề cấm thì thôi, đừng dồn
          hai ô cảnh báo chồng lên nhau.
        */}
        {!guard && vague ? (
          <div className="mt-1 flex flex-col gap-1.5 rounded-xl border border-gold/40 bg-gold/6 p-3.5">
            <p className="label-eyebrow text-gold">{vague.label}</p>
            <p className="text-[13.5px]/[1.6] text-pretty text-ink">
              {vague.hint}
            </p>
          </div>
        ) : null}

        {/* Câu hỏi hợp kiểu trải khác hơn hẳn thì mời đổi, mang theo câu đã gõ. */}
        {other ? (
          <Link
            href={`/rut-bai/${other.spread.slug}?q=${encodeURIComponent(question.trim())}`}
            className="mt-1 flex flex-col gap-1.5 rounded-xl border border-line bg-surface p-3.5 transition-colors hover:border-gold/50"
          >
            <p className="text-[13.5px]/[1.6] text-pretty text-ink">
              Câu này hợp{" "}
              <span className="font-semibold text-gold">{other.spread.name}</span>{" "}
              hơn. {other.reason}
            </p>
            <span className="text-[13px] font-medium text-gold">
              Đổi sang trải đó →
            </span>
          </Link>
        ) : null}

        <div className="mt-2 flex flex-col gap-2.5">
          <div className="flex flex-wrap items-baseline gap-x-2.5 gap-y-1">
            <Eyebrow>Lĩnh vực</Eyebrow>
            {!pickedTopic && guessedTopic ? (
              <span className="text-[12.5px] text-muted">
                đoán từ câu hỏi, đổi được
              </span>
            ) : null}
          </div>
          <div className="flex flex-wrap gap-2">
            {TOPICS.map((t) => {
              const active = t.key === topic;
              return (
                <button
                  key={t.key}
                  type="button"
                  aria-pressed={active}
                  onClick={() => setPickedTopic(t.key)}
                  className={`rounded-full border px-4 py-2 text-[13.5px] transition-colors ${
                    active
                      ? "border-gold bg-gold font-semibold text-bg"
                      : "border-line text-muted hover:border-gold/50 hover:text-ink"
                  }`}
                >
                  {t.label}
                </button>
              );
            })}
          </div>
        </div>

        <p className="mt-3 border-l border-line pl-3.5 text-[13.5px]/[1.7] text-pretty text-muted">
          {spread.how}
        </p>

        {/*
          Không có câu hỏi thì bài luận chẳng biết bám vào đâu, nên nút chính
          đóng lại. Vẫn chừa một lối đi cho người chỉ muốn xem bàn bài, nhưng
          bắt họ chọn lấy chứ không để trôi qua như mặc định.
        */}
        <div className="mt-5 flex flex-col gap-3">
          <button
            type="button"
            onClick={startShuffle}
            disabled={!question.trim()}
            className={buttonClass("primary", "block")}
          >
            Xào bài
          </button>
          {!question.trim() ? (
            <button
              type="button"
              onClick={startShuffle}
              className="self-center text-[13.5px] text-muted underline underline-offset-4 transition-colors hover:text-gold-hi"
            >
              Rút không có câu hỏi cụ thể
            </button>
          ) : null}
          <Disclaimer />
        </div>
      </div>
    );
  }

  /* ---------- Bước 2 · xào bài và cắt cỗ ---------- */
  if (step === "shuffle") {
    return <ShuffleRitual deck={deck} seed={seed} onDone={finishShuffle} />;
  }

  /* ---------- Bước 3 · rút lá ---------- */
  if (step === "draw") {
    const slotCols = Math.min(spread.count, 5);
    /*
      Bề ngang cái bàn. Dòng tiêu đề và hàng ô bài đọc chung một con số này, để
      tên bước nằm thẳng mép trái ô đầu và số đếm thẳng mép phải ô cuối — trước
      đây tiêu đề rộng bằng cả cột 720 nên nó dạt ra ngoài bàn cả gang tay.
    */
    const banRong = `calc(${slotCols} * var(--slot) + ${(slotCols - 1) * 12}px)`;
    return (
      <>
        {/*
          Cùng căn phòng của màn xào, đi tiếp sang đây: cỗ bài vừa được mang từ
          bàn xào sang đặt xuống góc bàn này, chứ không phải sang một chỗ khác.

          Phòng nằm ngoài khối mờ đi chứ không nằm trong: animate-step-out có
          transform, mà tổ tiên có transform thì con position:fixed neo vào tổ
          tiên ấy thay vì vào khung nhìn — phòng co lại bằng cột chữ ngay lúc lá
          cuối vừa rơi xuống. Nên nó đứng riêng, tự mờ theo cùng một nhịp.
        */}
        <RitualRoom className={gathering ? "animate-step-out" : ""} />
        {/*
          Máy rộng thì cả bàn bài đứng giữa khung nhìn, y như bàn xào. min-h chứ
          không phải h: kiểu trải mười hai lá cao hơn màn thì khung tự nở ra,
          không có chuyện canh giữa rồi hàng ô trên cùng trôi khỏi màn.
        */}
        <div
          className={`flex flex-col pb-8 md:min-h-[calc(100svh-77px)] md:justify-center ${
            gathering ? "animate-step-out" : ""
          }`}
        >
          {/*
            Bàn nằm trên cỗ bài một lớp: lá vừa rút bay lên từ dưới, phải thấy nó
            nhấc khỏi mặt cỗ chứ không phải chui ra từ sau lưng cỗ.
          */}
          <div className="relative z-10 mx-auto w-full max-w-[720px] px-5 pt-6 [--slot:150px] md:px-0 md:pt-0 md:[--slot:200px]">
            <div
              className="mx-auto flex animate-rise items-baseline justify-between"
              style={{ maxWidth: banRong }}
            >
              <h1 className="font-serif text-xl text-ink md:text-2xl">
                Rút {spread.count} lá
              </h1>
              <span className="text-[13px] font-medium text-gold">
                {picked.length} / {spread.count}
              </span>
            </div>

            {/*
              Ô chờ luôn theo tỉ lệ lá bài, nên cột càng ít thì ô càng cao. Chặn
              bề ngang mỗi ô lại để kiểu trải một lá không dựng một khung chiếm
              trọn màn hình, đẩy bộ bài xuống dưới nếp gấp.
            */}
            <div
              className="mx-auto mt-4 grid gap-2 sm:gap-3"
              style={{
                gridTemplateColumns: `repeat(${slotCols}, minmax(0, 1fr))`,
                maxWidth: banRong,
              }}
            >
              {spread.positions.map((pos, i) => {
                const card = drawn[i] ? getCard(drawn[i].slug) : undefined;
                const isNext = i === picked.length;
                return (
                  /*
                    Bàn bày ra từng ô một, trái sang phải, như người đọc đặt tay
                    xuống chỉ chỗ cho từng vị trí trước khi rút.
                  */
                  <div
                    key={pos.label}
                    className="flex animate-rise flex-col items-center gap-2"
                    style={{ animationDelay: `${90 + i * 70}ms` }}
                  >
                    {card ? (
                      <BoardCard
                        imageId={card.id}
                        title={card.vi}
                        reversed={drawn[i].reversed}
                        from={taken[i]?.from ?? null}
                      />
                    ) : (
                      <TarotCardSlot
                        className={isNext ? "animate-pulse" : "opacity-60"}
                      />
                    )}
                    <span
                      className={`text-center text-[11px] font-medium tracking-[0.12em] uppercase ${
                        isNext ? "text-gold" : "text-muted"
                      }`}
                    >
                      {pos.short ?? pos.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/*
            Trước đây chỗ này còn một chồng bài úp để trang trí. Nó vẽ lại đúng
            hình ảnh bộ bài nằm ngay bên dưới mà lại đẩy chỗ chạm chọn xuống dưới
            nếp gấp, nên chỉ giữ lại quầng sáng và đưa xuống sau lưng bộ bài thật.

            Cỗ mở màn ở dạng úp nguyên chồng. Xoè cả bộ ra là một lựa chọn của
            người rút chứ không phải mặc định: kéo cỗ sang phải thì nó mới trải
            thành dải bài, còn không thì chạm vào cỗ là rút lá trên cùng.
          */}
          <div className="mt-8">
            {fanned ? (
              <DeckSpread
                total={deck.length}
                picked={picked}
                locked={picked.length >= spread.count}
                gathering={gathering}
                fanning
                onPick={takeCard}
              />
            ) : (
              <DeckPile
                total={deck.length}
                taken={picked.length}
                locked={picked.length >= spread.count}
                from={deckFrom}
                aside={gathering}
                onFan={() => setFanned(true)}
                onDraw={drawTop}
              />
            )}
          </div>
        </div>
      </>
    );
  }

  /* ---------- Bước 4 · kết quả ---------- */
  if (!reading) {
    return (
      <div className="px-5 py-16 text-center text-sm text-muted">
        Không dựng lại được bài đọc này.{" "}
        <button
          type="button"
          onClick={redraw}
          className="text-gold hover:text-gold-hi"
        >
          Rút lại
        </button>
      </div>
    );
  }

  return (
    <div
      ref={resultRef}
      className="animate-fade px-5 pt-6 pb-4 md:px-[60px] md:pt-10"
    >
      <ReadingView
        reading={reading}
        shareUrl={`/doc/${shareId}`}
        onRedraw={redraw}
        essay={essay}
        essayState={essayState}
        parts={parts}
        followUps={followUps}
        clarifiers={clarifiers}
        onAsk={askServer}
        onClarify={clarify}
      />
    </div>
  );
}
