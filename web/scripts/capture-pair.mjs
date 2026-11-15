import { chromium } from "playwright";
import fs from "fs";

const out = "public/media/ref";
fs.mkdirSync(out, { recursive: true });

async function shot(page, name, clip) {
  const path = `${out}/${name}`;
  if (clip) await page.screenshot({ path, type: "png", clip });
  else await page.screenshot({ path, type: "png" });
  console.log(name, fs.statSync(path).size);
}

const browser = await chromium.launch({ headless: true });

{
  const page = await browser.newPage({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 1,
  });
  await page.goto("https://neyroport.ru/", {
    waitUntil: "domcontentloaded",
    timeout: 90000,
  });
  await page.waitForTimeout(8000);
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(1000);
  await shot(page, "orig-00-hero.png");
  await shot(page, "orig-00-header.png", {
    x: 0,
    y: 0,
    width: 1440,
    height: 110,
  });

  const sections = [
    ["orig-01-rehab.png", "#rec630681299"],
    ["orig-02-bento.png", "#rec630812498"],
    ["orig-03-effects.png", "#rec630244575"],
    ["orig-04-restore.png", "#rec621441297"],
    ["orig-05-devices.png", "#rec630686184"],
  ];

  for (const [name, sel] of sections) {
    const loc = page.locator(sel).first();
    if (!(await loc.count())) continue;
    await loc.scrollIntoViewIfNeeded();
    await page.waitForTimeout(1200);
    const box = await loc.boundingBox();
    if (!box) continue;
    await shot(page, name, {
      x: 0,
      y: Math.max(0, Math.floor(box.y)),
      width: 1440,
      height: Math.min(900, Math.ceil(box.height)),
    });
  }
  await page.close();
}

{
  const page = await browser.newPage({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 1,
  });
  await page.goto("http://localhost:3000/ru", {
    waitUntil: "networkidle",
    timeout: 90000,
  });
  await page.waitForTimeout(1500);
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(500);
  await shot(page, "clone-00-hero.png");
  await shot(page, "clone-00-header.png", {
    x: 0,
    y: 0,
    width: 1440,
    height: 110,
  });

  const cloneSecs = [
    ["clone-01-rehab.png", ".np-shot--rehab"],
    ["clone-02-bento.png", ".np-shot--bento"],
    ["clone-03-effects.png", ".np-shot--effects"],
    ["clone-04-restore.png", ".np-shot--restore"],
    ["clone-05-devices.png", ".np-shot--devices"],
  ];

  for (const [name, sel] of cloneSecs) {
    const loc = page.locator(sel).first();
    if (!(await loc.count())) {
      console.log("missing clone", sel);
      continue;
    }
    await loc.scrollIntoViewIfNeeded();
    await page.waitForTimeout(600);
    const box = await loc.boundingBox();
    if (!box) continue;
    await shot(page, name, {
      x: 0,
      y: Math.max(0, Math.floor(box.y)),
      width: 1440,
      height: Math.min(900, Math.ceil(box.height)),
    });
  }

  const heights = await page.evaluate(() => document.body.scrollHeight);
  let y = 0;
  let i = 1;
  while (y < heights && i <= 10) {
    await page.evaluate((yy) => window.scrollTo(0, yy), y);
    await page.waitForTimeout(350);
    await shot(page, `clone-scroll-${String(i).padStart(2, "0")}.png`);
    y += 850;
    i += 1;
  }
  await page.close();
}

await browser.close();
console.log("done");
