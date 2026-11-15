import type { PageBand } from "@/components/PageShot";

export type PageKey =
  | "about"
  | "method"
  | "method2"
  | "reviews"
  | "faq"
  | "contacts"
  | "rent"
  | "institutions"
  | "news"
  | "training"
  | "insult"
  | "vestibular"
  | "dtsp"
  | "demyel"
  | "degen"
  | "sdvg"
  | "insomniya"
  | "privacy"
  | "terms"
  | "requisites";

/** Filled at build/runtime from public/media/pages/manifest.json when available */
export const pageBandsFallback: Partial<Record<PageKey, PageBand[]>> = {};

export async function loadPageBands(key: PageKey): Promise<PageBand[]> {
  try {
    const res = await fetch(`/media/pages/manifest.json`, { cache: "no-store" });
    if (!res.ok) return pageBandsFallback[key] || [];
    const manifest = (await res.json()) as {
      name: string;
      bands?: PageBand[];
    }[];
    const entry = manifest.find((m) => m.name === key);
    return entry?.bands || [];
  } catch {
    return pageBandsFallback[key] || [];
  }
}
