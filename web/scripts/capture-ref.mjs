import { chromium } from "playwright";
import fs from "fs";

const out = "public/media/ref";
fs.mkdirSync(out, { recursive: true });

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({
  viewport: { width: 1440, height: 900 },
  deviceScaleFactor: 1,
});

await page.goto("https://neyroport.ru/", {
  waitUntil: "domcontentloaded",
  timeout: 90000,
});
await page.waitForTimeout(5000);
await page
  .waitForFunction(
    () => (document.body?.innerText || "").includes("Полнота жизни"),
    { timeout: 40000 },
  )
  .catch(() => {});
await page.waitForTimeout(4000);

const video = page.locator("#rec607610715 video").first();
if (await video.count()) {
  await video.evaluate(async (v) => {
    try {
      await v.play();
    } catch {}
    await new Promise((r) => setTimeout(r, 2000));
    try {
      v.currentTime = 1.5;
    } catch {}
    await new Promise((r) => setTimeout(r, 800));
  });
}

await page.screenshot({ path: `${out}/01-hero.png`, type: "png" });
await page.screenshot({
  path: `${out}/01-header.png`,
  type: "png",
  clip: { x: 0, y: 0, width: 1440, height: 110 },
});

const ids = [
  "#rec630681299",
  "#rec630812498",
  "#rec630244575",
  "#rec621441297",
  "#rec630686184",
  "#rec625077228",
];

let i = 2;
for (const sel of ids) {
  const el = page.locator(sel).first();
  if (!(await el.count())) continue;
  await el.scrollIntoViewIfNeeded();
  await page.waitForTimeout(700);
  const box = await el.boundingBox();
  if (!box) continue;
  const height = Math.min(900, Math.max(200, box.height));
  await page.screenshot({
    path: `${out}/${String(i).padStart(2, "0")}-sec.png`,
    type: "png",
    clip: {
      x: 0,
      y: Math.max(0, box.y),
      width: 1440,
      height,
    },
  });
  i += 1;
}

const metrics = await page.evaluate(() => {
  const hero = document.querySelector("#rec607610715");
  const art = hero?.querySelector(".t396__artboard");
  const h2 = hero?.querySelector("h2");
  const h3 = hero?.querySelector("h3");
  const videoEl = hero?.querySelector("video");
  const r = (el) => {
    if (!el) return null;
    const b = el.getBoundingClientRect();
    const s = getComputedStyle(el);
    return {
      x: Math.round(b.x),
      y: Math.round(b.y),
      w: Math.round(b.width),
      h: Math.round(b.height),
      color: s.color,
      bg: s.backgroundColor,
      fs: s.fontSize,
      fw: s.fontWeight,
      lh: s.lineHeight,
    };
  };
  return {
    artBg: art ? getComputedStyle(art).backgroundColor : null,
    h2: r(h2),
    h3: r(h3),
    video: videoEl
      ? {
          w: videoEl.videoWidth,
          h: videoEl.videoHeight,
          ready: videoEl.readyState,
          src: videoEl.currentSrc,
        }
      : null,
    sample: (document.body.innerText || "").slice(0, 180),
  };
});

fs.writeFileSync(`${out}/metrics.json`, JSON.stringify(metrics, null, 2));
console.log(JSON.stringify(metrics, null, 2));
console.log(
  "files",
  fs.readdirSync(out).map((f) => `${f}:${fs.statSync(`${out}/${f}`).size}`),
);
await browser.close();
