import Image from "next/image";
import type { CSSProperties } from "react";

export interface TarotCardFaceProps {
  /** Mã lá trong KB; có thì hiện tranh gốc thay cho mặt chữ */
  imageId?: string;
  /** Tên tiếng Việt hiện trên mặt lá khi không có tranh */
  title?: string;
  /** Tên tiếng Anh, chỉ hiện khi lá đủ lớn */
  en?: string;
  face?: "up" | "down";
  reversed?: boolean;
  className?: string;
  style?: CSSProperties;
  /** Bề ngang do nơi gọi quyết định — luôn truyền một class width vào className */
  as?: "div" | "span";
}

/**
 * Lá bài Tarot24. Mọi kích thước bên trong tính theo bề ngang của chính lá
 * (đơn vị cqw) nên lá to hay nhỏ đều giữ đúng tỉ lệ chữ và khung viền.
 */
export function TarotCardFace({
  imageId,
  title,
  en,
  face = "up",
  reversed = false,
  className = "",
  style,
  as: Tag = "div",
}: TarotCardFaceProps) {
  return (
    <Tag
      className={className}
      style={{ containerType: "inline-size", ...style }}
    >
      <div className="relative aspect-2/3 w-full overflow-hidden rounded-[10px] border border-gold/40 bg-surface-2 shadow-card">
        {face === "down" ? (
          <div className="absolute inset-0 flex items-center justify-center bg-surface">
            <div
              className="absolute inset-0"
              style={{
                backgroundImage:
                  "repeating-linear-gradient(45deg,rgba(201,169,97,0.07) 0 1px,transparent 1px 11px),repeating-linear-gradient(-45deg,rgba(201,169,97,0.07) 0 1px,transparent 1px 11px)",
              }}
            />
            <div
              className="absolute rounded-[5px] border border-gold/20"
              style={{ inset: "6cqw" }}
            />
            <svg
              viewBox="0 0 100 100"
              aria-hidden
              className="relative h-auto w-2/5"
            >
              <path
                d="M50 4 L59.5 33 L88 22 L74 50 L88 78 L59.5 67 L50 96 L40.5 67 L12 78 L26 50 L12 22 L40.5 33 Z"
                fill="rgba(201,169,97,0.10)"
                stroke="#C9A961"
                strokeWidth="1.6"
              />
              <circle
                cx="50"
                cy="50"
                r="8"
                fill="none"
                stroke="rgba(201,169,97,0.55)"
                strokeWidth="1.2"
              />
            </svg>
          </div>
        ) : imageId ? (
          <Image
            src={`/cards/${imageId}.webp`}
            alt={title ? `Lá ${title}` : ""}
            fill
            sizes="(max-width: 768px) 40vw, 300px"
            className="object-cover"
            style={reversed ? { transform: "rotate(180deg)" } : undefined}
          />
        ) : (
          <>
            <div
              className="absolute inset-0 flex flex-col items-center justify-center text-center"
              style={{
                gap: "2cqw",
                padding: "8cqw 6cqw",
                transform: reversed ? "rotate(180deg)" : undefined,
              }}
            >
              <div
                className="absolute rounded-[5px] border border-gold/15"
                style={{ inset: "5cqw" }}
              />
              <div
                className="relative font-serif text-ink text-balance"
                style={{ fontSize: "13cqw", lineHeight: 1.15 }}
              >
                {title}
              </div>
              {en ? (
                <div
                  className="relative text-muted"
                  style={{ fontSize: "7cqw", lineHeight: 1.3 }}
                >
                  {en}
                </div>
              ) : null}
            </div>
          </>
        )}
        {face === "up" && reversed ? (
          <div
            className="absolute rounded-sm bg-bg/75 px-[2cqw] font-medium tracking-[0.06em] text-rust"
            style={{ left: "4cqw", bottom: "3cqw", fontSize: "7cqw" }}
          >
            ngược
          </div>
        ) : null}
      </div>
    </Tag>
  );
}

/** Ô trống chờ lá — dùng ở màn rút bài. */
export function TarotCardSlot({ className = "" }: { className?: string }) {
  return (
    <div
      className={`aspect-2/3 w-full rounded-[10px] border border-dashed border-gold/55 bg-gold/4 ${className}`}
    />
  );
}
