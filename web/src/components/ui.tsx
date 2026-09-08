import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";

const BTN_BASE =
  "inline-flex items-center justify-center rounded-lg font-medium transition-colors duration-150 disabled:cursor-not-allowed disabled:opacity-50";

const VARIANTS = {
  primary:
    "bg-gold text-bg font-semibold hover:bg-gold-hi disabled:hover:bg-gold",
  outline:
    "border border-gold text-ink hover:border-gold-hi hover:text-gold-hi disabled:hover:border-gold disabled:hover:text-ink",
  ghost: "text-muted hover:text-gold-hi",
} as const;

const SIZES = {
  sm: "px-4 py-2.5 text-sm",
  md: "px-[26px] py-3.5 text-[15px]",
  lg: "px-8 py-4 text-base",
  block: "w-full px-4 py-4 text-base",
} as const;

export type ButtonVariant = keyof typeof VARIANTS;
export type ButtonSize = keyof typeof SIZES;

export function buttonClass(
  variant: ButtonVariant = "primary",
  size: ButtonSize = "md",
  extra = "",
) {
  return `${BTN_BASE} ${VARIANTS[variant]} ${SIZES[size]} ${extra}`;
}

export function ButtonLink({
  variant = "primary",
  size = "md",
  className = "",
  ...rest
}: ComponentProps<typeof Link> & { variant?: ButtonVariant; size?: ButtonSize }) {
  return <Link {...rest} className={buttonClass(variant, size, className)} />;
}

export function Eyebrow({
  children,
  tone = "gold",
  className = "",
}: {
  children: ReactNode;
  tone?: "gold" | "muted" | "rust";
  className?: string;
}) {
  const color =
    tone === "gold" ? "text-gold" : tone === "rust" ? "text-rust" : "text-muted";
  return <div className={`label-eyebrow ${color} ${className}`}>{children}</div>;
}

export function Chip({
  children,
  tone = "gold",
}: {
  children: ReactNode;
  tone?: "gold" | "rust" | "plain";
}) {
  if (tone === "plain") {
    return (
      <span className="rounded-lg border border-line bg-surface px-3.5 py-2 text-[13px] text-ink">
        {children}
      </span>
    );
  }
  const cls =
    tone === "gold"
      ? "border-gold/45 bg-gold/6"
      : "border-rust/55 bg-rust/8";
  return (
    <span className={`rounded-full border px-3.5 py-1.5 text-[13px] text-ink ${cls}`}>
      {children}
    </span>
  );
}

export function LeanBadge({ lean, label }: { lean: "yes" | "no" | "mixed"; label: string }) {
  const map = {
    yes: "border-moss/50 bg-moss/10 text-moss",
    no: "border-rust/50 bg-rust/10 text-rust",
    mixed: "border-line bg-surface text-muted",
  } as const;
  const dot = { yes: "bg-moss", no: "bg-rust", mixed: "bg-muted" } as const;
  return (
    <span
      className={`inline-flex items-center gap-2.5 rounded-full border px-4.5 py-2.5 text-[14.5px] font-medium ${map[lean]}`}
    >
      <span className={`size-[7px] rounded-full ${dot[lean]}`} />
      {label}
    </span>
  );
}

export function Disclaimer({
  className = "",
  link = true,
}: {
  className?: string;
  /** Dẫn sang trang miễn trừ; tắt ở những chỗ chật không đủ chỗ cho liên kết. */
  link?: boolean;
}) {
  return (
    <p className={`text-[12.5px]/[1.65] text-muted ${className}`}>
      Bài đọc chỉ để tham khảo, không thay lời khuyên y tế, pháp lý, tài chính.
      {link ? (
        <>
          {" "}
          <Link href="/mien-tru" className="text-gold transition-colors hover:text-gold-hi">
            Đọc thêm
          </Link>
        </>
      ) : null}
    </p>
  );
}

export function Divider() {
  return <div className="h-px bg-line" />;
}
