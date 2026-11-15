import { chromium } from "playwright";
import fs from "fs";
import path from "path";

const out = "public/media/sections";
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
await page.waitForTimeout(10000);

async function hideChrome() {
  await page.evaluate(() => {
    const nodes = Array.from(document.querySelectorAll("body *"));
    for (const el of nodes) {
      const st = window.getComputedStyle(el);
      if (st.position !== "fixed" && st.position !== "sticky") continue;
      const r = el.getBoundingClientRect();
      if (r.width < 8 || r.height < 8) continue;
      // any fixed UI near edges / header
      if (
        r.top < 140 ||
        r.bottom > window.innerHeight - 80 ||
        r.left < 80 ||
        r.right > window.innerWidth - 80
      ) {
        if (r.width < 900 || r.height < 160) {
          el.style.setProperty("opacity", "0", "important");
          el.style.setProperty("visibility", "hidden", "important");
          el.style.setProperty("pointer-events", "none", "important");
        }
      }
    }
  });
}

await hideChrome();

const targets = [
  ["rehab", "#rec630681299"],
  ["bento", "#rec630812498"],
  ["effects", "#rec630244575"],
  ["restore", "#rec621441297"],
  ["devices", "#rec630686184"],
  ["reviews-head", "#rec625077228"],
  ["reviews-cards", "#rec625076800"],
  ["stats", "#rec608130046"],
  ["places", "#rec608148382"],
  ["cta", "#rec608160945"],
  ["footer", "#rec621391915"],
];

for (const [name, sel] of targets) {
  const loc = page.locator(sel).first();
  if (!(await loc.count())) {
    console.log("missing", sel);
    continue;
  }
  await loc.scrollIntoViewIfNeeded();
  await page.waitForTimeout(1500);
  if (name === "devices") {
    await page.evaluate(() => {
      document.querySelectorAll("#rec630686184 img").forEach((img) => {
        img.loading = "eager";
      });
    });
    await page.waitForTimeout(3500);
  }
  await hideChrome();
  await page.waitForTimeout(200);
  await loc.screenshot({ path: path.join(out, `${name}.png`), type: "png" });
  console.log(name, fs.statSync(path.join(out, `${name}.png`)).size);
}

// split effects
await browser.close();

const sharp = (await import("sharp")).default;
const effects = path.join(out, "effects.png");
const m = await sharp(effects).metadata();
const half = Math.floor(m.height / 2);
await sharp(effects)
  .extract({ left: 0, top: 0, width: m.width, height: half })
  .png()
  .toFile(path.join(out, "effects-1.png"));
await sharp(effects)
  .extract({ left: 0, top: half, width: m.width, height: m.height - half })
  .png()
  .toFile(path.join(out, "effects-2.png"));
console.log("effects split", half);

// refresh hero device from clean rehab
const rehab = path.join(out, "rehab.png");
const rm = await sharp(rehab).metadata();
await sharp(rehab)
  .extract({
    left: Math.round(rm.width * 0.06),
    top: Math.round(rm.height * 0.12),
    width: Math.round(rm.width * 0.38),
    height: Math.round(rm.height * 0.78),
  })
  .png()
  .toFile("public/media/hero-device.png");
console.log("hero-device refreshed");

console.log("done");
