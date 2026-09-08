import Link from "next/link";
import type { Spread } from "@/lib/spreads";

export function SpreadCard({
  spread,
  featured = false,
}: {
  spread: Spread;
  featured?: boolean;
}) {
  return (
    <Link
      href={`/kieu-trai/${spread.slug}`}
      className={`group flex flex-col gap-1.5 rounded-xl border bg-surface p-4 transition-colors md:gap-2 md:p-[22px] ${
        featured ? "border-gold/50" : "border-line hover:border-gold/50"
      }`}
    >
      <div className="flex items-baseline justify-between gap-3">
        <h3 className="font-serif text-[18px]/[1.3] text-ink md:text-xl">{spread.name}</h3>
        <span className="shrink-0 text-xs font-medium tracking-[0.08em] text-gold">
          {spread.count} lá
        </span>
      </div>
      <p className="text-[13.5px]/[1.65] text-pretty text-muted md:text-sm">{spread.blurb}</p>
    </Link>
  );
}
