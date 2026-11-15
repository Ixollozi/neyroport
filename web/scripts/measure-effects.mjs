import { chromium } from "playwright";
import fs from "fs";
import path from "path";

const out = "public/media/sections";
fs.mkdirSync(out, { recursive: true });

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({
  viewport: { width: 1440, height: 900 },
  deviceScaleFactor: 2,
});

await page.goto("https://neyroport.ru/", {
  waitUntil: "domcontentloaded",
  timeout: 90000,
});
await page.waitForTimeout(10000);

await page.evaluate(() => {
  for (const el of document.querySelectorAll("body *")) {
    const st = getComputedStyle(el);
    if (st.position !== "fixed" && st.position !== "sticky") continue;
    const r = el.getBoundingClientRect();
    if (r.top < 140 || r.left < 90) {
      if (r.height < 160 || r.width < 200) {
        el.style.setProperty("opacity", "0", "important");
        el.style.setProperty("visibility", "hidden", "important");
      }
    }
  }
});

const info = await page.evaluate(() => {
  const sec = document.querySelector("#rec630244575");
  if (!sec) return null;
  const sRect = sec.getBoundingClientRect();
  const artboards = [...sec.querySelectorAll(".t396__artboard")].map((el) => {
    const r = el.getBoundingClientRect();
    const text = (el.innerText || "").replace(/\s+/g, " ").trim().slice(0, 80);
    return {
      h: el.offsetHeight,
      top: Math.round(r.top - sRect.top),
      absTop: Math.round(r.top + window.scrollY),
      text,
    };
  });
  // also large tn-atoms / cards
  const cards = [...sec.querySelectorAll(".tn-atom")]
    .filter((el) => el.offsetHeight > 400 && el.offsetWidth > 600)
    .map((el) => {
      const r = el.getBoundingClientRect();
      return {
        h: el.offsetHeight,
        w: el.offsetWidth,
        top: Math.round(r.top - sRect.top),
        left: Math.round(r.left - sRect.left),
        text: (el.innerText || "").replace(/\s+/g, " ").trim().slice(0, 60),
      };
    });
  return {
    secH: sec.offsetHeight,
    secTop: Math.round(sec.getBoundingClientRect().top + window.scrollY),
    artboards,
    cards: cards.slice(0, 20),
    marginTop: getComputedStyle(sec).marginTop,
    paddingTop: getComputedStyle(sec).paddingTop,
  };
});

fs.writeFileSync(path.join(out, "effects-layout.json"), JSON.stringify(info, null, 2));
console.log(JSON.stringify(info, null, 2));

// Capture each major visual band of effects as separate screenshots by scrolling within section
const sec = page.locator("#rec630244575").first();
await sec.scrollIntoViewIfNeeded();
await page.waitForTimeout(1000);

const box = await sec.boundingBox();
const bands = [
  ["effects-a", 0],
  ["effects-b", 700],
  ["effects-c", 1400],
  ["effects-d", 2000],
];

for (const [name, offset] of bands) {
  await page.evaluate(
    ([y]) => window.scrollTo(0, y),
    [info.secTop + offset - 40],
  );
  await page.waitForTimeout(700);
  await page.evaluate(() => {
    for (const el of document.querySelectorAll("body *")) {
      const st = getComputedStyle(el);
      if (st.position !== "fixed" && st.position !== "sticky") continue;
      const r = el.getBoundingClientRect();
      if (r.top < 140 || r.left < 90) {
        if (r.height < 160 || r.width < 200) {
          el.style.setProperty("opacity", "0", "important");
        }
      }
    }
  });
  await page.screenshot({
    path: path.join(out, `${name}.png`),
    type: "png",
    clip: {
      x: 0,
      y: Math.max(0, Math.min(box.y + offset - (await page.evaluate(() => window.scrollY)) , 0) || 0),
      width: 1440,
      height: 900,
    },
  }).catch(() => {});
}

// Better: full section reshot + also capture hero with longer wait for video
await page.evaluate(() => window.scrollTo(0, 0));
await page.waitForTimeout(2000);
const video = await page.evaluate(() => {
  const v = document.querySelector("video");
  if (!v) return null;
  return { ready: v.readyState, w: v.videoWidth, h: v.videoHeight, t: v.currentTime };
});
console.log("video", video);

// try seeking video if ready
if (video && video.ready >= 2) {
  await page.evaluate(() => {
    const v = document.querySelector("video");
    if (v) {
      v.currentTime = Math.min(2, (v.duration || 3) * 0.3);
    }
  });
  await page.waitForTimeout(500);
  await page.screenshot({
    path: path.join(out, "hero-live.png"),
    type: "png",
  });
  console.log("hero-live", fs.statSync(path.join(out, "hero-live.png")).size);
}

// Reshoot full effects clean
await sec.scrollIntoViewIfNeeded();
await page.waitForTimeout(1500);
await page.evaluate(() => {
  for (const el of document.querySelectorAll("body *")) {
    const st = getComputedStyle(el);
    if (st.position !== "fixed" && st.position !== "sticky") continue;
    const r = el.getBoundingClientRect();
    if (r.top < 140 || r.left < 90) {
      if (r.height < 160 || r.width < 200) {
        el.style.setProperty("opacity", "0", "important");
      }
    }
  }
});
await sec.screenshot({ path: path.join(out, "effects-full.png"), type: "png" });
console.log("effects-full", fs.statSync(path.join(out, "effects-full.png")).size);

await browser.close();
