import { chromium } from "playwright";
import sharp from "sharp";
import fs from "fs";

const dir = "C:/Users/Sam/AppData/Local/Temp/np-cmp";
fs.mkdirSync(dir, { recursive: true });

const pages = [
  ["about", "/about", "/ru/about"],
  ["method", "/about_tlns", "/ru/about-tlns"],
  ["reviews", "/reviews", "/ru/reviews"],
  ["faq", "/faq", "/ru/faq"],
  ["rent", "/rent", "/ru/rent"],
  ["institutions", "/medical_institutions", "/ru/institutions"],
  ["news", "/news", "/ru/news"],
  ["useful", "/training_meth", "/ru/useful"],
  ["insult", "/insult/", "/ru/insult"],
  ["privacy", "/privacy", "/ru/privacy"],
];

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

function score(a, b) {
  const w = a.info.width;
  const h = a.info.height;
  const ch = a.info.channels;
  let diff = 0;
  let tot = 0;
  for (let y = 80; y < h; y++) {
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

for (const [name, orig, clone] of pages) {
  await page.goto("https://neyroport.ru" + orig, { waitUntil: "networkidle", timeout: 90000 });
  await page.waitForTimeout(800);
  await page.evaluate(() => document.querySelectorAll(".loader, #loader, .t-zoomer").forEach((n) => n.remove()));
  await page.evaluate(() => window.scrollTo({ top: 400, behavior: "instant" }));
  await page.waitForTimeout(200);
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));
  await page.waitForTimeout(300);
  const oPath = `${dir}/o-${name}.png`;
  await page.screenshot({ path: oPath });

  await page.goto("http://localhost:3000" + clone, { waitUntil: "domcontentloaded", timeout: 90000 });
  await page.evaluate(() => window.dispatchEvent(new Event("resize")));
  await page.waitForTimeout(1200);
  const cPath = `${dir}/c-${name}.png`;
  await page.screenshot({ path: cPath });

  const a = await sharp(oPath).raw().toBuffer({ resolveWithObject: true });
  const b = await sharp(cPath).raw().toBuffer({ resolveWithObject: true });
  console.log(name, score(a, b));
}

await browser.close();
