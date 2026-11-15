import { chromium } from "playwright";
import sharp from "sharp";
import fs from "fs";
import path from "path";

const out = "public/media/pages";
fs.mkdirSync(out, { recursive: true });

const PAGES = [
  ["about", "/about"],
  ["method", "/about_tlns"],
  ["method2", "/translingvalnaya-neurostimulatsiya_tlns/"],
  ["reviews", "/reviews"],
  ["faq", "/faq"],
  ["contacts", "/contacts"],
  ["rent", "/rent"],
  ["institutions", "/medical_institutions"],
  ["news", "/news"],
  ["training", "/training_meth"],
  ["insult", "/insult/"],
  ["vestibular", "/vestibulyarnie_narusheniya/"],
  ["dtsp", "/dtsp-u-detej-vzroslyih/"],
  ["demyel", "/demieliniziruyushchie-zabolevaniya/"],
  ["degen", "/degenerativnye-zabolevaniya/"],
  ["sdvg", "/sdvg/"],
  ["insomniya", "/insomniya/"],
  ["privacy", "/privacy"],
  ["terms", "/terms_of_use"],
  ["requisites", "/account_details"],
];

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({
  viewport: { width: 1440, height: 900 },
  deviceScaleFactor: 2,
});

/** Strategy A: hide site header/footer sticky chrome + corner widgets */
async function hideChrome() {
  await page.evaluate(() => {
    for (const el of document.querySelectorAll("body *")) {
      const st = getComputedStyle(el);
      if (st.position !== "fixed" && st.position !== "sticky") continue;
      const r = el.getBoundingClientRect();
      if (r.width < 8 || r.height < 8) continue;
      const isTopBar = r.top < 120 && r.height < 160 && r.width > 200;
      const isBottomBar = r.bottom > innerHeight - 80 && r.height < 120;
      const isCornerWidget =
        (r.top < 140 || r.left < 90 || r.bottom > innerHeight - 40) &&
        (r.height < 180 || r.width < 220);
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

const manifest = [];

for (const [name, urlPath] of PAGES) {
  const dir = path.join(out, name);
  fs.mkdirSync(dir, { recursive: true });
  const url = "https://neyroport.ru" + urlPath;
  console.log(">>", name, url);
  try {
    const res = await page.goto(url, {
      waitUntil: "domcontentloaded",
      timeout: 90000,
    });
    const status = res?.status() ?? 0;
    if (status >= 400) {
      console.log("skip status", status);
      manifest.push({ name, urlPath, status, bands: 0 });
      continue;
    }
    await page.waitForTimeout(5000);
    await reveal();

    // scroll through to load lazy
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
      console.log(name, "band", i, meta.width, meta.height, fs.statSync(file).size);
      y += 850;
      i++;
    }
    manifest.push({ name, urlPath, status, height: h, bands });
  } catch (e) {
    console.log("FAIL", name, e.message.slice(0, 120));
    manifest.push({ name, urlPath, status: "error", error: e.message.slice(0, 160) });
  }
}

fs.writeFileSync(path.join(out, "manifest.json"), JSON.stringify(manifest, null, 2));
await browser.close();
console.log("DONE pages", manifest.filter((m) => m.bands?.length).length);
