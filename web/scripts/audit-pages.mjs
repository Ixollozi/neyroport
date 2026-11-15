import { chromium } from "playwright";
import sharp from "sharp";
import fs from "fs";
import path from "path";

const out = "public/media/ref/full-audit/pages";
const CLONE = "http://localhost:3000/ru";
const ORIG = "https://neyroport.ru";

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

async function hideWidgets(page) {
  await page.evaluate(() => {
    for (const el of document.querySelectorAll("body *")) {
      const st = getComputedStyle(el);
      if (st.position !== "fixed" && st.position !== "sticky") continue;
      const r = el.getBoundingClientRect();
      const isCornerWidget =
        r.left < 100 &&
        r.bottom > innerHeight - 120 &&
        r.width < 120 &&
        r.height < 120;
      if (isCornerWidget) {
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

const results = [];
for (const [name, clonePath, origPath] of PAGES) {
  const entry = { name };
  try {
    await pageO.goto(ORIG + origPath, { waitUntil: "domcontentloaded", timeout: 60000 });
    await pageC.goto(CLONE + (clonePath === "/" ? "" : clonePath), {
      waitUntil: "networkidle",
      timeout: 60000,
    });
    await pageO.waitForTimeout(name === "home" ? 7000 : 4000);
    await pageC.waitForTimeout(1200);
    await hideWidgets(pageO);
    await pageC.evaluate(() =>
      document.querySelectorAll(".np-reveal").forEach((el) => el.classList.add("is-on")),
    );

    const oTop = path.join(out, `${name}-v2-orig-top.png`);
    const cTop = path.join(out, `${name}-v2-clone-top.png`);
    await pageO.screenshot({ path: oTop });
    await pageC.screenshot({ path: cTop });
    entry.top = await mad(oTop, cTop);

    const oH = await pageO.evaluate(() => document.body.scrollHeight);
    const cH = await pageC.evaluate(() => document.body.scrollHeight);
    entry.oH = oH;
    entry.cH = cH;
    if (oH > 1400 && cH > 1400) {
      const midY = Math.min(oH, cH) * 0.35;
      await pageO.evaluate((y) => window.scrollTo(0, y), midY);
      await pageC.evaluate((y) => window.scrollTo(0, y), midY);
      await pageO.waitForTimeout(600);
      await pageC.waitForTimeout(450);
      await hideWidgets(pageO);
      const oMid = path.join(out, `${name}-v2-orig-mid.png`);
      const cMid = path.join(out, `${name}-v2-clone-mid.png`);
      await pageO.screenshot({ path: oMid });
      await pageC.screenshot({ path: cMid });
      entry.mid = await mad(oMid, cMid);
    }
    console.log(
      name,
      "top",
      entry.top.matchPct,
      entry.mid ? "mid " + entry.mid.matchPct : "",
      "h",
      oH,
      cH,
    );
  } catch (e) {
    entry.error = e.message.slice(0, 120);
    console.log("FAIL", name, entry.error);
  }
  results.push(entry);
}

const tops = results.filter((r) => r.top);
const mids = results.filter((r) => r.mid);
console.log(
  "AVG top",
  (tops.reduce((a, r) => a + r.top.matchPct, 0) / tops.length).toFixed(2),
);
if (mids.length) {
  console.log(
    "AVG mid",
    (mids.reduce((a, r) => a + r.mid.matchPct, 0) / mids.length).toFixed(2),
  );
}
fs.writeFileSync(
  path.join(out, "..", "pages-v2-report.json"),
  JSON.stringify(results, null, 2),
);
await browser.close();
