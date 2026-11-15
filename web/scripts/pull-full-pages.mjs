import { chromium } from "playwright";
import sharp from "sharp";
import fs from "fs";
import path from "path";

const out = "public/media/pages";
const TARGETS = [
  ["institutions", "/medical_institutions"],
  ["training", "/training_meth"],
  ["vestibular", "/vestibulyarnie_narusheniya/"],
  ["about", "/about"],
  ["news", "/news"],
  ["degen", "/degenerativnye-zabolevaniya/"],
  ["privacy", "/privacy"],
  ["requisites", "/account_details"],
  ["rent", "/rent"],
];

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({
  viewport: { width: 1440, height: 900 },
  deviceScaleFactor: 1,
});

/** Strategy A: hide site sticky/fixed chrome + chat widgets before capture */
async function hideSiteChrome() {
  await page.evaluate(() => {
    for (const el of document.querySelectorAll("body *")) {
      const st = getComputedStyle(el);
      if (st.position !== "fixed" && st.position !== "sticky") continue;
      const r = el.getBoundingClientRect();
      if (r.width < 8 || r.height < 8) continue;
      const isTopBar = r.top < 120 && r.height < 160 && r.width > 200;
      const isBottomBar = r.bottom > innerHeight - 80 && r.height < 120;
      const isCornerWidget =
        r.left < 100 &&
        r.bottom > innerHeight - 120 &&
        r.width < 120 &&
        r.height < 120;
      if (isTopBar || isBottomBar || isCornerWidget) {
        el.style.setProperty("opacity", "0", "important");
        el.style.setProperty("visibility", "hidden", "important");
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

for (const [name, urlPath] of TARGETS) {
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
    for (let y = 0; y < height; y += 600) {
      await page.evaluate((yy) => window.scrollTo(0, yy), y);
      await reveal();
      await page.waitForTimeout(180);
    }
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(1000);
    await hideSiteChrome();
    await reveal();

    const fullPath = path.join(dir, "full.png");
    await page.screenshot({ path: fullPath, type: "png", fullPage: true });
    const meta = await sharp(fullPath).metadata();
    console.log(name, "full", meta.width, meta.height, fs.statSync(fullPath).size);

    const bands = [
      {
        file: `/media/pages/${name}/full.png`,
        width: meta.width,
        height: meta.height,
      },
    ];
    const idx = manifest.findIndex((m) => m.name === name);
    const entry = { name, urlPath, status, height: meta.height, bands, full: true };
    if (idx >= 0) manifest[idx] = entry;
    else manifest.push(entry);
  } catch (e) {
    console.log("FAIL", name, e.message.slice(0, 140));
  }
}

fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
await browser.close();
console.log("DONE");
