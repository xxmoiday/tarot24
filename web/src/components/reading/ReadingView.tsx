"use client";

import Link from "next/link";
import { useCallback, useMemo, useState } from "react";
import { TarotCardFace } from "@/components/TarotCardFace";
import { buttonClass, Disclaimer, LeanBadge } from "@/components/ui";
import { getCard } from "@/lib/cards";
import { composeFollowUp, type Reading } from "@/lib/reading";
import { ReadingBoard } from "./ReadingBoard";
import { ShareButton } from "./ShareButton";

const MAX_FOLLOW_UPS = 3;

/** Ngoài đời cũng chỉ rút thêm một hai lá làm rõ, rút nữa là loãng cả bàn. */
export const MAX_CLARIFIERS = 2;

export interface FollowUp {
  question: string;
  answer: string;
}

/** Một đoạn bài luận nói về đúng một vị trí trên bàn. */
export interface ReadingPart {
  stt: number;
  doan: string;
}

export interface ReadingParts {
  toanCanh: string;
  theoViTri: ReadingPart[];
  ket: string;
}

export interface Clarifier {
  stt: number;
  slug: string;
  reversed: boolean;
  answer: string;
}

/** Bài do mô hình viết là văn xuôi liền, tách đoạn theo dòng trống. */
function toParagraphs(essay: string) {
  return essay
    .split(/\n\s*\n|\n/)
    .map((p) => p.trim())
    .filter(Boolean);
}

/** Số thứ tự vị trí, vẽ đúng như huy hiệu trên bàn bài để nối được hai bên. */
function PositionBadge({ n }: { n: number }) {
  return (
    <span className="flex size-[17px] shrink-0 items-center justify-center rounded-full border border-gold bg-bg text-[10px] text-gold">
      {n}
    </span>
  );
}

