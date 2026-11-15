import { chromium } from "playwright";
import fs from "fs";
import path from "path";
import https from "https";
import http from "http";

const outDir = "public/media/pulled";
fs.mkdirSync(outDir, { recursive: true });

function download(url, dest) {
  return new Promise((resolve, reject) => {
    const lib = url.startsWith("https") ? https : http;
    const file = fs.createWriteStream(dest);
    lib
      .get(url, (res) => {
        if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
          file.close();
          fs.unlinkSync(dest);
          return download(res.headers.location, dest).then(resolve, reject);
        }
        res.pipe(file);
        file.on("finish", () => file.close(() => resolve(dest)));
      })
      .on("error", reject);
  });
}

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
await page.goto("https://neyroport.ru/", {
  waitUntil: "domcontentloaded",
  timeout: 90000,
});
await page.waitForTimeout(6000);

const urls = await page.evaluate(() => {
  const pick = (sel) =>
    [...document.querySelectorAll(sel)]
      .map((img) => img.currentSrc || img.src)
      .filter((u) => u && u.startsWith("http") && !u.includes("data:"));

  return {
    all: [...new Set(pick("img"))].slice(0, 80),
    devices: pick("#rec630686184 img"),
    bento: pick("#rec630812498 img"),
    restore: pick("#rec621441297 img"),
    effects: pick("#rec630244575 img"),
  };
});

fs.writeFileSync(
  path.join(outDir, "urls.json"),
  JSON.stringify(urls, null, 2),
);

let n = 0;
for (const [group, list] of Object.entries(urls)) {
  if (group === "all") continue;
  for (const url of list) {
    const ext = url.includes(".svg")
      ? "svg"
      : url.includes(".png")
        ? "png"
        : url.includes(".webp")
          ? "webp"
          : "jpg";
    const dest = path.join(outDir, `${group}-${n}.${ext}`);
    try {
      await download(url, dest);
      console.log("ok", dest, fs.statSync(dest).size);
      n += 1;
    } catch (e) {
      console.log("fail", url, e.message);
    }
  }
}

await browser.close();
console.log("done", n);
