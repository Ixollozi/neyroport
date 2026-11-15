import { chromium } from "playwright";
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
      if (parseFloat(getComputedStyle(el).opacity) < 0.95) {
        el.style.setProperty("opacity", "1", "important");
      }
      el.classList.add("t-animate_started", "t-animate_complete");
    });
    root.querySelectorAll("img").forEach((img) => {
      img.loading = "eager";
      const ds = img.getAttribute("data-original") || img.getAttribute("data-src");
      if (ds) img.src = ds;
    });
  }, sel);
}

// Reviews head + cards as one viewport band, then cards alone
const head = page.locator("#rec625077228").first();
const cards = page.locator("#rec625076800").first();

await head.scrollIntoViewIfNeeded();
await forceVisible("#rec625077228");
await forceVisible("#rec625076800");
await page.waitForTimeout(2000);
await hideChrome();
await forceVisible("#rec625077228");
await forceVisible("#rec625076800");

// Combined reviews viewport
const headBox = await head.boundingBox();
const cardsBox = await cards.boundingBox();
const top = Math.min(headBox.y, cardsBox.y);
const bottom = Math.max(headBox.y + headBox.height, cardsBox.y + cardsBox.height);
const height = Math.min(900, bottom - top + 20);

await page.screenshot({
  path: path.join(out, "reviews-full.png"),
  type: "png",
  clip: {
    x: 0,
    y: Math.max(0, top),
    width: 1440,
    height,
  },
});
console.log("reviews-full", fs.statSync(path.join(out, "reviews-full.png")).size);

await head.screenshot({ path: path.join(out, "reviews-head.png"), type: "png" });
await cards.screenshot({ path: path.join(out, "reviews-cards.png"), type: "png" });
console.log("head", fs.statSync(path.join(out, "reviews-head.png")).size);
console.log("cards", fs.statSync(path.join(out, "reviews-cards.png")).size);

// Places + institutions carousel
const places = page.locator("#rec608148382").first();
const inst = page.locator("#rec608160945").first();
await places.scrollIntoViewIfNeeded();
await forceVisible("#rec608148382");
await forceVisible("#rec608160945");
await page.waitForTimeout(2500);
await hideChrome();
await places.screenshot({ path: path.join(out, "places.png"), type: "png" });
await inst.screenshot({ path: path.join(out, "cta.png"), type: "png" });
console.log("places", fs.statSync(path.join(out, "places.png")).size);
console.log("cta/inst", fs.statSync(path.join(out, "cta.png")).size);

// Footer
const footer = page.locator("#rec621391915").first();
await footer.scrollIntoViewIfNeeded();
await forceVisible("#rec621391915");
await page.waitForTimeout(1500);
await hideChrome();
await footer.screenshot({ path: path.join(out, "footer.png"), type: "png" });
console.log("footer", fs.statSync(path.join(out, "footer.png")).size);

await browser.close();
console.log("done");
