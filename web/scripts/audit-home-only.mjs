import { chromium } from "playwright";
import sharp from "sharp";
import fs from "fs";
import path from "path";

const out = "public/media/ref/home-audit";
fs.mkdirSync(out, { recursive: true });
fs.mkdirSync(path.join(out, "frames"), { recursive: true });

const CLONE = "http://localhost:3000/ru";
const ORIG = "https://neyroport.ru/";

async function mad(aPath, bPath) {
  const A = await sharp(aPath)
    .resize(1440, 900, { fit: "fill" })
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  const B = await sharp(bPath)
    .resize(1440, 900, { fit: "fill" })
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  const n = A.info.width * A.info.height;
  let sum = 0;
  let bad = 0;
  for (let i = 0; i < n; i++) {
    const ai = i * 4;
    const d =
      (Math.abs(A.data[ai] - B.data[ai]) +
        Math.abs(A.data[ai + 1] - B.data[ai + 1]) +
        Math.abs(A.data[ai + 2] - B.data[ai + 2])) /
      3;
    sum += d;
    if (d > 18) bad++;
  }
  return {
    mean: +(sum / n).toFixed(2),
    matchPct: +((100 * (1 - bad / n)).toFixed(2)),
  };
}

async function hideWidgets(page) {
  await page.evaluate(() => {
    for (const el of document.querySelectorAll("body *")) {
      const st = getComputedStyle(el);
      if (st.position !== "fixed" && st.position !== "sticky") continue;
      const r = el.getBoundingClientRect();
      const isCorner =
        r.left < 100 &&
        r.bottom > innerHeight - 120 &&
        r.width < 120 &&
        r.height < 120;
      if (isCorner) {
        el.style.setProperty("opacity", "0", "important");
        el.style.setProperty("visibility", "hidden", "important");
      }
    }
  });
}

const browser = await chromium.launch({ headless: true });
const pageO = await browser.newPage({
  viewport: { width: 1440, height: 900 },
  deviceScaleFactor: 1,
});
const pageC = await browser.newPage({
  viewport: { width: 1440, height: 900 },
  deviceScaleFactor: 1,
});

await pageO.goto(ORIG, { waitUntil: "domcontentloaded", timeout: 90000 });
await pageC.goto(CLONE, { waitUntil: "networkidle", timeout: 90000 });
await pageO.waitForTimeout(10000);
await pageC.waitForTimeout(2500);

const report = {
  heights: {},
  hero: null,
  sections: [],
  frames: [],
  fx: [],
  notes: [],
};

report.heights.orig = await pageO.evaluate(() => document.body.scrollHeight);
report.heights.clone = await pageC.evaluate(() => document.body.scrollHeight);

// probe clone structure
report.cloneStructure = await pageC.evaluate(() => {
  const video = document.querySelector(".np-hero video");
  const still = document.querySelector(".np-hero__still img");
  const locked = document.querySelector(".np-hero--locked");
  const fx = document.querySelector(".np-fx-board");
  const shots = [...document.querySelectorAll(".np-shot, .np-page-shot")].map(
    (el) => el.className,
  );
  const revealsOff = [...document.querySelectorAll(".np-reveal:not(.is-on)")].length;
  const revealsOn = [...document.querySelectorAll(".np-reveal.is-on")].length;
  return {
    hasVideo: !!video,
    videoSrc: video?.currentSrc || video?.src || null,
    videoW: video?.videoWidth || 0,
    stillSrc: still?.getAttribute("src") || null,
    heroLocked: !!locked,
    fxPresent: !!fx,
    fxH: fx?.offsetHeight || 0,
    shotClasses: shots.slice(0, 20),
    revealsOff,
    revealsOn,
    headerH: document.querySelector(".np-header")?.offsetHeight || 0,
  };
});

report.origStructure = await pageO.evaluate(() => {
  const video = document.querySelector("video");
  const title = (document.body.innerText || "").includes("Полнота жизни");
  const fx = document.querySelector("#rec630244575");
  return {
    hasVideo: !!video,
    videoW: video?.videoWidth || 0,
    videoSrc: video?.currentSrc?.slice(0, 120) || null,
    hasTitle: title,
    fxH: fx?.offsetHeight || 0,
    fxTop: fx
      ? Math.round(fx.getBoundingClientRect().top + window.scrollY)
      : null,
    preloaderish:
      !title && (document.body.innerText || "").includes("НейроПорт"),
  };
});

await pageC.evaluate(() =>
  document.querySelectorAll(".np-reveal").forEach((el) => el.classList.add("is-on")),
);

// hero
await pageO.evaluate(() => window.scrollTo(0, 0));
await pageC.evaluate(() => window.scrollTo(0, 0));
await pageO.waitForTimeout(600);
await hideWidgets(pageO);
const hO = path.join(out, "00-hero-orig.png");
const hC = path.join(out, "00-hero-clone.png");
await pageO.screenshot({ path: hO });
await pageC.screenshot({ path: hC });
report.hero = await mad(hO, hC);
console.log("hero", report.hero);

