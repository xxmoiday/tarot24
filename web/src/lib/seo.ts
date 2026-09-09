import rawSeo from "../../data/seo.source.json" with { type: "json" };

/**
 * Bài dài cho từng lá, viết tay từ KB (nguồn đọc được: resources/seo/BAI_SEO.md).
 * KB ở lib/cards.ts lo phần tra nhanh; bài này nằm dưới, lo phần đọc sâu và
 * là thứ mang từ khoá dài về cho trang /la-bai/<slug>.
 */
export type SeoSectionKey =
  | "noi_gi"
  | "nguoc"
  | "tinh_cam"
  | "cong_viec"
  | "tien_bac"
  | "dung_nham";

export interface SeoSection {
  key: SeoSectionKey;
  /** Neo trong trang, dùng cho mục lục và cho liên kết nhảy thẳng tới mục. */
  id: string;
  /** Nhãn ngắn ở mục lục; h2 gốc quá dài cho cột 200px. */
  label: string;
  heading: string;
  paragraphs: string[];
}

export interface SeoFaq {
  q: string;
  a: string;
}

export interface CardSeo {
  id: string;
  slug: string;
  /** Thẻ title, đã viết trong khoảng 60–70 ký tự nên dùng nguyên, không nối tên site. */
  title: string;
  description: string;
  h1: string;
  intro: string[];
  sections: SeoSection[];
  faq: SeoFaq[];
}

interface RawSeo {
  id: string;
  slug: string;
  title: string;
  meta_description: string;
  h1: string;
  mo_dau: string[];
  muc: { key: SeoSectionKey; h2: string; doan: string[] }[];
  hoi_dap: { hoi: string; dap: string }[];
}

const SECTION_META: Record<SeoSectionKey, { id: string; label: string }> = {
  noi_gi: { id: "nghia-xuoi", label: "Nghĩa xuôi" },
  nguoc: { id: "nghia-nguoc", label: "Nghĩa ngược" },
  tinh_cam: { id: "tinh-cam", label: "Tình cảm" },
  cong_viec: { id: "cong-viec", label: "Công việc" },
  tien_bac: { id: "tien-bac", label: "Tiền bạc" },
  dung_nham: { id: "dung-nham", label: "Đừng nhầm" },
};

/** Neo của khối hỏi đáp, để mục lục và JSON-LD dùng chung một hằng. */
export const FAQ_ID = "hoi-dap";

function toSeo(r: RawSeo): CardSeo {
  return {
    id: r.id,
    slug: r.slug,
    title: r.title,
    description: r.meta_description,
    h1: r.h1,
    intro: r.mo_dau,
    sections: r.muc.map((m) => ({
      key: m.key,
      id: SECTION_META[m.key].id,
      label: SECTION_META[m.key].label,
      heading: m.h2,
      paragraphs: m.doan,
    })),
    faq: r.hoi_dap.map((f) => ({ q: f.hoi, a: f.dap })),
  };
}

export const CARD_SEO: CardSeo[] = (rawSeo as { bai: RawSeo[] }).bai.map(toSeo);

const SEO_BY_SLUG = new Map(CARD_SEO.map((s) => [s.slug, s]));

export function getCardSeo(slug: string) {
  return SEO_BY_SLUG.get(slug);
}
