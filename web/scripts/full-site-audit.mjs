import { chromium } from "playwright";
import sharp from "sharp";
import fs from "fs";
import path from "path";

const out = "public/media/ref/full-audit";
fs.mkdirSync(out, { recursive: true });
fs.mkdirSync(path.join(out, "frames"), { recursive: true });
fs.mkdirSync(path.join(out, "pages"), { recursive: true });
fs.mkdirSync(path.join(out, "anim"), { recursive: true });
fs.mkdirSync(path.join(out, "videos"), { recursive: true });

const CLONE = "http://localhost:3000/ru";
const ORIG = "https://neyroport.ru";

/** clonePath, origPath — orig paths verified against live Tilda site */
const PAGES = [
  ["home", "/", "/"],
  ["about", "/about", "/about"],
  ["method", "/about-tlns", "/about_tlns"],
  ["reviews", "/reviews", "/reviews"],
  ["faq", "/faq", "/faq"],
  ["contacts", "/contacts", "/contacts"],
  ["rent", "/rent", "/rent"],
  ["institutions", "/institutions", "/medical_institutions"],
  ["news", "/news", "/news"],
  ["training", "/useful", "/training_meth"],
  ["insult", "/insult", "/insult/"],
  ["vestibular", "/vestibulyarnie-narusheniya", "/vestibulyarnie_narusheniya/"],
  ["dtsp", "/dtsp", "/dtsp-u-detej-vzroslyih/"],
  ["demyel", "/demieliniziruyushchie-zabolevaniya", "/demieliniziruyushchie-zabolevaniya/"],
  ["degen", "/degenerativnye-zabolevaniya", "/degenerativnye-zabolevaniya/"],
  ["sdvg", "/sdvg", "/sdvg/"],
  ["insomniya", "/insomniya", "/insomniya/"],
  ["privacy", "/privacy", "/privacy"],
  ["terms", "/terms", "/terms_of_use"],
  ["requisites", "/requisites", "/account_details"],
];

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
  // Only floating chat / N widgets — keep site header visible for fair parity
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

async function revealClone(page) {
  await page.evaluate(() => {
    document.querySelectorAll(".np-reveal").forEach((el) => {
      el.classList.add("is-on");
    });
  });
}

const browser = await chromium.launch({ headless: true });
const report = { pages: [], frames: [], anim: [] };

// --- Page-by-page ---
{
  const pageO = await browser.newPage({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 1,
  });
  const pageC = await browser.newPage({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 1,
  });

  for (const [name, clonePath, origPath] of PAGES) {
    const entry = { name, clonePath, origPath, status: "ok" };
    try {
      const oUrl = ORIG + origPath;
      const cUrl = CLONE + (clonePath === "/" ? "" : clonePath);
      const oRes = await pageO.goto(oUrl, {
        waitUntil: "domcontentloaded",
        timeout: 60000,
      });
      const cRes = await pageC.goto(cUrl, {
        waitUntil: "networkidle",
        timeout: 60000,
      });
      entry.oStatus = oRes?.status();
      entry.cStatus = cRes?.status();
      await pageO.waitForTimeout(name === "home" ? 8000 : 4500);
      await pageC.waitForTimeout(1500);
      await hideOrigChrome(pageO);
      await revealClone(pageC);
      await pageO.waitForTimeout(300);

      const oTop = path.join(out, "pages", `${name}-orig-top.png`);
      const cTop = path.join(out, "pages", `${name}-clone-top.png`);
      await pageO.screenshot({ path: oTop, type: "png" });
      await pageC.screenshot({ path: cTop, type: "png" });
      entry.top = await mad(oTop, cTop);

      const oH = await pageO.evaluate(() => document.body.scrollHeight);
      const cH = await pageC.evaluate(() => document.body.scrollHeight);
      entry.oH = oH;
      entry.cH = cH;
      if (oH > 1400 && cH > 1400) {
        const midY = Math.min(oH, cH) * 0.35;
        await pageO.evaluate((y) => window.scrollTo(0, y), midY);
        await pageC.evaluate((y) => window.scrollTo(0, y), midY);
        await pageO.waitForTimeout(700);
        await pageC.waitForTimeout(500);
        await hideOrigChrome(pageO);
        await revealClone(pageC);
        const oMid = path.join(out, "pages", `${name}-orig-mid.png`);
        const cMid = path.join(out, "pages", `${name}-clone-mid.png`);
        await pageO.screenshot({ path: oMid, type: "png" });
        await pageC.screenshot({ path: cMid, type: "png" });
        entry.mid = await mad(oMid, cMid);
      }
      console.log(
        "page",
        name,
        "top",
        entry.top.matchPct,
        entry.mid ? `mid ${entry.mid.matchPct}` : "",
        "o",
        entry.oStatus,
        "c",
        entry.cStatus,
      );
    } catch (e) {
      entry.status = "error";
      entry.error = e.message.slice(0, 200);
      console.log("page FAIL", name, e.message.slice(0, 120));
    }
    report.pages.push(entry);
  }
  await pageO.close();
  await pageC.close();
}