export function ReadingView({
  reading,
  shareUrl,
  readOnly = false,
  onRedraw,
  essay,
  essayState = "ready",
  parts,
  followUps: serverFollowUps,
  clarifiers = [],
  onAsk,
  onClarify,
}: {
  reading: Reading;
  shareUrl: string;
  readOnly?: boolean;
  onRedraw?: () => void;
  /** Bài luận do mô hình viết; không có thì dùng bản dựng cục bộ */
  essay?: string | null;
  essayState?: "loading" | "ready" | "error";
  /** Bài tách theo vị trí; bài cũ không có nên vẫn phải đọc được từ `essay` */
  parts?: ReadingParts | null;
  followUps?: FollowUp[];
  clarifiers?: Clarifier[];
  /** Trả về false nếu không gửi được, khi đó rơi về bản cục bộ */
  onAsk?: (question: string) => Promise<boolean>;
  /** Rút một lá làm rõ cho vị trí này */
  onClarify?: (stt: number) => Promise<void>;
}) {
  const [localFollowUps, setLocalFollowUps] = useState<FollowUp[]>([]);
  const [draft, setDraft] = useState("");
  const [asking, setAsking] = useState(false);
  /** Vị trí đang xin lá làm rõ, để khoá nút và báo đang chờ */
  const [clarifying, setClarifying] = useState<number | null>(null);
  /** Vị trí vừa được chạm từ bàn bài, đoạn của nó sáng lên một nhịp */
  const [flash, setFlash] = useState<number | null>(null);
  const followUps = serverFollowUps?.length ? serverFollowUps : localFollowUps;

  const boardCards = useMemo(
    () =>
      reading.cards.map((c, i) => ({
        card: c.card,
        reversed: c.reversed,
        stt: i + 1,
        positionLabel: c.position.label,
        positionShort: c.position.short,
      })),
    [reading.cards],
  );

  /** Chạm một lá trên bàn thì nhảy xuống đúng đoạn nói về nó. */
  const goToPart = useCallback((stt: number) => {
    const el = document.getElementById(`doan-${stt}`);
    if (!el) return;
    el.scrollIntoView({ block: "center", behavior: "smooth" });
    setFlash(stt);
    window.setTimeout(() => setFlash((cur) => (cur === stt ? null : cur)), 1700);
  }, []);

  /** Dựng câu trả lời tại chỗ khi chưa cấu hình mô hình. */
  function askLocally(q: string) {
    setLocalFollowUps((prev) => [
      ...prev,
      { question: q, answer: composeFollowUp(q, reading.cards, reading.topic) },
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

  async function clarify(stt: number) {
    if (!onClarify || clarifying !== null) return;
    setClarifying(stt);
    try {
      await onClarify(stt);
    } finally {
      setClarifying(null);
    }
  }

  const remaining = MAX_FOLLOW_UPS - followUps.length;
  const canClarify =
    !readOnly && !!onClarify && clarifiers.length < MAX_CLARIFIERS;

  /*
    Chỉ nhận đoạn ứng với một vị trí có thật trên bàn, và mỗi vị trí một đoạn.
    Mô hình thỉnh thoảng trả dư phần tử hoặc trùng số; đoạn thừa thì không có
    lá nào để nối vào, hiện ra chỉ tổ khó hiểu.
  */
  const seats = useMemo(() => {
    const seen = new Set<number>();
    return (parts?.theoViTri ?? []).filter((p) => {
      const ok = p.stt >= 1 && p.stt <= reading.cards.length && !seen.has(p.stt);
      seen.add(p.stt);
      return ok;
    });
  }, [parts, reading.cards.length]);

  /** Chỉ đọc theo vị trí khi có đủ cả phần tách lẫn đoạn dùng được. */
  const structured = !!parts && seats.length > 0;

  /**
   * Đoạn chốt lấy từ bài tách phần; không có phần tách thì bản dựng cục bộ có
   * sẵn câu chốt, còn bài văn xuôi cũ thì câu chốt nằm lẫn trong đó rồi, tách
   * ra nữa là hiện hai lần.
   */
  const closing = structured ? parts!.ket : essay ? null : reading.closing;

  function clarifierBlock(c: Clarifier) {
    const card = getCard(c.slug);
    return (
      <div className="mt-3 flex gap-3.5 rounded-xl border border-line bg-surface p-3.5">
        {card ? (
          <TarotCardFace
            imageId={card.id}
            title={card.vi}
            face="up"
            reversed={c.reversed}
            className="w-[54px] shrink-0"
          />
        ) : null}
        <div className="flex flex-col gap-1.5">
          <p className="label-eyebrow text-gold">Lá làm rõ</p>
          <p className="text-[14.5px]/[1.7] text-pretty text-ink">{c.answer}</p>
        </div>
      </div>
    );
  }

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
            onReadPart={structured ? goToPart : undefined}
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
          ) : structured ? (
            /*
              Bài tách theo vị trí. Mỗi đoạn mang số và tên đúng vị trí trên bàn
              nên nhìn bàn bài là biết đoạn nào nói lá nào — với trải mười, mười
              hai lá thì một khối văn xuôi liền không cách nào nối lại được.
            */
            <>
              {parts!.toanCanh ? (
                <p className="prose-reading">{parts!.toanCanh}</p>
              ) : null}

              {seats.map((part) => {
                const seat = reading.cards[part.stt - 1];
                const found = clarifiers.find((c) => c.stt === part.stt);
                const waiting = clarifying === part.stt;
                return (
                  <div
                    key={part.stt}
                    id={`doan-${part.stt}`}
                    className={`-mx-2.5 flex scroll-mt-24 flex-col gap-2 rounded-lg px-2.5 py-1.5 ${
                      flash === part.stt ? "animate-flash" : ""
                    }`}
                  >
                    <p className="flex items-center gap-2 text-muted">
                      <PositionBadge n={part.stt} />
                      <span className="label-eyebrow">{seat.position.label}</span>
                    </p>
                    <p className="prose-reading">{part.doan}</p>

                    {found ? clarifierBlock(found) : null}

                    {!found && canClarify ? (
                      <button
                        type="button"
                        onClick={() => void clarify(part.stt)}
                        disabled={clarifying !== null}
                        className="self-start text-[13px] font-medium text-muted transition-colors hover:text-gold-hi disabled:opacity-50"
                      >
                        {waiting ? "Đang rút lá làm rõ…" : "Rút lá làm rõ +"}
                      </button>
                    ) : null}
                  </div>
                );
              })}
            </>
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
            </>
          )}

          {/*
            Câu chốt đứng riêng. Đây là phần người xem nhớ nhất và mang đi kể
            lại, nên nó không nên trôi tuột thành đoạn văn cuối.
          */}
          {essayState !== "loading" && closing ? (
            <ClosingBlock text={closing} />
          ) : null}

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
                    onChange={(e) => setDraft(e.target.value.slice(0, 200))}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") void ask();
                    }}
                    disabled={asking || essayState === "loading"}
                    maxLength={200}
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

/** Đoạn chốt, tách ra thành khối riêng và chép được nguyên văn. */
function ClosingBlock({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      /* Trình duyệt chặn clipboard thì thôi, chữ vẫn nằm đó để bôi đen. */
    }
  }

  return (
    <div className="mt-2 flex flex-col gap-2.5 rounded-xl border border-gold/45 bg-gold/6 p-4.5">
      <div className="flex items-baseline justify-between gap-3">
        <p className="label-eyebrow text-gold">Chốt lại</p>
        <button
          type="button"
          onClick={() => void copy()}
          className="text-[13px] font-medium text-muted transition-colors hover:text-gold-hi"
        >
          {copied ? "Đã chép" : "Chép"}
        </button>
      </div>
      <p className="prose-reading">{text}</p>
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
