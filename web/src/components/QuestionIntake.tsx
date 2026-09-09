"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { buttonClass, Eyebrow } from "@/components/ui";
import { detectGuard } from "@/lib/guard";
import { detectVague, suggestSpreads } from "@/lib/question";

const MAX_QUESTION = 200;

/**
 * Câu mẫu đủ cụ thể để chọn được kiểu trải, mỗi câu rơi vào một nhánh khác
 * nhau nên bấm thử là thấy ngay gợi ý đổi theo.
 */
const MAU = [
  "Chuyện với người đó đang ở chỗ nào",
  "Có nên nhận việc mới không, hay ở lại",
  "Tháng tới mình nên tập trung vào cái gì",
];

/**
 * Ô hỏi chuyện trước khi rút bài. Ngoài đời người đọc nghe chuyện rồi mới chọn
 * kiểu trải, nên ở đây câu hỏi đi trước và kiểu trải là thứ được gợi ý ra,
 * chứ không bắt chọn trải rồi mới nghĩ xem hỏi gì.
 */
export function QuestionIntake() {
  const [question, setQuestion] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const guard = useMemo(() => detectGuard(question), [question]);
  const vague = useMemo(() => detectVague(question), [question]);
  const picks = useMemo(
    () => (submitted ? suggestSpreads(question) : []),
    [submitted, question],
  );

  const empty = !question.trim();
  const href = (slug: string) =>
    `/rut-bai/${slug}?q=${encodeURIComponent(question.trim())}`;

  return (
    <div className="flex flex-col gap-4 md:gap-5">
      <div className="flex flex-col gap-2 md:flex-row md:items-baseline md:gap-5">
        <h2 className="font-serif text-2xl text-ink md:text-[34px]">
          Bạn đang vướng chuyện gì
        </h2>
        <Eyebrow>Hỏi trước, chọn trải sau</Eyebrow>
      </div>

      <p className="max-w-[62ch] text-sm/[1.7] text-pretty text-muted md:text-base">
        Kể ra chuyện đang vướng bằng một câu. Câu hỏi rõ tới đâu thì bài đọc
        trúng tới đó, và từ câu đó mới biết nên trải mấy lá.
      </p>

      <div className="flex flex-col rounded-xl border border-line bg-surface p-4 focus-within:border-gold/50">
        <label htmlFor="cau-hoi-dau" className="sr-only">
          Câu hỏi của bạn
        </label>
        <textarea
          id="cau-hoi-dau"
          value={question}
          onChange={(e) => setQuestion(e.target.value.slice(0, MAX_QUESTION))}
          rows={3}
          placeholder="Ví dụ: mình với người đó đang lửng lơ, có nên nói thẳng không"
          className="min-h-[76px] resize-none bg-transparent text-[15px]/[1.6] text-ink outline-none placeholder:text-muted md:text-base"
        />
        <span className="self-end text-xs text-muted">
          {question.length} / {MAX_QUESTION}
        </span>
      </div>

      <div className="flex flex-wrap gap-2">
        {MAU.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => setQuestion(s)}
            className="rounded-full border border-line bg-surface px-4 py-2 text-left text-[13px] text-muted transition-colors hover:border-gold/50 hover:text-ink md:text-[13.5px]"
          >
            {s}
          </button>
        ))}
      </div>

      {guard ? (
        <div className="flex flex-col gap-1.5 rounded-xl border border-rust/45 bg-rust/8 p-3.5">
          <p className="label-eyebrow text-rust">{guard.label}</p>
          <p className="text-[13.5px]/[1.6] text-pretty text-ink">{guard.hint}</p>
        </div>
      ) : null}

      {vague ? (
        <div className="flex flex-col gap-1.5 rounded-xl border border-gold/40 bg-gold/6 p-3.5">
          <p className="label-eyebrow text-gold">{vague.label}</p>
          <p className="text-[13.5px]/[1.6] text-pretty text-ink">{vague.hint}</p>
        </div>
      ) : null}

      {submitted ? (
        <div className="flex flex-col gap-3">
          <Eyebrow>Kiểu trải hợp câu này</Eyebrow>
          <div className="grid gap-2.5 md:grid-cols-3 md:gap-4.5">
            {picks.map((p, i) => (
              <Link
                key={p.spread.slug}
                href={href(p.spread.slug)}
                className={`group flex flex-col gap-1.5 rounded-xl border bg-surface p-4 transition-colors md:gap-2 md:p-[22px] ${
                  i === 0 ? "border-gold/50" : "border-line hover:border-gold/50"
                }`}
              >
                <div className="flex items-baseline justify-between gap-3">
                  <h3 className="font-serif text-[18px]/[1.3] text-ink md:text-xl">
                    {p.spread.name}
                  </h3>
                  <span className="shrink-0 text-xs font-medium tracking-[0.08em] text-gold">
                    {p.spread.count} lá
                  </span>
                </div>
                <p className="text-[13.5px]/[1.65] text-pretty text-muted md:text-sm">
                  {p.reason}
                </p>
                <span className="mt-1 text-[13.5px] font-medium text-gold">
                  {i === 0 ? "Hợp nhất · rút bài →" : "Rút bài →"}
                </span>
              </Link>
            ))}
          </div>
        </div>
      ) : (
        <button
          type="button"
          disabled={empty}
          onClick={() => setSubmitted(true)}
          className={buttonClass("primary", "md", "self-start")}
        >
          Tìm kiểu trải hợp
        </button>
      )}

      <Link
        href="/kieu-trai"
        className="text-sm font-medium text-gold transition-colors hover:text-gold-hi"
      >
        Hoặc tự chọn trong 15 kiểu trải →
      </Link>
    </div>
  );
}
