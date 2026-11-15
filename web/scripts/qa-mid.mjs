import { chromium } from "playwright";
import sharp from "sharp";

const pages = [
  ["about", "/about", "/ru/about"],
  ["reviews", "/reviews", "/ru/reviews"],
  ["faq", "/faq", "/ru/faq"],
  ["institutions", "/medical_institutions", "/ru/institutions"],
  ["news", "/news", "/ru/news"],
  ["insult", "/insult/", "/ru/insult"],
  ["privacy", "/privacy", "/ru/privacy"],
  ["useful", "/training_meth", "/ru/useful"],
];

function score(a, b) {
  const w = a.info.width;
  const h = a.info.height;
  const ch = a.info.channels;
  let diff = 0;
  let tot = 0;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      tot++;
      const i = (y * w + x) * ch;
      let d = 0;
      for (let c = 0; c < 3; c++) d = Math.max(d, Math.abs(a.data[i + c] - b.data[i + c]));
      if (d > 28) diff++;
    }
  }
  return (100 * (1 - diff / tot)).toFixed(2);
}

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

for (const [name, orig, clone] of pages) {
  await page.goto("https://neyroport.ru" + orig, { waitUntil: "networkidle", timeout: 90000 });
  await page.evaluate(() => document.querySelectorAll(".loader, #loader, .t-zoomer").forEach((n) => n.remove()));
  const h = await page.evaluate(() => document.body.scrollHeight);
  const y = Math.round(h * 0.45);
  await page.evaluate((yy) => window.scrollTo({ top: yy, behavior: "instant" }), y);
  await page.waitForTimeout(400);
  const o = await page.screenshot();
  await page.goto("http://localhost:3000" + clone, { waitUntil: "domcontentloaded", timeout: 90000 });
  await page.evaluate(() => window.dispatchEvent(new Event("resize")));
  await page.waitForTimeout(1100);
  await page.evaluate((yy) => window.scrollTo({ top: yy, behavior: "instant" }), y);
  await page.waitForTimeout(300);
  const c = await page.screenshot();
  const a = await sharp(o).raw().toBuffer({ resolveWithObject: true });
  const b = await sharp(c).raw().toBuffer({ resolveWithObject: true });
  console.log(name, "mid", score(a, b), "y", y);
}

const iphone = {
  viewport: { width: 390, height: 844 },
  userAgent: "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1",
  isMobile: true,
  hasTouch: true,
  deviceScaleFactor: 2,
};
const phone = await browser.newPage(iphone);
await phone.setViewportSize({ width: 390, height: 844 });
for (const [name, orig, clone] of [["contacts", "/contacts", "/ru/contacts"], ["about", "/about", "/ru/about"]]) {
  await phone.goto("https://neyroport.ru" + orig, { waitUntil: "networkidle", timeout: 90000 });
  await phone.evaluate(() => document.querySelectorAll(".loader, #loader, .t-zoomer").forEach((n) => n.remove()));
  await phone.waitForTimeout(400);
  const o = await phone.screenshot();
  await phone.goto("http://localhost:3000" + clone, { waitUntil: "domcontentloaded", timeout: 90000 });
  await phone.waitForTimeout(800);
  const fit = await phone.evaluate(() => document.documentElement.classList.contains("np-fit"));
  const c = await phone.screenshot();
  const a = await sharp(o).raw().toBuffer({ resolveWithObject: true });
  const b = await sharp(c).raw().toBuffer({ resolveWithObject: true });
  console.log(name, "phone", score(a, b), "np-fit", fit);
}
await browser.close();
