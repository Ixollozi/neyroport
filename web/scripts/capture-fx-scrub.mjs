import { chromium } from "playwright";
import sharp from "sharp";
import fs from "fs";
import path from "path";

const out = "public/media/sections/fx-scrub";
fs.mkdirSync(out, { recursive: true });

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({
  viewport: { width: 1440, height: 900 },
  deviceScaleFactor: 2,
});

await page.goto("https://neyroport.ru/", {
  waitUntil: "domcontentloaded",
  timeout: 90000,
});
await page.waitForTimeout(8000);

await page.evaluate(() => {
  for (const el of document.querySelectorAll("body *")) {
    const st = getComputedStyle(el);
    if (st.position !== "fixed" && st.position !== "sticky") continue;
    const r = el.getBoundingClientRect();
    if (r.width < 8 || r.height < 8) continue;
    if (r.top < 140 || r.left < 90 || r.bottom > innerHeight - 40) {
      if (r.height < 180 || r.width < 220) {
        el.style.setProperty("opacity", "0", "important");
        el.style.setProperty("visibility", "hidden", "important");
      }
    }
  }
});

const info = await page.evaluate(() => {
  const el = document.querySelector("#rec630244575");
  if (!el) return null;
  return {
    top: Math.round(el.getBoundingClientRect().top + window.scrollY),
    h: el.offsetHeight,
  };
});
console.log("effects", info);

const frames = [];
const steps = 24;
for (let i = 0; i < steps; i++) {
  // scroll so we progress through the 2556 board
  const y = info.top - 80 + Math.round((i / (steps - 1)) * (info.h - 200));
  await page.evaluate((yy) => window.scrollTo(0, yy), y);
  await page.waitForTimeout(280);
  await page.evaluate(() => {
    for (const el of document.querySelectorAll("body *")) {
      const st = getComputedStyle(el);
      if (st.position !== "fixed" && st.position !== "sticky") continue;
      const r = el.getBoundingClientRect();
      if ((r.top < 140 || r.left < 90) && (r.height < 180 || r.width < 220)) {
        el.style.setProperty("opacity", "0", "important");
      }
    }
  });
  const file = path.join(out, `f${String(i).padStart(2, "0")}.png`);
  await page.screenshot({ path: file, type: "png" });
  const meta = await sharp(file).metadata();
  frames.push({
    file: `/media/sections/fx-scrub/f${String(i).padStart(2, "0")}.png`,
    width: meta.width,
    height: meta.height,
    y,
    i,
  });
  console.log("fx scrub", i, y, meta.width, meta.height);
}

fs.writeFileSync(path.join(out, "manifest.json"), JSON.stringify({ info, frames }, null, 2));
await browser.close();
console.log("DONE", frames.length);
