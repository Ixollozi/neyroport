import { chromium } from "playwright";
import fs from "fs";

const out = "public/media/pulled";
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
await page.waitForTimeout(7000);

async function shotSel(sel, name) {
  const loc = page.locator(sel).first();
  if (!(await loc.count())) {
    console.log("miss", sel);
    return;
  }
  await loc.scrollIntoViewIfNeeded();
  await page.waitForTimeout(600);
  await loc.screenshot({ path: `${out}/${name}.png`, type: "png" });
  console.log(name, fs.statSync(`${out}/${name}.png`).size);
}

// devices section whole
await shotSel("#rec630686184", "devices-section");

// try zero artboards / images inside devices
const deviceBoxes = await page.evaluate(() => {
  const root = document.querySelector("#rec630686184");
  if (!root) return [];
  return [...root.querySelectorAll(".t396__artboard, .tn-atom img, .t-bgimg")]
    .map((el, i) => {
      const b = el.getBoundingClientRect();
      if (b.width < 80 || b.height < 80) return null;
      return {
        i,
        x: b.x,
        y: b.y,
        w: b.width,
        h: b.height,
        tag: el.tagName,
        cls: el.className?.toString?.().slice(0, 60),
      };
    })
    .filter(Boolean);
});
fs.writeFileSync(`${out}/device-boxes.json`, JSON.stringify(deviceBoxes, null, 2));
console.log("boxes", deviceBoxes.length);

for (const b of deviceBoxes.slice(0, 6)) {
  await page.screenshot({
    path: `${out}/device-crop-${b.i}.png`,
    type: "png",
    clip: {
      x: Math.max(0, b.x),
      y: Math.max(0, b.y),
      width: Math.min(1440 - b.x, b.w),
      height: Math.min(900, b.h),
    },
  });
  console.log("crop", b.i, fs.statSync(`${out}/device-crop-${b.i}.png`).size);
}

await shotSel("#rec630681299", "rehab-section");
await shotSel("#rec630812498", "bento-section");
await shotSel("#rec621441297", "restore-section");
await shotSel("#rec630244575", "effects-section");

await browser.close();
console.log("done");
