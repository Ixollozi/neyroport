import { chromium } from "playwright";
import sharp from "sharp";
import fs from "fs";
import path from "path";

const out = "public/media/pages";
const EXTRA = [
  ["speech", "/zaderzka_razvitia/"],
  ["diseases", "/zabolevaniya"],
];

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({
  viewport: { width: 1440, height: 900 },
  deviceScaleFactor: 2,
});

async function hideChrome() {
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
}

async function reveal() {
  await page.evaluate(() => {
    document.querySelectorAll(".t-animate, [data-animate-style], .tn-elem").forEach((el) => {
      el.classList.add("t-animate_started", "t-animate_complete", "t-animate__started");
      const op = parseFloat(getComputedStyle(el).opacity);
      if (op > 0 && op < 1) el.style.setProperty("opacity", "1", "important");
    });
    document.querySelectorAll("img").forEach((img) => {
      img.loading = "eager";
      const ds = img.getAttribute("data-original") || img.getAttribute("data-src");
      if (ds) img.src = ds;
    });
  });
}

const manifestPath = path.join(out, "manifest.json");
const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));

for (const [name, urlPath] of EXTRA) {
  const dir = path.join(out, name);
  fs.mkdirSync(dir, { recursive: true });
  const url = "https://neyroport.ru" + urlPath;
  console.log(">>", name, url);
  try {
    const res = await page.goto(url, { waitUntil: "domcontentloaded", timeout: 90000 });
    const status = res?.status() ?? 0;
    if (status >= 400) {
      console.log("skip", status);
      continue;
    }
    await page.waitForTimeout(5000);
    await reveal();
    const height = await page.evaluate(() => document.body.scrollHeight);
    for (let y = 0; y < height; y += 500) {
      await page.evaluate((yy) => window.scrollTo(0, yy), y);
      await reveal();
      await page.waitForTimeout(200);
    }
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(800);
    await hideChrome();
    await reveal();

    const bands = [];
    let y = 0;
    let i = 0;
    const h = await page.evaluate(() => document.body.scrollHeight);
    while (y < h && i < 20) {
      await page.evaluate((yy) => window.scrollTo(0, yy), y);
      await page.waitForTimeout(350);
      await hideChrome();
      const file = path.join(dir, `band-${String(i).padStart(2, "0")}.png`);
      await page.screenshot({ path: file, type: "png" });
      const meta = await sharp(file).metadata();
      bands.push({
        file: `/media/pages/${name}/band-${String(i).padStart(2, "0")}.png`,
        width: meta.width,
        height: meta.height,
      });
      console.log(name, "band", i, meta.width, meta.height);
      y += 850;
      i++;
    }
    const idx = manifest.findIndex((m) => m.name === name);
    const entry = { name, urlPath, status, height: h, bands };
    if (idx >= 0) manifest[idx] = entry;
    else manifest.push(entry);
  } catch (e) {
    console.log("FAIL", name, e.message.slice(0, 120));
  }
}

fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
await browser.close();
console.log("DONE");
