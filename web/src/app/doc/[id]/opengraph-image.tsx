import { ImageResponse } from "next/og";
import { fetchReading } from "@/lib/api";
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

  /*
    Câu chốt là phần người xem nhớ nhất, nên nó mới là thứ đáng đứng trên ảnh
    chia sẻ chứ không phải tên kiểu trải. Bài cũ và bài chưa lưu thì không có,
    lúc đó ảnh về đúng như trước.
  */
  const stored = await fetchReading(id).catch(() => null);
  const closing = stored?.parts?.ket ?? null;

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

  /*
    call() trong lib/api để cache: "no-store" vì hầu hết chỗ gọi cần số liệu
    tươi, nên Next xếp route này vào loại động và Vercel trả về max-age=0:
    mỗi lượt Facebook hay Zalo quét lại là vẽ lại từ đầu, đo được 1,6–3,2
    giây một lần. Crawler nào hết kiên nhẫn trước thì link ra thẻ trơ.

    Mà ảnh này gần như bất biến: lá và kiểu trải nằm sẵn trong id, câu chốt
    một khi đã lưu thì không viết lại nữa. Đổi thiết kế ảnh cũng không lo
    người xem mắc bản cũ, vì Next gắn hash của chính file này vào query nên
    sửa file là ra URL khác.

    Chỉ khi chưa có câu chốt — bài vừa rút chưa kịp lưu, hoặc backend đang
    hỏng và fetchReading trả null — thì mới phải cache ngắn, để lần quét sau
    còn lấy được bản đủ thay vì đóng đinh bản thiếu suốt một năm.
  */
  const cacheControl = closing
    ? "public, max-age=3600, s-maxage=31536000, stale-while-revalidate=86400"
    : "public, max-age=0, s-maxage=60, stale-while-revalidate=300";

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
        {/*
          Không lấy chữ nào của người dùng ra ảnh này. Trước đây câu hỏi giải
          mã từ id được in lên đây, mà id là base64 trần ai cũng nặn được: nặn
          một mã chứa chữ tuỳ ý rồi dán link tarot24.online vào Zalo hay
          Facebook là ra thẻ xem trước mang tên miền của mình với nội dung của
          họ. Ký id không chặn được, vì câu hỏi là chữ người dùng nhập nên đi
          qua đường hợp lệ vẫn ký được.

          Nên chữ trên ảnh chỉ còn hai nguồn: câu chốt do mô hình mình viết,
          đọc từ kho đã lưu, và tên kiểu trải, vốn tra từ một danh sách cố
          định nên không nhồi được gì vào. Ảnh này cũng đi ra nhóm chat của
          người khác, mà câu hỏi thì là chuyện riêng của người rút.
        */}
        <div
          style={{
            fontSize: closing ? 34 : 30,
            lineHeight: 1.25,
            color: "#EDE6D6",
            display: "flex",
            fontFamily: "Newsreader",
          }}
        >
          {(closing && trimForOg(closing, 150)) ||
            spread?.name ||
            "Một bài đọc tarot"}
        </div>
        {closing && spread ? (
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
          tarot24.online
        </div>
      </div>
    </div>,
    {
      ...size,
      fonts: await ogFonts(),
      headers: { "cache-control": cacheControl },
    },
  );
}
