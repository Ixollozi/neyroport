import { chromium } from "playwright";
import sharp from "sharp";
import fs from "fs";
import path from "path";

const out = "public/media/ref/audit";
fs.mkdirSync(out, { recursive: true });

async function mad(aPath, bPath, label) {
  const A = sharp(aPath).resize(1440, 900, { fit: "fill" });
  const B = sharp(bPath).resize(1440, 900, { fit: "fill" });
  const { data: a, info } = await A.ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const { data: b } = await B.ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const n = info.width * info.height;
  const heat = Buffer.alloc(n * 3);
  let sum = 0;
  let mismatched = 0;
  const threshold = 18; // per-channel-ish combined
  for (let i = 0; i < n; i++) {
    const ai = i * 4;
    const bi = i * 4;
    const dr = Math.abs(a[ai] - b[bi]);
    const dg = Math.abs(a[ai + 1] - b[bi + 1]);
    const db = Math.abs(a[ai + 2] - b[bi + 2]);
    const d = (dr + dg + db) / 3;
    sum += d;
    const hi = i * 3;
    if (d > threshold) {
      mismatched++;
      heat[hi] = Math.min(255, 40 + d * 4);
      heat[hi + 1] = Math.min(255, d);
      heat[hi + 2] = 20;
    } else {
      // dim original clone as base
      heat[hi] = Math.round(b[bi] * 0.35);
      heat[hi + 1] = Math.round(b[bi + 1] * 0.35);
      heat[hi + 2] = Math.round(b[bi + 2] * 0.35);
    }
  }
  const mean = sum / n;
  const matchPct = (100 * (1 - mismatched / n)).toFixed(2);
  await sharp(heat, { raw: { width: info.width, height: info.height, channels: 3 } })
    .png()
    .toFile(path.join(out, `${label}-heat.png`));
  return { label, mean: +mean.toFixed(2), matchPct: +matchPct, mismatched, pixels: n };
}

async function shotPair(pageO, pageC, name, y) {
  await pageO.evaluate((yy) => window.scrollTo(0, yy), y);
  await pageC.evaluate((yy) => window.scrollTo(0, yy), y);
  await pageO.waitForTimeout(500);
  await pageC.waitForTimeout(500);
  const o = path.join(out, `${name}-orig.png`);
  const c = path.join(out, `${name}-clone.png`);
  await pageO.screenshot({ path: o, type: "png" });
  await pageC.screenshot({ path: c, type: "png" });
  return mad(o, c, name);
}

const browser = await chromium.launch({ headless: true });
const ctxO = await browser.newContext({
  viewport: { width: 1440, height: 900 },
  deviceScaleFactor: 1,
});
const ctxC = await browser.newContext({
  viewport: { width: 1440, height: 900 },
  deviceScaleFactor: 1,
});
const pageO = await ctxO.newPage();
const pageC = await ctxC.newPage();

await pageO.goto("https://neyroport.ru/", {
  waitUntil: "domcontentloaded",
  timeout: 90000,
});
await pageC.goto("http://localhost:3000/ru", {
  waitUntil: "networkidle",
  timeout: 90000,
});
await pageO.waitForTimeout(10000);
await pageC.waitForTimeout(2000);

// hide fixed chrome on original for fairer section compare
await pageO.evaluate(() => {
  for (const el of document.querySelectorAll("body *")) {
    const st = getComputedStyle(el);
    if (st.position !== "fixed" && st.position !== "sticky") continue;
    const r = el.getBoundingClientRect();
    if (r.width < 8 || r.height < 8) continue;
    if (r.top < 140 || r.left < 90 || r.bottom > innerHeight - 60) {
      if (r.height < 160 || r.width < 120) {
        el.style.setProperty("opacity", "0", "important");
        el.style.setProperty("visibility", "hidden", "important");
      }
    }
  }
});

const oH = await pageO.evaluate(() => document.body.scrollHeight);
const cH = await pageC.evaluate(() => document.body.scrollHeight);
console.log("heights", { oH, cH });

const results = [];
const steps = Math.max(8, Math.ceil(Math.min(oH, cH) / 850));
for (let i = 0; i < steps; i++) {
  const y = i * 850;
  if (y >= Math.min(oH, cH)) break;
  const r = await shotPair(pageO, pageC, `v${String(i + 1).padStart(2, "0")}`, y);
  results.push(r);
  console.log(r.label, "mean", r.mean, "match%", r.matchPct);
}

