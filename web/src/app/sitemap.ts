import type { MetadataRoute } from "next";
import { ARTICLES } from "@/lib/articles";
import { CARDS } from "@/lib/cards";
import { LEGAL_DOCS, LEGAL_UPDATED } from "@/lib/legal";
import { absoluteUrl } from "@/lib/site";
import { SPREADS } from "@/lib/spreads";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return [
    { url: absoluteUrl("/"), lastModified: now, changeFrequency: "daily", priority: 1 },
    { url: absoluteUrl("/kieu-trai"), lastModified: now, changeFrequency: "monthly", priority: 0.9 },
    { url: absoluteUrl("/la-bai"), lastModified: now, changeFrequency: "monthly", priority: 0.9 },
    { url: absoluteUrl("/kien-thuc"), lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: absoluteUrl("/ve-tarot24"), lastModified: now, changeFrequency: "yearly", priority: 0.4 },
    { url: absoluteUrl("/lien-he"), lastModified: now, changeFrequency: "yearly", priority: 0.3 },
    ...LEGAL_DOCS.map((d) => ({
      url: absoluteUrl(`/${d.slug}`),
      lastModified: new Date(LEGAL_UPDATED),
      changeFrequency: "yearly" as const,
      priority: 0.3,
    })),
    ...SPREADS.map((s) => ({
      url: absoluteUrl(`/kieu-trai/${s.slug}`),
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.8,
    })),
    ...CARDS.map((c) => ({
      url: absoluteUrl(`/la-bai/${c.slug}`),
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
    ...ARTICLES.map((a) => ({
      url: absoluteUrl(`/kien-thuc/${a.slug}`),
      lastModified: new Date(a.updated),
      changeFrequency: "yearly" as const,
      priority: 0.6,
    })),
  ];
}
