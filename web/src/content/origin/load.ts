import fs from "fs";
import path from "path";
import type { OriginLayouts } from "@/components/OriginPage";

export function loadOrigin(name: string): OriginLayouts {
  const file = path.join(process.cwd(), "src/content/origin", `${name}.json`);
  return JSON.parse(fs.readFileSync(file, "utf8")) as OriginLayouts;
}
