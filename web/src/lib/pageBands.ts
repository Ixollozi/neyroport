import fs from "fs";
import path from "path";
import type { PageBand } from "@/components/PageShot";

type ManifestEntry = {
  name: string;
  bands?: PageBand[];
  status?: number | string;
};

export function getPageBands(name: string): PageBand[] {
  try {
    const file = path.join(process.cwd(), "public", "media", "pages", "manifest.json");
    if (!fs.existsSync(file)) return [];
    const manifest = JSON.parse(fs.readFileSync(file, "utf8")) as ManifestEntry[];
    const entry = manifest.find((m) => m.name === name);
    return entry?.bands || [];
  } catch {
    return [];
  }
}
