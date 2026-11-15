import { chromium } from "playwright";
import fs from "fs";

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();
const found = new Set();

page.on("request", (req) => {
  const u = req.url();
  if (/\.(mp4|webm|mov)(\?|$)/i.test(u) || u.includes("dropbox") || u.includes("tildacdn")) {
    if (u.includes("mp4") || u.includes("video") || u.includes("Animation")) found.add(u);
  }
});

await page.goto("https://neyroport.ru/", {
  waitUntil: "domcontentloaded",
  timeout: 90000,
});
await page.waitForTimeout(12000);

console.log([...found].join("\n"));

for (const url of found) {
  if (!/\.mp4/i.test(url)) continue;
  try {
    const res = await page.request.get(url, { timeout: 60000 });
    console.log("try", res.status(), url.slice(0, 120));
    if (res.ok()) {
      const buf = await res.body();
      console.log("bytes", buf.length);
      if (buf.length > 200000) {
        fs.writeFileSync("public/media/hero.mp4", buf);
        console.log("SAVED");
        break;
      }
    }
  } catch (e) {
    console.log("fail", e.message.slice(0, 100));
  }
}

await browser.close();
