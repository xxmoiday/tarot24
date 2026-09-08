import { ImageResponse } from "next/og";
import { cardDataUri, ogFonts } from "@/lib/og";
import { SITE } from "@/lib/site";

export const alt = `${SITE.name} · ${SITE.tagline}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/** Ba lá của ví dụ trong thiết kế gốc. */
const FAN = [
  { id: "coin_09", left: 600, top: 172, rotate: -13 },
  { id: "coin_04", left: 788, top: 150, rotate: 0 },
  { id: "major_18", left: 976, top: 172, rotate: 13 },
];

export default async function OgImage() {
  const cards = await Promise.all(
    FAN.map(async (c) => ({ ...c, src: await cardDataUri(c.id) })),
  );

  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        background: "#0B0F1A",
        fontFamily: "Be Vietnam Pro",
        padding: "58px 64px",
        position: "relative",
      }}
    >
      <div
        style={{
          position: "absolute",
          left: 380,
          top: -30,
          width: 760,
          height: 620,
          borderRadius: 999,
          background:
            "radial-gradient(circle,rgba(201,169,97,0.18) 0%,rgba(201,169,97,0.05) 45%,rgba(201,169,97,0) 70%)",
        }}
      />
      {cards.map((c) =>
        c.src ? (
          <img
            key={c.id}
            alt=""
            src={c.src}
            width={200}
            height={300}
            style={{
              position: "absolute",
              left: c.left,
              top: c.top,
              borderRadius: 12,
              border: "1px solid rgba(201,169,97,0.45)",
              transform: `rotate(${c.rotate}deg)`,
              objectFit: "cover",
            }}
          />
        ) : null,
      )}
      <div style={{ display: "flex", fontSize: 28, color: "#C9A961" }}>
        {SITE.name}
      </div>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          maxWidth: 540,
          gap: 16,
        }}
      >
        <div
          style={{
            fontSize: 60,
            lineHeight: 1.12,
            color: "#EDE6D6",
            display: "flex",
            fontFamily: "Newsreader",
          }}
        >
          {SITE.tagline}
        </div>
        <div style={{ fontSize: 24, color: "#9AA3B8", display: "flex" }}>
          Rút bài tarot tiếng Việt, đọc rõ chuyện của bạn
        </div>
      </div>
    </div>,
    { ...size, fonts: await ogFonts() },
  );
}
