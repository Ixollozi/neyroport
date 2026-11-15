import { chromium } from "playwright";
import fs from "fs";

const dir = "C:/Users/Sam/AppData/Local/Temp/np-cmp";
fs.mkdirSync(dir, { recursive: true });
const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

await page.goto("https://neyroport.ru/contacts", { waitUntil: "domcontentloaded", timeout: 90000 });
await page.waitForTimeout(1500);
await page.evaluate(() => document.querySelectorAll(".loader, #loader, .t-zoomer").forEach((n) => n.remove()));
await page.screenshot({ path: dir + "/o-contacts.png" });

await page.goto("http://localhost:3000/ru/contacts", { waitUntil: "networkidle", timeout: 90000 });
await page.evaluate(() => window.dispatchEvent(new Event("resize")));
await page.waitForTimeout(1200);
await page.screenshot({ path: dir + "/c-contacts.png" });
console.log("shot");
await browser.close();
