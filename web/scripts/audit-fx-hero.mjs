import { chromium } from "playwright";
import sharp from "sharp";
import fs from "fs";
import path from "path";

const out = "public/media/ref/full-audit";
const CLONE = "http://localhost:3000/ru";
const ORIG = "https://neyroport.ru";

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

async function hideOrigChrome(page) {
  // Only hide floating chat / N widgets — keep main sticky header for fair compare
  await page.evaluate(() => {
    for (const el of document.querySelectorAll("body *")) {
      const st = getComputedStyle(el);
      if (st.position !== "fixed" && st.position !== "sticky") continue;
      const r = el.getBoundingClientRect();
      if (r.width < 8 || r.height < 8) continue;
      const isCornerWidget =
        r.left < 100 &&
        r.bottom > innerHeight - 120 &&
        r.width < 120 &&
        r.height < 120;
      const isTinyTopRight =
        r.right > innerWidth - 100 &&
        r.top < 100 &&
        r.width < 80 &&
        r.height < 80;
      if (isCornerWidget || isTinyTopRight) {
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

await pageO.goto(ORIG + "/", { waitUntil: "domcontentloaded", timeout: 90000 });
await pageC.goto(CLONE, { waitUntil: "networkidle", timeout: 90000 });
await pageO.waitForTimeout(8000);
await pageC.waitForTimeout(2000);
await pageC.evaluate(() =>
  document.querySelectorAll(".np-reveal").forEach((el) => el.classList.add("is-on")),
);

// hero
await pageO.evaluate(() => window.scrollTo(0, 0));
await pageC.evaluate(() => window.scrollTo(0, 0));
await pageO.waitForTimeout(500);
await hideOrigChrome(pageO);
const hO = path.join(out, "anim", "hero-re-orig.png");
const hC = path.join(out, "anim", "hero-re-clone.png");
await pageO.screenshot({ path: hO });
await pageC.screenshot({ path: hC });
console.log("hero", await mad(hO, hC));

const effectsY = await pageO.evaluate(() => {
  const el = document.querySelector("#rec630244575");
  return Math.round(el.getBoundingClientRect().top + window.scrollY - 80);
});
const cloneFxY = await pageC.evaluate(() => {
  const el = document.querySelector(".np-fx-board");
  return Math.round(el.getBoundingClientRect().top + window.scrollY - 80);
});
console.log("fx tops", effectsY, cloneFxY);

const fxScores = [];
for (let k = 0; k < 16; k++) {
  const yO = effectsY + k * 70;
  const yC = cloneFxY + k * 70;
  await pageO.evaluate((yy) => window.scrollTo(0, yy), yO);
  await pageC.evaluate((yy) => window.scrollTo(0, yy), yC);
  await pageO.waitForTimeout(220);
  await pageC.waitForTimeout(180);
  await hideOrigChrome(pageO);
  const oF = path.join(out, "anim", `fxr-${String(k).padStart(2, "0")}-orig.png`);
  const cF = path.join(out, "anim", `fxr-${String(k).padStart(2, "0")}-clone.png`);
  await pageO.screenshot({ path: oF });
  await pageC.screenshot({ path: cF });
  const d = await mad(oF, cF);
  fxScores.push(d.matchPct);
  console.log("fx", k, d.matchPct);
}

// section-aligned mid pages sample
for (const [name, cPath, oPath] of [
  ["about", "/about", "/about"],
  ["insult", "/insult", "/insult/"],
  ["faq", "/faq", "/faq"],
]) {
  await pageO.goto(ORIG + oPath, { waitUntil: "domcontentloaded", timeout: 60000 });
  await pageC.goto(CLONE + cPath, { waitUntil: "networkidle", timeout: 60000 });
  await pageO.waitForTimeout(4000);
  await pageC.waitForTimeout(1200);
  await hideOrigChrome(pageO);
  const o = path.join(out, "pages", `${name}-re-orig.png`);
  const c = path.join(out, "pages", `${name}-re-clone.png`);
  await pageO.screenshot({ path: o });
  await pageC.screenshot({ path: c });
  console.log("page", name, await mad(o, c));
}

console.log(
  "fx AVG",
  (fxScores.reduce((a, b) => a + b, 0) / fxScores.length).toFixed(2),
);
await browser.close();
