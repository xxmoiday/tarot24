import { ImageResponse } from "next/og";
import { CARD_BY_SLUG } from "@/lib/cards";
import { cardDataUri, ogFonts, trimForOg } from "@/lib/og";
import { decodeReading } from "@/lib/share";
import { getSpread } from "@/lib/spreads";

export const alt = "Bài đọc tarot từ Tarot24";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/** Nhiều lá quá thì ảnh xem trước chỉ lấy mấy lá đầu cho dễ nhìn. */
const MAX_SHOWN = 5;

export default async function ReadingOgImage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const state = decodeReading(id);
  const spread = state && getSpread(state.spread);

  const drawn = (state?.cards ?? []).slice(0, MAX_SHOWN);
  const cards = await Promise.all(
    drawn.map(async (d) => {
      const card = CARD_BY_SLUG.get(d.slug);
      return card
        ? {
            reversed: d.reversed,
            vi: card.vi,
            src: await cardDataUri(card.id),
          }
        : null;
    }),
  );
  const shown = cards.filter(Boolean) as {
    reversed: boolean;
    vi: string;
    src: string | null;
  }[];
  const width = shown.length > 3 ? 150 : 190;

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
        padding: "52px 64px",
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 14,
          maxWidth: 900,
        }}
      >
        <div style={{ fontSize: 24, color: "#C9A961", display: "flex" }}>
          Tarot24
        </div>
        <div
          style={{
            fontSize: state?.question ? 38 : 30,
            lineHeight: 1.25,
            color: "#EDE6D6",
            display: "flex",
            fontFamily: "Newsreader",
          }}
        >
          {trimForOg(state?.question ?? "", 96) || spread?.name || "Một bài đọc tarot"}
        </div>
        {state?.question && spread ? (
          <div style={{ fontSize: 21, color: "#9AA3B8", display: "flex" }}>
            {spread.name}
          </div>
        ) : null}
      </div>

      <div style={{ display: "flex", gap: 18, alignItems: "flex-end" }}>
        {shown.map((c, i) =>
          c.src ? (
            <img
              alt=""
              key={i}
              src={c.src}
              width={width}
              height={Math.round(width * 1.5)}
              style={{
                borderRadius: 12,
                border: "1px solid rgba(201,169,97,0.45)",
                objectFit: "cover",
                /* Satori báo lỗi nếu transform là undefined, nên bỏ hẳn khi lá xuôi. */
                ...(c.reversed ? { transform: "rotate(180deg)" } : {}),
              }}
            />
          ) : null,
        )}
        <div
          style={{
            display: "flex",
            marginLeft: "auto",
            fontSize: 20,
            color: "#9AA3B8",
            paddingBottom: 8,
          }}
        >
          tarrot24.online
        </div>
      </div>
    </div>,
    { ...size, fonts: await ogFonts() },
  );
}