// header strip only
await pageO.screenshot({
  path: path.join(out, "00-header-orig.png"),
  clip: { x: 0, y: 0, width: 1440, height: 110 },
});
await pageC.screenshot({
  path: path.join(out, "00-header-clone.png"),
  clip: { x: 0, y: 0, width: 1440, height: 110 },
});
report.header = await mad(
  path.join(out, "00-header-orig.png"),
  path.join(out, "00-header-clone.png"),
);
console.log("header", report.header);

// section pairs
const pairs = [
  ["rehab", "#rec630681299", ".np-shot--rehab"],
  ["bento", "#rec630812498", ".np-shot--bento"],
  ["effects", "#rec630244575", ".np-fx-board"],
  ["devices", "#rec630686184", ".np-shot--devices"],
  ["reviews", null, ".np-shot--reviews-full"],
  ["stats", "#rec608130046", ".np-shot--stats"],
  ["footer", "#rec621391915", ".np-shot--footer"],
];

for (const [name, oSel, cSel] of pairs) {
  const entry = { name };
  try {
    const cl = pageC.locator(cSel).first();
    if (!(await cl.count())) {
      entry.miss = "clone";
      console.log("section MISS clone", name);
      report.sections.push(entry);
      continue;
    }
    if (oSel) {
      const ol = pageO.locator(oSel).first();
      if (!(await ol.count())) {
        entry.miss = "orig";
        report.sections.push(entry);
        continue;
      }
      await ol.scrollIntoViewIfNeeded();
      await pageO.waitForTimeout(700);
    }
    await cl.scrollIntoViewIfNeeded();
    await pageC.waitForTimeout(500);
    await hideWidgets(pageO);
    await pageC.evaluate(() =>
      document.querySelectorAll(".np-reveal").forEach((el) => el.classList.add("is-on")),
    );

    // viewport compare at section
    const oP = path.join(out, `sec-${name}-orig.png`);
    const cP = path.join(out, `sec-${name}-clone.png`);
    await pageO.screenshot({ path: oP });
    await pageC.screenshot({ path: cP });
    entry.viewport = await mad(oP, cP);
    console.log("section", name, entry.viewport.matchPct);
  } catch (e) {
    entry.error = e.message.slice(0, 120);
  }
  report.sections.push(entry);
}

// scroll frames every 500px
const maxH = Math.min(report.heights.orig, report.heights.clone);
for (let y = 0, i = 0; y < maxH && i < 22; y += 500, i++) {
  await pageO.evaluate((yy) => window.scrollTo(0, yy), y);
  await pageC.evaluate((yy) => window.scrollTo(0, yy), y);
  await pageO.waitForTimeout(280);
  await pageC.waitForTimeout(200);
  await hideWidgets(pageO);
  await pageC.evaluate(() =>
    document.querySelectorAll(".np-reveal").forEach((el) => el.classList.add("is-on")),
  );
  const oF = path.join(out, "frames", `f${String(i).padStart(2, "0")}-o.png`);
  const cF = path.join(out, "frames", `f${String(i).padStart(2, "0")}-c.png`);
  await pageO.screenshot({ path: oF });
  await pageC.screenshot({ path: cF });
  const d = await mad(oF, cF);
  report.frames.push({ i, y, ...d });
  console.log("frame", i, y, d.matchPct);
}

// fx scrub steps
const fxTop = report.origStructure.fxTop || 2670;
const cloneFxTop = await pageC.evaluate(() => {
  const el = document.querySelector(".np-fx-board");
  return el ? Math.round(el.getBoundingClientRect().top + window.scrollY) : 2670;
});
for (let k = 0; k < 12; k++) {
  const yO = fxTop - 80 + k * 90;
  const yC = cloneFxTop - 80 + k * 90;
  await pageO.evaluate((yy) => window.scrollTo(0, yy), yO);
  await pageC.evaluate((yy) => window.scrollTo(0, yy), yC);
  await pageO.waitForTimeout(220);
  await pageC.waitForTimeout(160);
  await hideWidgets(pageO);
  const oF = path.join(out, `fx-${String(k).padStart(2, "0")}-o.png`);
  const cF = path.join(out, `fx-${String(k).padStart(2, "0")}-c.png`);
  await pageO.screenshot({ path: oF });
  await pageC.screenshot({ path: cF });
  const d = await mad(oF, cF);
  report.fx.push({ k, yO, yC, ...d });
  console.log("fx", k, d.matchPct);
}

const frameAvg =
  report.frames.reduce((a, f) => a + f.matchPct, 0) / report.frames.length;
const fxAvg = report.fx.reduce((a, f) => a + f.matchPct, 0) / report.fx.length;
report.summary = {
  hero: report.hero.matchPct,
  header: report.header.matchPct,
  frameAvg: +frameAvg.toFixed(2),
  fxAvg: +fxAvg.toFixed(2),
  heightDelta: report.heights.clone - report.heights.orig,
};

fs.writeFileSync(path.join(out, "report.json"), JSON.stringify(report, null, 2));
console.log("SUMMARY", report.summary);
console.log("clone", report.cloneStructure);
console.log("orig", report.origStructure);
await browser.close();
