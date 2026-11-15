import { chromium } from "playwright";
import sharp from "sharp";
import fs from "fs";
import path from "path";

const out = "public/media";
fs.mkdirSync(out, { recursive: true });
fs.mkdirSync(path.join(out, "sections"), { recursive: true });

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({
  viewport: { width: 1440, height: 900 },
  deviceScaleFactor: 2,
});

await page.goto("https://neyroport.ru/", {
  waitUntil: "domcontentloaded",
  timeout: 90000,
});

// Wait until preloader gone and hero title / video present
let state = "waiting";
for (let i = 0; i < 45; i++) {
  await page.waitForTimeout(1000);
  state = await page.evaluate(() => {
    const bodyText = document.body.innerText || "";
    if (!bodyText.includes("Полнота жизни")) return "no-title";
    const v = document.querySelector("video");
    if (v && v.videoWidth > 200 && v.readyState >= 2) return "video";
    // any large non-logo image in hero area
    const imgs = [...document.querySelectorAll("img")].filter(
      (img) => img.naturalWidth > 400 && img.naturalHeight > 400,
    );
    if (imgs.length) return "img";
    return "title-only";
  });
  console.log("t", i + 1, state);
  if (state === "video" || (state === "img" && i > 8) || (state === "title-only" && i > 15)) {
    break;
  }
}

await page.evaluate(() => window.scrollTo(0, 0));
await page.waitForTimeout(1000);

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

const fullPath = path.join(out, "sections", "hero-full.png");
await page.screenshot({ path: fullPath, type: "png" });
const fullMeta = await sharp(fullPath).metadata();
console.log("hero-full", fullMeta.width, fullMeta.height, state);

// Prefer live video frame
const videoFrame = await page.evaluate(async () => {
  const v = document.querySelector("video");
  if (!v || v.videoWidth < 50) return null;
  try {
    v.currentTime = Math.min(1.2, (v.duration || 2) * 0.25);
  } catch {}
  await new Promise((r) => setTimeout(r, 400));
  const c = document.createElement("canvas");
  c.width = v.videoWidth;
  c.height = v.videoHeight;
  c.getContext("2d").drawImage(v, 0, 0);
  return c.toDataURL("image/png");
});

if (videoFrame) {
  const buf = Buffer.from(videoFrame.split(",")[1], "base64");
  const vf = path.join(out, "hero-video-frame.png");
  fs.writeFileSync(vf, buf);
  console.log("video frame", await sharp(vf).metadata());
} else {
  // Right-side crop of full hero as media still
  const left = Math.floor(fullMeta.width * 0.4);
  await sharp(fullPath)
    .extract({
      left,
      top: 0,
      width: fullMeta.width - left,
      height: fullMeta.height,
    })
    .toFile(path.join(out, "hero-video-frame.png"));
  console.log("cropped frame from full");
}

// Device crop for fallback
await sharp(fullPath)
  .extract({
    left: Math.floor(fullMeta.width * 0.45),
    top: Math.floor(fullMeta.height * 0.1),
    width: Math.floor(fullMeta.width * 0.5),
    height: Math.floor(fullMeta.height * 0.85),
  })
  .toFile(path.join(out, "hero-device.png"));
console.log("hero-device", await sharp(path.join(out, "hero-device.png")).metadata());

await browser.close();
console.log("DONE");