// --- Homepage scroll video + dense frames ---
{
  const pageO = await browser.newPage({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 1,
    recordVideo: {
      dir: path.join(out, "videos"),
      size: { width: 1440, height: 900 },
    },
  });
  const pageC = await browser.newPage({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 1,
    recordVideo: {
      dir: path.join(out, "videos"),
      size: { width: 1440, height: 900 },
    },
  });

  await pageO.goto(ORIG + "/", { waitUntil: "domcontentloaded", timeout: 90000 });
  await pageC.goto(CLONE, { waitUntil: "networkidle", timeout: 90000 });
  await pageO.waitForTimeout(8000);
  await pageC.waitForTimeout(2000);
  await revealClone(pageC);

  const oH = await pageO.evaluate(() => document.body.scrollHeight);
  const cH = await pageC.evaluate(() => document.body.scrollHeight);
  const maxH = Math.min(oH, cH);
  const step = 100;
  const frames = [];

  for (let y = 0, i = 0; y < maxH && i < 80; y += step, i++) {
    await pageO.evaluate((yy) => window.scrollTo({ top: yy, behavior: "instant" }), y);
    await pageC.evaluate((yy) => window.scrollTo({ top: yy, behavior: "instant" }), y);
    await pageO.waitForTimeout(160);
    await pageC.waitForTimeout(120);
    await hideOrigChrome(pageO);
    await revealClone(pageC);

    const oF = path.join(out, "frames", `f${String(i).padStart(3, "0")}-orig.png`);
    const cF = path.join(out, "frames", `f${String(i).padStart(3, "0")}-clone.png`);
    await pageO.screenshot({ path: oF, type: "png" });
    await pageC.screenshot({ path: cF, type: "png" });
    const d = await mad(oF, cF);
    frames.push({ i, y, ...d });
    if (i % 5 === 0) console.log("frame", i, "y", y, "match%", d.matchPct);
  }
  report.frames = frames;
  const avg =
    frames.reduce((a, f) => a + f.matchPct, 0) / Math.max(1, frames.length);
  console.log("frame AVG match%", avg.toFixed(2));

  // Hover header CTA
  await pageO.evaluate(() => window.scrollTo(0, 0));
  await pageC.evaluate(() => window.scrollTo(0, 0));
  await pageO.waitForTimeout(400);
  await pageC.waitForTimeout(300);
  try {
    const oBtn = pageO.locator("text=Задать вопрос").first();
    const cBtn = pageC.locator(".np-header__pill").nth(1);
    await oBtn.hover({ timeout: 3000 });
    await cBtn.hover({ timeout: 3000 });
    await pageO.waitForTimeout(400);
    await pageC.waitForTimeout(300);
    await pageO.screenshot({
      path: path.join(out, "anim", "hover-ask-orig.png"),
      clip: { x: 0, y: 0, width: 1440, height: 120 },
    });
    await pageC.screenshot({
      path: path.join(out, "anim", "hover-ask-clone.png"),
      clip: { x: 0, y: 0, width: 1440, height: 120 },
    });
    report.anim.push({
      kind: "hover-ask",
      ...(await mad(
        path.join(out, "anim", "hover-ask-orig.png"),
        path.join(out, "anim", "hover-ask-clone.png"),
      )),
    });
  } catch (e) {
    report.anim.push({ kind: "hover-ask", error: e.message.slice(0, 100) });
  }

  // Effects sticky scrub
  const effectsY = await pageO.evaluate(() => {
    const el = document.querySelector("#rec630244575");
    if (!el) return 2600;
    return Math.round(el.getBoundingClientRect().top + window.scrollY - 80);
  });
  for (let k = 0; k < 16; k++) {
    const y = effectsY + k * 70;
    await pageO.evaluate((yy) => window.scrollTo(0, yy), y);
    await pageC.evaluate((yy) => window.scrollTo(0, yy), y);
    await pageO.waitForTimeout(200);
    await pageC.waitForTimeout(150);
    await hideOrigChrome(pageO);
    await revealClone(pageC);
    const oF = path.join(out, "anim", `fx-${String(k).padStart(2, "0")}-orig.png`);
    const cF = path.join(out, "anim", `fx-${String(k).padStart(2, "0")}-clone.png`);
    await pageO.screenshot({ path: oF });
    await pageC.screenshot({ path: cF });
    const d = await mad(oF, cF);
    report.anim.push({ kind: "fx-scroll", k, y, ...d });
    console.log("fx-frame", k, d.matchPct);
  }

  await pageO.close();
  await pageC.close();
}

fs.writeFileSync(path.join(out, "report.json"), JSON.stringify(report, null, 2));
await browser.close();

const pageAvg =
  report.pages.filter((p) => p.top).reduce((a, p) => a + p.top.matchPct, 0) /
  Math.max(1, report.pages.filter((p) => p.top).length);
const frameAvg =
  report.frames.reduce((a, f) => a + f.matchPct, 0) /
  Math.max(1, report.frames.length);
const fx = report.anim.filter((a) => a.kind === "fx-scroll");
const fxAvg =
  fx.reduce((a, f) => a + f.matchPct, 0) / Math.max(1, fx.length);

console.log("DONE");
console.log("pages avg top", pageAvg.toFixed(2));
console.log("frame AVG", frameAvg.toFixed(2));
console.log("fx AVG", fxAvg.toFixed(2));
