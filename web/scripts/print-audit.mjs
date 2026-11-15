import fs from "fs";

const r = JSON.parse(
  fs.readFileSync("public/media/ref/full-audit/report.json", "utf8"),
);
console.log("=== PAGES ===");
for (const p of r.pages) {
  console.log(
    p.name,
    "top",
    p.top?.matchPct,
    "mid",
    p.mid?.matchPct,
    "o",
    p.oStatus,
    "c",
    p.cStatus,
    p.error || "",
  );
}
const frames = r.frames || [];
const avg =
  frames.reduce((a, f) => a + f.matchPct, 0) / Math.max(1, frames.length);
const worst = [...frames].sort((a, b) => a.matchPct - b.matchPct).slice(0, 10);
console.log("frame AVG", avg.toFixed(2), "n", frames.length);
console.log(
  "worst frames",
  worst.map((f) => "f" + f.i + "@" + f.y + "=" + f.matchPct).join(" | "),
);
const fx = (r.anim || []).filter((a) => a.kind === "fx-scroll");
console.log(
  "fx avg",
  (fx.reduce((a, f) => a + f.matchPct, 0) / Math.max(1, fx.length)).toFixed(2),
);
console.log("fx", fx.map((f) => f.matchPct).join(","));
console.log("hover", r.anim?.find((a) => a.kind === "hover-ask"));
