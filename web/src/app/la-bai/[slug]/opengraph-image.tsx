import { ImageResponse } from "next/og";
import { cardSubtitle, getCard } from "@/lib/cards";
import { cardDataUri, ogFonts, trimForOg } from "@/lib/og";

export const alt = "Ý nghĩa lá bài tarot";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function CardOgImage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const card = getCard(slug);
  const src = card ? await cardDataUri(card.id) : null;

  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        gap: 56,
        background: "#0B0F1A",
        fontFamily: "Be Vietnam Pro",
        padding: "58px 64px",
      }}
    >
      {src ? (
        <img
          alt=""
          src={src}
          width={320}
          height={480}
          style={{
            flexShrink: 0,
            borderRadius: 16,
            border: "1px solid rgba(201,169,97,0.45)",
            objectFit: "cover",
          }}
        />
      ) : null}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 18,
          maxWidth: 640,
        }}
      >
        <div style={{ fontSize: 24, color: "#C9A961", display: "flex" }}>
          Tarot24
        </div>
        <div
          style={{
            fontSize: 56,
            lineHeight: 1.1,
            color: "#EDE6D6",
            display: "flex",
            fontFamily: "Newsreader",
          }}
        >
          {card?.vi ?? "Thư viện 78 lá"}
        </div>
        <div style={{ fontSize: 22, color: "#9AA3B8", display: "flex" }}>
          {card ? cardSubtitle(card) : "78 lá bài tarot"}
        </div>
        <div
          style={{
            fontSize: 26,
            lineHeight: 1.5,
            color: "#EDE6D6",
            display: "flex",
          }}
        >
          {trimForOg(card?.core ?? "", 150)}
        </div>
      </div>
    </div>,
    { ...size, fonts: await ogFonts() },
  );
}
