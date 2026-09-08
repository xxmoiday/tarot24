"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { TarotCardFace, TarotCardSlot } from "@/components/TarotCardFace";
import { buttonClass, Disclaimer, Eyebrow } from "@/components/ui";
import { getCard } from "@/lib/cards";
import { detectGuard } from "@/lib/guard";
import {
  applyUprightOnly,
  makeSeed,
  shuffleDeck,
  type DrawnCard,
} from "@/lib/draw";
import { composeReading } from "@/lib/reading";
import { decodeReading, encodeReading } from "@/lib/share";
import { TOPICS, type Spread, type TopicKey } from "@/lib/spreads";
import { ReadingView, type FollowUp } from "./ReadingView";

type Step = "ask" | "shuffle" | "draw" | "result";

const FAN_SIZE = 24;
const MAX_QUESTION = 200;

export function ReadingFlow({ spread }: { spread: Spread }) {
  const router = useRouter();
  const params = useSearchParams();
  const restored = params.get("r");

  /** Bài đọc có sẵn trong đường dẫn: mở thẳng ở bước kết quả, tải lại trang không mất. */
  const initial = useMemo(() => {
    const state = restored ? decodeReading(restored) : null;
    return state && state.spread === spread.slug ? state : null;
  }, [restored, spread.slug]);

  const [step, setStep] = useState<Step>(initial ? "result" : "ask");
  const [question, setQuestion] = useState(initial?.question ?? "");
  const [topic, setTopic] = useState<TopicKey>(
    initial?.topic ?? spread.defaultTopic,
  );
  const [seed, setSeed] = useState(0);
  const [picked, setPicked] = useState<number[]>([]);
  const [shareId, setShareId] = useState(initial ? restored! : "");
  const [essay, setEssay] = useState<string | null>(null);
  /** Mã bài đọc mà lượt xin bài luận đã xong, dùng để suy ra trạng thái chờ */
  const [essayFor, setEssayFor] = useState<string | null>(null);
  const [followUps, setFollowUps] = useState<FollowUp[]>([]);
  const resultRef = useRef<HTMLDivElement>(null);

  const deck = useMemo(() => (seed ? shuffleDeck(seed) : []), [seed]);
  const drawn: DrawnCard[] = useMemo(
    () => applyUprightOnly(spread, picked.map((i) => deck[i]).filter(Boolean)),
    [picked, deck, spread],
  );

  const activeCards = step === "result" && initial ? initial.cards : drawn;

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
    setSeed(makeSeed());
    setPicked([]);
    setStep("shuffle");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  useEffect(() => {
    if (step !== "shuffle") return;
    const t = setTimeout(() => setStep("draw"), 1100);
    return () => clearTimeout(t);
  }, [step]);

  /** Chọn đủ lá thì chuyển sang kết quả và ghi mã bài đọc vào đường dẫn. */
  useEffect(() => {
    if (step !== "draw" || picked.length < spread.count) return;
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
    }, 620);
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
    setSeed(0);
    setStep("ask");
    router.replace(`/rut-bai/${spread.slug}`, { scroll: false });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [router, spread.slug]);

  const guard = useMemo(() => detectGuard(question), [question]);

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

        <div className="mt-5 flex flex-col gap-3">
          <button
            type="button"
            onClick={startShuffle}
            className={buttonClass("primary", "block")}
          >
            Xào bài
          </button>
          <Disclaimer />
        </div>
      </div>
    );
  }

  /* ---------- Bước 2 · xào bài ---------- */
  if (step === "shuffle") {
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center gap-8 px-5">
        <div className="relative h-[190px] w-[130px]">
          {[0, 1, 2, 3, 4].map((i) => (
            <TarotCardFace
              key={i}
              face="down"
              className="absolute inset-x-0 top-0 w-[130px]"
              style={{
                animation: `t24-fly 900ms cubic-bezier(.22,1,.36,1) ${i * 110}ms infinite alternate`,
                rotate: `${(i - 2) * 5}deg`,
                zIndex: 5 - i,
              }}
            />
          ))}
        </div>
        <p className="text-sm text-muted">Đang xào bài…</p>
      </div>
    );
  }

  /* ---------- Bước 3 · chạm chọn lá ---------- */
  if (step === "draw") {
    return (
      <div className="flex flex-col pb-8">
        <div className="mx-auto w-full max-w-[720px] px-5 pt-6 md:px-0">
          <div className="flex items-baseline justify-between">
            <h1 className="font-serif text-xl text-ink md:text-2xl">
              Chạm chọn {spread.count} lá
            </h1>
            <span className="text-[13px] font-medium text-gold">
              {picked.length} / {spread.count}
            </span>
          </div>

          <div
            className="mt-4 grid gap-2 sm:gap-3"
            style={{
              gridTemplateColumns: `repeat(${Math.min(spread.count, 5)}, minmax(0, 1fr))`,
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

        <div className="relative mt-7 h-[150px]">
          <div
            aria-hidden
            className="absolute top-4 left-1/2 h-[130px] w-[210px] -translate-x-1/2 rounded-[50%]"
            style={{
              background:
                "radial-gradient(ellipse,rgba(201,169,97,0.10),rgba(201,169,97,0) 70%)",
            }}
          />
          {[
            { top: 44, left: -34, rotate: -16, opacity: 0.3, scale: 0.9 },
            { top: 22, left: -14, rotate: -9, opacity: 0.6, scale: 0.95 },
            { top: 0, left: 6, rotate: -3, opacity: 1, scale: 1 },
          ].map((c, i) => (
            <TarotCardFace
              key={i}
              face="down"
              className="absolute left-1/2 w-[86px]"
              style={{
                top: c.top,
                opacity: c.opacity,
                transform: `translateX(calc(-50% + ${c.left}px)) rotate(${c.rotate}deg) scale(${c.scale})`,
              }}
            />
          ))}
        </div>

        <p className="mt-1 text-center text-[13px] text-muted">
          Vuốt ngang để xem hết bộ bài
        </p>

        <div className="no-scrollbar relative mt-3 overflow-x-auto overscroll-x-contain px-5">
          <div
            className="relative mx-auto h-[150px]"
            style={{ width: FAN_SIZE * 34 + 50 }}
          >
            {Array.from({ length: FAN_SIZE }).map((_, i) => {
              const used = picked.includes(i);
              const mid = (FAN_SIZE - 1) / 2;
              const off = (i - mid) / mid;
              return (
                <button
                  key={i}
                  type="button"
                  disabled={used || picked.length >= spread.count}
                  aria-label={`Chọn lá thứ ${i + 1}`}
                  onClick={() =>
                    setPicked((p) => (p.includes(i) ? p : [...p, i]))
                  }
                  className="absolute w-[76px] cursor-pointer transition-all duration-200 hover:-translate-y-3 focus-visible:-translate-y-3 disabled:pointer-events-none disabled:opacity-0"
                  style={{
                    left: i * 34,
                    top: 8 + off * off * 26,
                    rotate: `${off * 15}deg`,
                    zIndex: i,
                  }}
                >
                  <TarotCardFace face="down" className="w-full" />
                </button>
              );
            })}
          </div>
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
    <div ref={resultRef} className="px-5 pt-6 pb-4 md:px-[60px] md:pt-10">
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
