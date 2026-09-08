"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { TarotCardFace } from "@/components/TarotCardFace";
import { CARDS, SUIT_LABEL, type Suit } from "@/lib/cards";

type Filter = "all" | "major" | Suit;

const FILTERS: { key: Filter; label: string }[] = [
  { key: "all", label: "Tất cả" },
  { key: "major", label: "Ẩn Chính" },
  { key: "gay", label: SUIT_LABEL.gay },
  { key: "coc", label: SUIT_LABEL.coc },
  { key: "kiem", label: SUIT_LABEL.kiem },
  { key: "tien", label: SUIT_LABEL.tien },
];

const normalise = (s: string) =>
  s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\u0111/g, "d").replace(/\u0110/g, "D").toLowerCase();

export function CardLibrary() {
  const [filter, setFilter] = useState<Filter>("all");
  const [query, setQuery] = useState("");

  const cards = useMemo(() => {
    const q = normalise(query.trim());
    return CARDS.filter((c) => {
      if (filter === "major" && c.arcana !== "major") return false;
      if (filter !== "all" && filter !== "major" && c.suit !== filter) return false;
      if (!q) return true;
      return (
        normalise(c.vi).includes(q) ||
        normalise(c.en).includes(q) ||
        c.upright.some((k) => normalise(k).includes(q))
      );
    });
  }, [filter, query]);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3.5">
        <label htmlFor="tim-la" className="sr-only">
          Tìm lá bài
        </label>
        <input
          id="tim-la"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Tìm theo tên lá hoặc từ khoá, ví dụ ngôi sao, giữ của"
          className="w-full rounded-xl border border-line bg-surface px-4 py-3.5 text-[15px] text-ink outline-none transition-colors placeholder:text-muted focus:border-gold/50"
        />
        <div className="no-scrollbar -mx-5 flex gap-2 overflow-x-auto px-5 md:mx-0 md:flex-wrap md:px-0">
          {FILTERS.map((f) => {
            const active = f.key === filter;
            return (
              <button
                key={f.key}
                type="button"
                aria-pressed={active}
                onClick={() => setFilter(f.key)}
                className={`shrink-0 rounded-full border px-4 py-2 text-[13.5px] transition-colors ${
                  active
                    ? "border-gold bg-gold font-semibold text-bg"
                    : "border-line text-muted hover:border-gold/50 hover:text-ink"
                }`}
              >
                {f.label}
              </button>
            );
          })}
        </div>
      </div>

      <p className="text-[13px] text-muted" aria-live="polite">
        {cards.length} lá
      </p>

      {cards.length === 0 ? (
        <p className="rounded-xl border border-line bg-surface p-6 text-center text-sm text-muted">
          Không tìm thấy lá nào khớp. Thử một từ khoá khác.
        </p>
      ) : (
        <ul className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-6 md:gap-4.5 lg:grid-cols-8">
          {cards.map((c) => (
            <li key={c.slug}>
              <Link
                href={`/la-bai/${c.slug}`}
                className="group flex flex-col gap-2 transition-transform duration-200 hover:-translate-y-1"
              >
                <TarotCardFace imageId={c.id} title={c.vi} face="up" className="w-full" />
                <span className="text-center text-[11.5px]/[1.4] text-muted transition-colors group-hover:text-gold-hi">
                  {c.vi}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
