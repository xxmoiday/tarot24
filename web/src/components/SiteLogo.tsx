type SiteLogoProps = {
  className?: string;
  markClassName?: string;
  textClassName?: string;
};

export function SiteLogo({ className = "", markClassName = "", textClassName = "" }: SiteLogoProps) {
  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`} aria-label="Tarot24">
      <svg
        aria-hidden
        viewBox="0 0 64 64"
        className={`h-8 w-8 shrink-0 overflow-visible ${markClassName}`}
      >
        <rect width="64" height="64" rx="18" className="fill-bg" />
        <circle cx="32" cy="32" r="24.5" className="fill-[#111827] stroke-gold/65" strokeWidth="1.5" />
        <path
          d="M32 6.8a25.2 25.2 0 1 1 0 50.4 25.2 25.2 0 0 1 0-50.4Z"
          className="fill-transparent stroke-ink/45"
          strokeDasharray="0.35 0.65"
          strokeLinecap="round"
          strokeWidth="1.6"
          pathLength="24"
        />
        <path
          d="M40.6 17.4A17 17 0 1 0 40.6 46a12.2 12.2 0 1 1 0-28.6Z"
          className="fill-gold"
        />
        <path
          d="M32 18.5 33.2 29.5 43.5 32l-10.3 2.5L32 45.5l-1.2-11L20.5 32l10.3-2.5L32 18.5Z"
          className="fill-gold-hi"
        />
        <path
          d="M17.8 32s5.1-8.4 14.2-8.4S46.2 32 46.2 32 41.1 40.4 32 40.4 17.8 32 17.8 32Z"
          className="fill-bg stroke-gold-hi"
          strokeWidth="2.4"
        />
        <path
          d="M32 26.2a5.8 5.8 0 1 1 0 11.6 5.8 5.8 0 0 1 0-11.6Z"
          className="fill-gold-hi"
        />
        <path
          d="M32 29.7a2.3 2.3 0 1 1 0 4.6 2.3 2.3 0 0 1 0-4.6Z"
          className="fill-bg"
        />
      </svg>
      <span
        className={`font-serif text-[18px] tracking-[0.01em] text-gold transition-colors group-hover:text-gold-hi md:text-[23px] ${textClassName}`}
      >
        Tarot24
      </span>
    </span>
  );
}