// section-aligned captures
const pairs = [
  ["s-rehab", "#rec630681299", ".np-shot--rehab"],
  ["s-bento", "#rec630812498", ".np-shot--bento"],
  ["s-effects", "#rec630244575", ".np-shot--effects"],
  ["s-restore", "#rec621441297", ".np-shot--restore"],
  ["s-devices", "#rec630686184", ".np-shot--devices"],
  ["s-stats", "#rec608130046", ".np-shot--stats"],
  ["s-footer", "#rec621391915", ".np-shot--footer"],
];

for (const [name, oSel, cSel] of pairs) {
  const oLoc = pageO.locator(oSel).first();
  const cLoc = pageC.locator(cSel).first();
  if (!(await oLoc.count()) || !(await cLoc.count())) {
    console.log("skip", name);
    continue;
  }
  await oLoc.scrollIntoViewIfNeeded();
  await cLoc.scrollIntoViewIfNeeded();
  await pageO.waitForTimeout(900);
  await pageC.waitForTimeout(600);
  // re-hide chrome
  await pageO.evaluate(() => {
    for (const el of document.querySelectorAll("body *")) {
      const st = getComputedStyle(el);
      if (st.position !== "fixed" && st.position !== "sticky") continue;
      const r = el.getBoundingClientRect();
      if (r.top < 140 || r.left < 90) {
        if (r.height < 160 || r.width < 120) {
          el.style.setProperty("opacity", "0", "important");
        }
      }
    }
  });
  const oBox = await oLoc.boundingBox();
  const cBox = await cLoc.boundingBox();
  if (!oBox || !cBox) continue;
  const oPath = path.join(out, `${name}-orig.png`);
  const cPath = path.join(out, `${name}-clone.png`);
  await oLoc.screenshot({ path: oPath, type: "png" });
  await cLoc.screenshot({ path: cPath, type: "png" });
  // compare first 900px of each scaled to same size
  const oMeta = await sharp(oPath).metadata();
  const cMeta = await sharp(cPath).metadata();
  const h = Math.min(900, oMeta.height, cMeta.height);
  const oCrop = path.join(out, `${name}-orig-top.png`);
  const cCrop = path.join(out, `${name}-clone-top.png`);
  await sharp(oPath).extract({ left: 0, top: 0, width: oMeta.width, height: h }).resize(1440, h).png().toFile(oCrop);
  await sharp(cPath).extract({ left: 0, top: 0, width: cMeta.width, height: h }).resize(1440, h).png().toFile(cCrop);
  // custom mad for variable height
  const A = await sharp(oCrop).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const B = await sharp(cCrop).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const n = A.info.width * A.info.height;
  let sum = 0;
  let mismatched = 0;
  const heat = Buffer.alloc(n * 3);
  for (let i = 0; i < n; i++) {
    const ai = i * 4;
    const d =
      (Math.abs(A.data[ai] - B.data[ai]) +
        Math.abs(A.data[ai + 1] - B.data[ai + 1]) +
        Math.abs(A.data[ai + 2] - B.data[ai + 2])) /
      3;
    sum += d;
    const hi = i * 3;
    if (d > 18) {
      mismatched++;
      heat[hi] = Math.min(255, 40 + d * 4);
      heat[hi + 1] = Math.min(255, d);
      heat[hi + 2] = 20;
    } else {
      heat[hi] = Math.round(B.data[ai] * 0.35);
      heat[hi + 1] = Math.round(B.data[ai + 1] * 0.35);
      heat[hi + 2] = Math.round(B.data[ai + 2] * 0.35);
    }
  }
  await sharp(heat, {
    raw: { width: A.info.width, height: A.info.height, channels: 3 },
  })
    .png()
    .toFile(path.join(out, `${name}-heat.png`));
  const r = {
    label: name,
    mean: +(sum / n).toFixed(2),
    matchPct: +((100 * (1 - mismatched / n)).toFixed(2)),
    oH: oMeta.height,
    cH: cMeta.height,
  };
  results.push(r);
  console.log(r.label, "mean", r.mean, "match%", r.matchPct, "h", r.oH, r.cH);
}

fs.writeFileSync(path.join(out, "report.json"), JSON.stringify(results, null, 2));
await browser.close();
console.log("done");
