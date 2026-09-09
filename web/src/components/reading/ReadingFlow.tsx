"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { TarotCardFace, TarotCardSlot } from "@/components/TarotCardFace";
import { buttonClass, Disclaimer, Eyebrow } from "@/components/ui";
import { getCard } from "@/lib/cards";
import { detectGuard } from "@/lib/guard";
import { betterSpread, detectVague } from "@/lib/question";
import {
  applyUprightOnly,
  makeSeed,
  shuffleDeck,
  type DrawnCard,
} from "@/lib/draw";
import { composeReading } from "@/lib/reading";
import { decodeReading, encodeReading } from "@/lib/share";
import { TOPICS, type Spread, type TopicKey } from "@/lib/spreads";
import { DeckSpread, GATHER_MS } from "./DeckSpread";
import { ReadingView, type FollowUp } from "./ReadingView";
import { ShuffleRitual } from "./ShuffleRitual";

type Step = "ask" | "shuffle" | "draw" | "result";

const MAX_QUESTION = 200;

/** Thu xong thì để chồng bài nằm yên một nhịp, đừng cắt cảnh ngay. */
const SETTLE_MS = 400;

/**
 * Cả đoạn kết màn rút bài: thu bài, nghỉ, rồi mờ đi. Phải khớp với
 * --animate-step-out trong globals.css, ở đó độ trễ đúng bằng GATHER_MS +
 * SETTLE_MS và thời lượng đúng bằng 320ms.
 */
const OUTRO_MS = GATHER_MS + SETTLE_MS + 320;

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
  const [topic, setTopic] = useState<TopicKey>(
    initial?.topic ?? spread.defaultTopic,
  );
  const [seed, setSeed] = useState(0);
  /**
   * Cỗ bài của lượt này. Nó là trạng thái chứ không phải hàm của seed, vì từ
   * bước xào trở đi chính người rút mới là người xáo nó: mỗi cú vuốt, rồi nhát
   * cắt cỗ, đều đổi thật thứ tự mảng này.
   */
  const [deck, setDeck] = useState<DrawnCard[]>([]);
  const [picked, setPicked] = useState<number[]>([]);
  const [shareId, setShareId] = useState(initial ? restored! : "");
  const [essay, setEssay] = useState<string | null>(null);
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
    setPicked([]);
    setStep("shuffle");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  /** Người rút xào và cắt xong thì nhận lại cỗ bài của họ, rồi mở ra cho chạm chọn. */
  const finishShuffle = useCallback((shuffled: DrawnCard[]) => {
    setDeck(shuffled);
    setStep("draw");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

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
      let list: FollowUp[] = [];
      try {
        const res = await fetch("/api/reading", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ id: shareId }),
          signal: ctl.signal,
        });
        const data = (await res.json()) as {
          essay?: string | null;
          followUps?: FollowUp[];
        };
        text = data.essay ?? null;
        list = data.followUps ?? [];
      } catch {
        /* Mạng hỏng hoặc máy chủ lỗi thì rơi về bản dựng cục bộ. */
      }
      if (!alive) return;
      setEssay(text);
      setFollowUps(list);
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

  const redraw = useCallback(() => {
    setShareId("");
    setEssay(null);
    setEssayFor(null);
    setFollowUps([]);
    setPicked([]);
    setDeck([]);
    setSeed(0);
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
          <Eyebrow>Lĩnh vực</Eyebrow>
          <div className="flex flex-wrap gap-2">
            {TOPICS.map((t) => {
              const active = t.key === topic;
              return (
                <button
                  key={t.key}
                  type="button"
                  aria-pressed={active}
                  onClick={() => setTopic(t.key)}
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

  /* ---------- Bước 3 · chạm chọn lá ---------- */
  if (step === "draw") {
    const slotCols = Math.min(spread.count, 5);
    return (
      <div
        className={`flex flex-col pb-8 ${gathering ? "animate-step-out" : ""}`}
      >
        <div className="mx-auto w-full max-w-[720px] px-5 pt-6 md:px-0">
          <div className="flex items-baseline justify-between">
            <h1 className="font-serif text-xl text-ink md:text-2xl">
              Chạm chọn {spread.count} lá
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
            className="mx-auto mt-4 grid gap-2 [--slot:150px] sm:gap-3 md:[--slot:200px]"
            style={{
              gridTemplateColumns: `repeat(${slotCols}, minmax(0, 1fr))`,
              maxWidth: `calc(${slotCols} * var(--slot) + ${(slotCols - 1) * 12}px)`,
            }}
          >
            {spread.positions.map((pos, i) => {
              const card = drawn[i] ? getCard(drawn[i].slug) : undefined;
              const isNext = i === picked.length;
              return (
                <div
                  key={pos.label}
                  className="flex flex-col items-center gap-2"
                >
                  {card ? (
                    <TarotCardFace
                      imageId={card.id}
                      title={card.vi}
                      face="up"
                      reversed={drawn[i].reversed}
                      className="w-full animate-fly"
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
        */}
        <div className="mt-8">
          <DeckSpread
            total={deck.length}
            picked={picked}
            locked={picked.length >= spread.count}
            gathering={gathering}
            onPick={(i) => setPicked((p) => (p.includes(i) ? p : [...p, i]))}
          />
        </div>
      </div>
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
        followUps={followUps}
        onAsk={askServer}
      />
    </div>
  );
}
