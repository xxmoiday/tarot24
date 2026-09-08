"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { buttonClass, Disclaimer, LeanBadge } from "@/components/ui";
import { CARDS } from "@/lib/cards";
import { mulberry32 } from "@/lib/draw";
import { composeFollowUp, type Reading } from "@/lib/reading";
import { ReadingBoard } from "./ReadingBoard";
import { ShareButton } from "./ShareButton";

const MAX_FOLLOW_UPS = 3;

export interface FollowUp {
  question: string;
  answer: string;
  cardSlug?: string;
}

/** Bài do mô hình viết là văn xuôi liền, tách đoạn theo dòng trống. */
function toParagraphs(essay: string) {
  return essay
    .split(/\n\s*\n|\n/)
    .map((p) => p.trim())
    .filter(Boolean);
}

export function ReadingView({
  reading,
  shareUrl,
  readOnly = false,
  onRedraw,
  essay,
  essayState = "ready",
  followUps: serverFollowUps,
  onAsk,
}: {
  reading: Reading;
  shareUrl: string;
  readOnly?: boolean;
  onRedraw?: () => void;
  /** Bài luận do mô hình viết; không có thì dùng bản dựng cục bộ */
  essay?: string | null;
  essayState?: "loading" | "ready" | "error";
  followUps?: FollowUp[];
  /** Trả về false nếu không gửi được, khi đó rơi về bản cục bộ */
  onAsk?: (question: string) => Promise<boolean>;
}) {
  const [localFollowUps, setLocalFollowUps] = useState<FollowUp[]>([]);
  const [draft, setDraft] = useState("");
  const [asking, setAsking] = useState(false);
  const followUps = serverFollowUps?.length ? serverFollowUps : localFollowUps;

  const boardCards = useMemo(
    () =>
      reading.cards.map((c) => ({
        card: c.card,
        reversed: c.reversed,
        positionLabel: c.position.label,
        positionShort: c.position.short,
      })),
    [reading.cards],
  );

  const used = new Set(reading.cards.map((c) => c.card.slug));

  /** Dựng câu trả lời tại chỗ khi chưa cấu hình mô hình. */
  function askLocally(q: string) {
    const rand = mulberry32(
      q.length * 7919 + followUps.length * 104729 + q.charCodeAt(0),
    );
    const pool = CARDS.filter(
      (c) =>
        !used.has(c.slug) && !localFollowUps.some((f) => f.cardSlug === c.slug),
    );
    const card = pool[Math.floor(rand() * pool.length)] ?? CARDS[0];
    const reversed = rand() < 0.32;
    setLocalFollowUps((prev) => [
      ...prev,
      {
        question: q,
        answer: composeFollowUp(q, card, reversed, reading.topic),
        cardSlug: card.slug,
      },
    ]);
  }

  async function ask() {
    const q = draft.trim();
    if (!q || asking || followUps.length >= MAX_FOLLOW_UPS) return;
    setAsking(true);
    setDraft("");
    try {
      const sent = onAsk ? await onAsk(q) : false;
      if (!sent) askLocally(q);
    } finally {
      setAsking(false);
    }
  }

  const remaining = MAX_FOLLOW_UPS - followUps.length;

  return (
    <div className="flex flex-col gap-0">
      <div className="lg:grid lg:grid-cols-[520px_1fr] lg:items-start lg:gap-20">
        {/* Lá bài */}
        <div className="flex flex-col gap-4.5">
          {reading.question ? (
            <p className="font-serif text-[14.5px]/[1.6] text-muted italic md:text-base">
              {reading.question}
            </p>
          ) : null}

          <ReadingBoard
            cards={boardCards}
            spread={reading.spread}
            topic={reading.topic}
            size="lg"
          />

          {reading.lean ? (
            <div className="flex justify-center pt-2">
              <LeanBadge lean={reading.lean.key} label={reading.lean.label} />
            </div>
          ) : null}

          <p className="text-[13px] text-muted">
            {reading.spread.name}
            {reading.topic !== "general" ? " · " : ""}
            {reading.topic !== "general" ? TOPIC_TEXT[reading.topic] : ""}
          </p>

          <div className="hidden flex-wrap items-center gap-2.5 lg:flex">
            <ShareButton
              url={shareUrl}
              title={`${reading.spread.name} · Tarot24`}
            />
            {!readOnly && onRedraw ? (
              <button
                type="button"
                onClick={onRedraw}
                className={buttonClass("ghost", "sm")}
              >
                Rút lại
              </button>
            ) : null}
            {readOnly ? (
              <Link href="/kieu-trai" className={buttonClass("primary", "sm")}>
                Rút bài của bạn
              </Link>
            ) : null}
          </div>
          <Disclaimer className="hidden lg:block" />
        </div>

        {/* Bài luận */}
        <div className="mt-7.5 flex max-w-[64ch] flex-col gap-4.5 lg:mt-0">
          {reading.guard ? (
            <div className="flex flex-col gap-2 rounded-xl border border-rust/45 bg-rust/8 p-4.5">
              <p className="label-eyebrow text-rust">{reading.guard.label}</p>
              <p className="text-[14.5px]/[1.7] text-pretty text-ink">
                {reading.guard.notice}
              </p>
            </div>
          ) : null}
          {essayState === "loading" ? (
            <div className="flex flex-col gap-3.5" aria-live="polite">
              <p className="text-sm text-muted">Đang luận bài…</p>
              {[92, 100, 96, 74].map((w, i) => (
                <span
                  key={i}
                  className="h-[13px] animate-pulse rounded-full bg-line"
                  style={{ width: `${w}%`, animationDelay: `${i * 120}ms` }}
                />
              ))}
            </div>
          ) : essay ? (
            toParagraphs(essay).map((p, i) => (
              <p key={i} className="prose-reading">
                {p}
              </p>
            ))
          ) : (
            <>
              <p className="prose-reading">{reading.intro}</p>
              {reading.body.map((p, i) => (
                <p key={i} className="prose-reading">
                  {p}
                </p>
              ))}
              <p className="prose-reading mt-6">{reading.closing}</p>
            </>
          )}

          {followUps.length ? (
            <div className="mt-4 flex flex-col gap-4.5 border-t border-line pt-6">
              {followUps.map((f, i) => (
                <div key={i} className="flex flex-col gap-2">
                  <p className="font-serif text-[15px] text-muted italic">
                    {f.question}
                  </p>
                  <p className="prose-reading">{f.answer}</p>
                </div>
              ))}
            </div>
          ) : null}

          {!readOnly ? (
            <div className="mt-3.5 rounded-xl border border-gold/40 bg-surface p-4.5">
              {remaining > 0 ? (
                <div className="flex items-center gap-3">
                  <label htmlFor="hoi-them" className="sr-only">
                    Hỏi thêm về bài này
                  </label>
                  <input
                    id="hoi-them"
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") void ask();
                    }}
                    disabled={asking || essayState === "loading"}
                    maxLength={140}
                    placeholder={
                      asking
                        ? "Đang trả lời…"
                        : `Hỏi thêm về bài này, còn ${remaining} câu`
                    }
                    className="min-w-0 flex-1 bg-transparent text-[15px] text-ink outline-none placeholder:text-muted"
                  />
                  <button
                    type="button"
                    onClick={() => void ask()}
                    disabled={
                      !draft.trim() || asking || essayState === "loading"
                    }
                    aria-label="Gửi câu hỏi thêm"
                    className="flex size-[34px] shrink-0 items-center justify-center rounded-lg bg-gold/15 text-[15px] text-gold transition-colors hover:bg-gold/25 disabled:opacity-40"
                  >
                    ↑
                  </button>
                </div>
              ) : (
                <p className="text-[14.5px] text-muted">
                  Hết ba câu hỏi thêm cho bài này. Muốn hỏi tiếp thì rút một
                  trải mới.
                </p>
              )}
            </div>
          ) : null}
        </div>
      </div>

      {/* Hành động, bản mobile */}
      <div className="mt-8 flex flex-wrap items-center gap-2.5 lg:hidden">
        {readOnly ? (
          <Link
            href="/kieu-trai"
            className={buttonClass("primary", "sm", "flex-1")}
          >
            Rút bài của bạn
          </Link>
        ) : null}
        <ShareButton
          url={shareUrl}
          title={`${reading.spread.name} · Tarot24`}
        />
        {!readOnly && onRedraw ? (
          <button
            type="button"
            onClick={onRedraw}
            className={buttonClass("ghost", "sm")}
          >
            Rút lại
          </button>
        ) : null}
      </div>
      <Disclaimer className="mt-8 border-t border-line pt-6 lg:hidden" />
    </div>
  );
}

const TOPIC_TEXT: Record<string, string> = {
  love: "Tình cảm",
  work: "Công việc",
  money: "Tiền bạc",
  mind: "Tâm lý",
  study: "Học hành",
  general: "Chung",
};
