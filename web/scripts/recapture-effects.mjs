import { chromium } from "playwright";
import sharp from "sharp";
import fs from "fs";
import path from "path";

const out = "public/media/sections";
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

async function hideChrome() {
  await page.evaluate(() => {
    for (const el of document.querySelectorAll("body *")) {
      const st = getComputedStyle(el);
      if (st.position !== "fixed" && st.position !== "sticky") continue;
      const r = el.getBoundingClientRect();
      if (r.width < 8 || r.height < 8) continue;
      if (r.top < 140 || r.left < 90 || r.bottom > innerHeight - 50) {
        if (r.height < 180 || r.width < 220) {
          el.style.setProperty("opacity", "0", "important");
          el.style.setProperty("visibility", "hidden", "important");
        }
      }
    }
  });
}

async function forceVisible(sel) {
  await page.evaluate((selector) => {
    const root = document.querySelector(selector);
    if (!root) return;
    root.querySelectorAll("*").forEach((el) => {
      const st = getComputedStyle(el);
      // reveal animated / faded elems
      if (parseFloat(st.opacity) < 0.95) {
        el.style.setProperty("opacity", "1", "important");
      }
      if (st.visibility === "hidden") {
        el.style.setProperty("visibility", "visible", "important");
      }
      if (st.transform && st.transform !== "none") {
        // keep layout transforms for zero-block positioning; only kill fade translates
        const t = st.transform;
        if (t.includes("matrix") && (el.className || "").toString().includes("animate")) {
          el.style.setProperty("transform", "none", "important");
        }
      }
      el.classList.add("t-animate_started", "t-animate_complete", "t-animate__started");
    });
    root.querySelectorAll("img").forEach((img) => {
      img.loading = "eager";
      const ds =
        img.getAttribute("data-original") ||
        img.getAttribute("data-src") ||
        img.getAttribute("data-img-zoom-url");
      if (ds) img.src = ds;
    });
  }, sel);
}

const secSel = "#rec630244575";
const sec = page.locator(secSel).first();

// Scroll through to load assets
const secTop = await page.evaluate((sel) => {
  const sec = document.querySelector(sel);
  return Math.round(sec.getBoundingClientRect().top + window.scrollY);
}, secSel);
const secH = await page.evaluate(
  (sel) => document.querySelector(sel).offsetHeight,
  secSel,
);

for (let y = 0; y < secH; y += 350) {
  await page.evaluate(([yy]) => window.scrollTo(0, yy), [secTop + y]);
  await forceVisible(secSel);
  await page.waitForTimeout(400);
}

await page.evaluate(([yy]) => window.scrollTo(0, yy), [secTop]);
await forceVisible(secSel);
await page.waitForTimeout(2000);
await hideChrome();
await forceVisible(secSel);

await sec.screenshot({ path: path.join(out, "effects.png"), type: "png" });
const meta = await sharp(path.join(out, "effects.png")).metadata();
console.log("effects", meta.width, meta.height, fs.statSync(path.join(out, "effects.png")).size);

// density map
for (let y = 0; y < meta.height; y += 400) {
  const h = Math.min(400, meta.height - y);
  const buf = await sharp(path.join(out, "effects.png"))
    .extract({ left: 0, top: y, width: meta.width, height: h })
    .raw()
    .toBuffer();
  let sum = 0;
  for (let i = 0; i < buf.length; i++) sum += buf[i];
  const mean = sum / buf.length;
  let varSum = 0;
  for (let i = 0; i < buf.length; i++) varSum += (buf[i] - mean) ** 2;
  console.log("y", y, "var", (varSum / buf.length).toFixed(0), "mean", mean.toFixed(0));
}

const half = Math.floor(meta.height / 2);
await sharp(path.join(out, "effects.png"))
  .extract({ left: 0, top: 0, width: meta.width, height: half })
  .png()
  .toFile(path.join(out, "effects-1.png"));
await sharp(path.join(out, "effects.png"))
  .extract({ left: 0, top: half, width: meta.width, height: meta.height - half })
  .png()
  .toFile(path.join(out, "effects-2.png"));

// Preview tops
await sharp(path.join(out, "effects-1.png"))
  .extract({ left: 0, top: 0, width: meta.width, height: Math.min(1800, half) })
  .resize(1440, 900)
  .png()
  .toFile("public/media/ref/audit/effects1-top-new.png");

// Capture individual cards via clipped screenshots after forcing visible
const cardTops = [60, 912, 1762];
for (let i = 0; i < cardTops.length; i++) {
  const off = cardTops[i];
  await page.evaluate(([yy]) => window.scrollTo(0, yy), [secTop + off - 40]);
  await forceVisible(secSel);
  await page.waitForTimeout(800);
  await hideChrome();
  await forceVisible(secSel);
  await page.screenshot({
    path: path.join(out, `fx-card-${i + 1}.png`),
    type: "png",
    clip: { x: 20, y: 40, width: 1400, height: 700 },
  });
  console.log(
    `fx-card-${i + 1}`,
    fs.statSync(path.join(out, `fx-card-${i + 1}.png`)).size,
  );
}

await browser.close();
console.log("done");
