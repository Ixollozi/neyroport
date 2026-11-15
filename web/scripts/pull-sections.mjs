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
await page.waitForTimeout(12000);

await page.addStyleTag({
  content: `
    #tildacopy, .t-feed__post-popup, .t-popup { display: none !important; }
  `,
});

const recs = await page.evaluate(() =>
  Array.from(document.querySelectorAll(".r.t-rec"))
    .map((el) => ({
      id: el.id,
      h: el.offsetHeight,
      top: Math.round(el.getBoundingClientRect().top + window.scrollY),
    }))
    .filter((x) => x.id && x.h > 180),
);
fs.writeFileSync(path.join(out, "recs.json"), JSON.stringify(recs, null, 2));
console.log("recs", recs.length);

const targets = [
  ["hero-media", null],
  ["rehab", "#rec630681299"],
  ["bento", "#rec630812498"],
  ["effects", "#rec630244575"],
  ["restore", "#rec621441297"],
  ["devices", "#rec630686184"],
  ["reviews", "#rec625077228"],
];

await page.evaluate(() => window.scrollTo(0, 0));
await page.waitForTimeout(2000);

// Hero right media only (device / video area)
await page.screenshot({
  path: path.join(out, "hero-media.png"),
  type: "png",
  clip: { x: 560, y: 80, width: 880, height: 820 },
});
console.log("hero-media", fs.statSync(path.join(out, "hero-media.png")).size);

// Full hero without our cropping — for diff
await page.screenshot({
  path: path.join(out, "hero-full.png"),
  type: "png",
});
console.log("hero-full", fs.statSync(path.join(out, "hero-full.png")).size);

for (const [name, sel] of targets.slice(1)) {
  const loc = page.locator(sel).first();
  if (!(await loc.count())) {
    console.log("missing", sel);
    continue;
  }
  await loc.scrollIntoViewIfNeeded();
  await page.waitForTimeout(1200);
  const box = await loc.boundingBox();
  await loc.screenshot({ path: path.join(out, `${name}.png`), type: "png" });
  console.log(name, fs.statSync(path.join(out, `${name}.png`)).size, "h", box?.height);
}

// Extra lower sections by scanning recs for large blocks after reviews
const after = recs.filter((r) => r.top > 4500).slice(0, 8);
for (const r of after) {
  const loc = page.locator(`#${r.id}`).first();
  if (!(await loc.count())) continue;
  await loc.scrollIntoViewIfNeeded();
  await page.waitForTimeout(700);
  const file = path.join(out, `${r.id}.png`);
  try {
    await loc.screenshot({ path: file, type: "png" });
    console.log(r.id, fs.statSync(file).size, "h", r.h);
  } catch (e) {
    console.log("skip", r.id, e.message);
  }
}

await browser.close();
console.log("done");
