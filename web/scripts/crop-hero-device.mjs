import { chromium } from "playwright";
import fs from "fs";

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({
  viewport: { width: 1440, height: 900 },
  deviceScaleFactor: 2,
});

await page.goto("https://neyroport.ru/", {
  waitUntil: "domcontentloaded",
  timeout: 90000,
});
await page.waitForTimeout(4000);

const loc = page.locator("#rec630681299").first();
await loc.scrollIntoViewIfNeeded();
await page.waitForTimeout(800);
const box = await loc.boundingBox();

// Left product only — no green panel, beige site bg
await page.screenshot({
  path: "public/media/hero-device.png",
  type: "png",
  clip: {
    x: Math.max(0, box.x - 40),
    y: Math.max(0, box.y + 20),
    width: Math.min(640, box.width * 0.48),
    height: Math.min(780, box.height - 40),
  },
});
console.log("hero-device", fs.statSync("public/media/hero-device.png").size);

// Try capture video frame from first hero recs
await page.evaluate(() => window.scrollTo(0, 0));
await page.waitForTimeout(2000);

const videoInfo = await page.evaluate(() => {
  const v = document.querySelector("video");
  if (!v) return { found: false };
  return {
    found: true,
    src: v.currentSrc || v.src,
    w: v.videoWidth,
    h: v.videoHeight,
    ready: v.readyState,
  };
});
console.log("video", videoInfo);

if (videoInfo.found && videoInfo.ready >= 2) {
  const vbox = await page.locator("video").first().boundingBox();
  if (vbox) {
    await page.screenshot({
      path: "public/media/sections/hero-video-frame.png",
      type: "png",
      clip: {
        x: Math.floor(vbox.x),
        y: Math.floor(vbox.y),
        width: Math.ceil(vbox.width),
        height: Math.ceil(vbox.height),
      },
    });
    console.log(
      "hero-video-frame",
      fs.statSync("public/media/sections/hero-video-frame.png").size,
    );
  }
}

// Capture remaining lower sections
const more = [
  ["reviews-head", "#rec625077228"],
  ["reviews-cards", "#rec625076800"],
  ["stats", "#rec608130046"],
  ["places", "#rec608148382"],
  ["cta", "#rec608160945"],
  ["footer", "#rec621391915"],
];

for (const [name, sel] of more) {
  const el = page.locator(sel).first();
  if (!(await el.count())) {
    console.log("missing", sel);
    continue;
  }
  await el.scrollIntoViewIfNeeded();
  await page.waitForTimeout(900);
  await el.screenshot({
    path: `public/media/sections/${name}.png`,
    type: "png",
  });
  console.log(name, fs.statSync(`public/media/sections/${name}.png`).size);
}

await browser.close();
