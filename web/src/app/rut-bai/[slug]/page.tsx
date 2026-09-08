import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { ReadingFlow } from "@/components/reading/ReadingFlow";
import { SiteHeader } from "@/components/SiteHeader";
import { SPREADS, getSpread } from "@/lib/spreads";

export function generateStaticParams() {
  return SPREADS.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const spread = getSpread(slug);
  if (!spread) return {};
  return {
    title: `Rút bài · ${spread.name}`,
    description: spread.seo.description,
    // Màn rút bài là công cụ, phần nội dung cho tìm kiếm nằm ở /kieu-trai
    robots: { index: false, follow: true },
    alternates: { canonical: `/kieu-trai/${spread.slug}` },
  };
}

export default async function DrawPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const spread = getSpread(slug);
  if (!spread) notFound();

  return (
    <>
      <SiteHeader back />
      <main id="noi-dung" className="mx-auto max-w-[1440px]">
        <Suspense
          fallback={<div className="px-5 py-20 text-center text-sm text-muted">Đang mở…</div>}
        >
          <ReadingFlow spread={spread} />
        </Suspense>
      </main>
    </>
  );
}
