import { chromium } from "playwright";
import fs from "fs";

const out = "public/media/ref";
fs.mkdirSync(out, { recursive: true });

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({
  viewport: { width: 1440, height: 900 },
  deviceScaleFactor: 1,
});

await page.goto("http://localhost:3000/ru", {
  waitUntil: "networkidle",
  timeout: 60000,
});
await page.waitForTimeout(1500);
await page.screenshot({ path: `${out}/clone-01-hero.png`, type: "png" });
await page.screenshot({
  path: `${out}/clone-01-header.png`,
  type: "png",
  clip: { x: 0, y: 0, width: 1440, height: 110 },
});

const metrics = await page.evaluate(() => {
  const title = document.querySelector(".np-hero__title");
  const sub = document.querySelector(".np-hero__subtitle");
  const hero = document.querySelector(".np-hero");
  const r = (el) => {
    if (!el) return null;
    const b = el.getBoundingClientRect();
    const s = getComputedStyle(el);
    return {
      x: Math.round(b.x),
      y: Math.round(b.y),
      w: Math.round(b.width),
      h: Math.round(b.height),
      color: s.color,
      bg: s.backgroundColor,
      fs: s.fontSize,
      fw: s.fontWeight,
      lh: s.lineHeight,
    };
  };
  return {
    heroBg: hero ? getComputedStyle(hero).backgroundColor : null,
    title: r(title),
    sub: r(sub),
    headerLinks: [...document.querySelectorAll(".np-header__link")].map(
      (a) => a.textContent,
    ),
  };
});

fs.writeFileSync(`${out}/clone-metrics.json`, JSON.stringify(metrics, null, 2));
console.log(JSON.stringify(metrics, null, 2));
await browser.close();
