import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeader } from "@/components/SiteHeader";
import { TarotCardFace } from "@/components/TarotCardFace";
import { Eyebrow } from "@/components/ui";
import { CARD_BY_ID } from "@/lib/cards";
import { similarPairs, uncertainNotes } from "@/lib/review";

export const metadata: Metadata = {
  title: "Soát nội dung",
  description: "Trang nội bộ để soát ảnh và nghĩa lá trước khi mở công khai.",
  robots: { index: false, follow: false, nocache: true },
};

export default function ReviewPage() {
  const sections = uncertainNotes();
  const pairs = similarPairs();

  /* Mục đầu của báo cáo D là chi tiết hình, cần xem cạnh ảnh lá. */
  const imagery = sections[0];
  const others = sections.slice(1);
  const totalNotes = sections.reduce((n, s) => n + s.notes.length, 0);

  return (
    <>
      <SiteHeader back />
      <main
        id="noi-dung"
        className="mx-auto max-w-[1100px] px-5 pt-7 pb-16 md:px-[60px] md:pt-12"
      >
        <div className="flex flex-col gap-3">
          <Eyebrow tone="rust">Trang nội bộ · không lên tìm kiếm</Eyebrow>
          <h1 className="font-serif text-[28px]/[1.18] text-ink md:text-[40px]/[1.1]">
            Soát nội dung trước khi mở công khai
          </h1>
          <p className="max-w-[68ch] text-sm/[1.7] text-pretty text-muted md:text-base">
            Hai cửa chặn mà gói handoff yêu cầu người thật soát. Ảnh trên trang
            này là bản quét bộ in gốc 1909, nên soát được ngay tại đây mà không
            cần mở bộ bài thật, trừ những chỗ cần xem màu in.
          </p>
          <p className="text-[13px] text-muted">
            {totalNotes} chỗ cần soát · {pairs.length} cặp nghĩa gần trùng
          </p>
        </div>

        {imagery ? (
          <section className="mt-12 flex flex-col gap-5">
            <div className="flex flex-col gap-1.5">
              <h2 className="font-serif text-2xl text-gold">
                Chi tiết hình cần soát
              </h2>
              <p className="max-w-[68ch] text-[13.5px]/[1.7] text-muted">
                Mấy chi tiết dưới đây được viết khi chưa xem được ảnh. So dòng
                ghi chú với chính ảnh bên cạnh; đúng thì bỏ qua, sai thì sửa
                trong{" "}
                <code className="text-gold">
                  resources/kb/cards/&lt;mã lá&gt;.yaml
                </code>
                .
              </p>
            </div>

            <ul className="flex flex-col gap-3">
              {imagery.notes.map((n, i) => {
                const card = CARD_BY_ID.get(n.cardId);
                return (
                  <li
                    key={`${n.cardId}-${i}`}
                    className="flex gap-4 rounded-xl border border-line bg-surface p-4 md:gap-5 md:p-5"
                  >
                    <TarotCardFace
                      imageId={n.cardId}
                      title={card?.vi}
                      face="up"
                      className="w-[92px] shrink-0 md:w-[130px]"
                    />
                    <div className="flex min-w-0 flex-col gap-2.5">
                      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                        <span className="font-serif text-[19px] text-ink">
                          {card?.vi ?? n.cardId}
                        </span>
                        <code className="text-xs text-muted">{n.cardId}</code>
                        {card ? (
                          <Link
                            href={`/la-bai/${card.slug}`}
                            className="text-xs text-gold hover:text-gold-hi"
                          >
                            mở trang lá →
                          </Link>
                        ) : null}
                      </div>
                      <p className="rounded-lg border border-rust/40 bg-rust/8 px-3.5 py-2.5 text-[14px]/[1.6] text-pretty text-ink">
                        {n.note}
                      </p>
                      {card?.imagery.length ? (
                        <ul className="flex flex-col gap-1.5">
                          {card.imagery.map((line) => (
                            <li key={line} className="flex gap-2.5">
                              <span className="mt-[8px] size-[4px] shrink-0 rounded-full bg-gold" />
                              <span className="text-[13.5px]/[1.65] text-pretty text-muted">
                                {line}
                              </span>
                            </li>
                          ))}
                        </ul>
                      ) : null}
                    </div>
                  </li>
                );
              })}
            </ul>
          </section>
        ) : null}

        {others.map((s) => (
          <section key={s.heading} className="mt-12 flex flex-col gap-4">
            <h2 className="font-serif text-xl text-gold md:text-2xl">
              {s.heading}
            </h2>
            {s.loose.length ? (
              <ul className="flex flex-col gap-2">
                {s.loose.map((l, i) => (
                  <li key={i} className="flex gap-2.5">
                    <span className="mt-[9px] size-[4px] shrink-0 rounded-full bg-line" />
                    <span className="text-[14px]/[1.7] text-pretty text-muted">
                      {l}
                    </span>
                  </li>
                ))}
              </ul>
            ) : null}
            {s.notes.length ? (
              <ul className="grid gap-2.5 md:grid-cols-2">
                {s.notes.map((n, i) => {
                  const card = CARD_BY_ID.get(n.cardId);
                  return (
                    <li
                      key={`${n.cardId}-${i}`}
                      className="flex gap-3 rounded-xl border border-line bg-surface p-3.5"
                    >
                      <TarotCardFace
                        imageId={n.cardId}
                        title={card?.vi}
                        face="up"
                        className="w-[48px] shrink-0"
                      />
                      <div className="flex min-w-0 flex-col gap-1">
                        <span className="text-[14px] font-medium text-ink">
                          {card?.vi ?? n.cardId}
                        </span>
                        <span className="text-[13px]/[1.6] text-pretty text-muted">
                          {n.note}
                        </span>
                      </div>
                    </li>
                  );
                })}
              </ul>
            ) : null}
          </section>
        ))}

        {pairs.length ? (
          <section className="mt-12 flex flex-col gap-5">
            <div className="flex flex-col gap-1.5">
              <h2 className="font-serif text-2xl text-gold">
                Cặp nghĩa gần trùng
              </h2>
              <p className="max-w-[68ch] text-[13.5px]/[1.7] text-muted">
                Hai mươi cặp có cốt lõi giống nhau nhất. Đọc xem có cặp nào
                giống tới mức người dùng rút phải hai lá đó sẽ thấy bài đọc lặp
                lại không.
              </p>
            </div>
            <ol className="flex flex-col gap-3">
              {pairs.map((p) => (
                <li
                  key={p.rank}
                  className="rounded-xl border border-line bg-surface p-4 md:p-5"
                >
                  <div className="mb-3 flex items-baseline gap-3">
                    <span className="text-xs text-gold">#{p.rank}</span>
                    <span className="text-xs text-muted">
                      cosine {p.cosine}
                    </span>
                  </div>
                  <div className="grid gap-4 md:grid-cols-2">
                    {[
                      { id: p.aId, name: p.aName, core: p.aCore },
                      { id: p.bId, name: p.bName, core: p.bCore },
                    ].map((side) => (
                      <div key={side.id} className="flex gap-3.5">
                        <TarotCardFace
                          imageId={side.id}
                          title={side.name}
                          face="up"
                          className="w-[64px] shrink-0"
                        />
                        <div className="flex min-w-0 flex-col gap-1.5">
                          <span className="text-[14.5px] font-medium text-ink">
                            {side.name}
                          </span>
                          <span className="text-[13px]/[1.65] text-pretty text-muted">
                            {side.core}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </li>
              ))}
            </ol>
          </section>
        ) : null}
      </main>
    </>
  );
}
