import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ReadingView } from "@/components/reading/ReadingView";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { buttonClass } from "@/components/ui";
import { composeReading } from "@/lib/reading";
import { decodeReading } from "@/lib/share";
import { fetchReading } from "@/lib/api";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const state = decodeReading(id);
  const reading = state && composeReading(state);
  if (!reading)
    return { title: "Bài đọc", robots: { index: false, follow: false } };
  /*
    Mô tả lấy từ giới thiệu kiểu trải, không lấy câu hỏi. Câu hỏi giải mã từ
    id, mà id là base64 trần nên ai cũng nặn được một mã chứa chữ tuỳ ý rồi
    dán link tarot24.online đi khắp nơi — thẻ xem trước hiện ra chữ của họ
    dưới tên miền của mình. Xem chú thích dài hơn ở opengraph-image.tsx.
  */
  return {
    title: `${reading.spread.name} · bài đọc đã chia sẻ`,
    description: reading.spread.blurb,
    robots: { index: false, follow: true },
  };
}

export default async function SharedReadingPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const state = decodeReading(id);
  const reading = state && composeReading(state);
  if (!reading) notFound();

  /* Bài do mô hình viết không dựng lại được, nên link chia sẻ đọc từ kho đã lưu. */
  const stored = await fetchReading(id).catch(() => null);

  return (
    <>
      <div className="border-b border-line bg-surface">
        <div className="mx-auto flex max-w-[1440px] flex-col gap-3 px-5 py-3.5 md:flex-row md:items-center md:justify-between md:px-[60px]">
          <p className="text-sm text-muted">
            Bài đọc này được chia sẻ từ Tarot24
          </p>
          <Link
            href="/kieu-trai"
            className={buttonClass("primary", "sm", "self-start")}
          >
            Rút bài của bạn
          </Link>
        </div>
      </div>
      <SiteHeader />
      <main
        id="noi-dung"
        className="mx-auto max-w-[1440px] px-5 pt-8 pb-4 md:px-[60px] md:pt-12"
      >
        <ReadingView
          reading={reading}
          shareUrl={`/doc/${id}`}
          readOnly
          essay={stored?.essay ?? null}
          parts={stored?.parts ?? null}
          followUps={stored?.followUps ?? []}
          clarifiers={stored?.clarifiers ?? []}
        />
      </main>
      <SiteFooter />
    </>
  );
}
