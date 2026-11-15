import { chromium } from "playwright";
import fs from "fs";

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();
await page.goto("https://neyroport.ru/", {
  waitUntil: "domcontentloaded",
  timeout: 90000,
});
await page.waitForTimeout(6000);

const sources = await page.evaluate(() => {
  const out = [];
  document.querySelectorAll("video, source").forEach((el) => {
    out.push({
      tag: el.tagName,
      src: el.getAttribute("src") || el.currentSrc || "",
      poster: el.getAttribute("poster") || "",
    });
  });
  const html = document.documentElement.innerHTML;
  const re = /https?:[^"'\\s]+\.mp4[^"'\\s]*/gi;
  const matches = [...new Set(html.match(re) || [])];
  return { videoEls: out, matches };
});

console.log(JSON.stringify(sources, null, 2));

for (const url of sources.matches.slice(0, 5)) {
  try {
    const res = await page.request.get(url, { timeout: 45000 });
    console.log(url.slice(0, 100), res.status(), res.headers()["content-length"]);
    if (res.ok()) {
      const buf = await res.body();
      if (buf.length > 100000) {
        fs.writeFileSync("public/media/hero.mp4", buf);
        console.log("saved hero.mp4", buf.length);
        break;
      }
    }
  } catch (e) {
    console.log("fail", url.slice(0, 80), e.message);
  }
}

await browser.close();
