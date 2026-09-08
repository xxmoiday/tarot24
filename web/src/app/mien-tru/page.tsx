import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { LegalArticle } from "@/components/LegalArticle";
import { LEGAL_UPDATED, getLegalDoc } from "@/lib/legal";
import { absoluteUrl } from "@/lib/site";

const SLUG = "mien-tru";
const doc = getLegalDoc(SLUG);

export const metadata: Metadata = {
  title: doc?.title,
  description: doc?.excerpt,
  alternates: { canonical: `/${SLUG}` },
  openGraph: {
    type: "article",
    title: doc?.title,
    description: doc?.excerpt,
    url: absoluteUrl(`/${SLUG}`),
    modifiedTime: LEGAL_UPDATED,
  },
};

export default function Page() {
  if (!doc) notFound();
  return <LegalArticle doc={doc} />;
}
