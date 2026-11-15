import { chromium } from "playwright";
import crypto from "crypto";
import fs from "fs";
import path from "path";

const mediaDir = path.resolve("public/media/origin");
const cache = new Map();

function fullCdn(url) {
  return url.replace("thb.tildacdn.com", "static.tildacdn.com").replace(/\/-\/(?:resizeb?|empty|format)\/[^/]+\//g, "/").split("?")[0];
}
async function localize(url) {
  const abs = fullCdn(url);
  if (!/^https?:/.test(abs)) return url;
  if (cache.has(abs)) return cache.get(abs);
  const raw = (abs.split("/").pop() || "file").replace(/[^a-zA-Z0-9._-]/g, "_");
  const ext = (raw.match(/\.[a-z0-9]+$/i) || [".bin"])[0];
  const base = raw.replace(/\.[a-z0-9]+$/i, "").slice(0, 40);
  const hash = crypto.createHash("sha1").update(abs).digest("hex").slice(0, 10);
  const name = `${base}-${hash}${ext}`;
  const dest = path.join(mediaDir, name);
  const pub = "/media/origin/" + name;
  cache.set(abs, pub);
  if (!fs.existsSync(dest)) {
    const res = await fetch(abs);
    if (res.ok) fs.writeFileSync(dest, Buffer.from(await res.arrayBuffer()));
    else return abs;
  }
  return pub;
}

const slugs = [
  "0mtimakor1-effect-of-electrical-stimulation-of-tong",
  "or7rrkp2y1-metodicheskie-rekomendatsii-translingval",
  "2ifjtrden1-metodicheskie-rekomendatsii-primenenie-a",
  "m1hdpm5yh1-posobie-neiroport-arhitektura-razuma",
  "dp7e0juny1-real-world-evidence-of-improved-attentio",
  "9ylv10zk91-translingvalnaya-stimulyatsiya-v-komplek",
  "mt51jm5v81-translingual-neurostimulation-for-periph",
  "33dxkunug1-primenenie-metoda-translingvalnoi-stimul",
];

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();

function boxNode(el, art, extra) {
  const r = el.getBoundingClientRect();
  const st = getComputedStyle(el);
  return {
    x: Math.round((r.left - art.left) * 100) / 100,
    y: Math.round((r.top - art.top) * 100) / 100,
    w: Math.round(r.width * 100) / 100,
    h: Math.round(Math.max(r.height, el.scrollHeight) * 100) / 100,
    z: extra.z,
    zoom: 1,
    op: "1",
    color: st.color,
    bg: st.backgroundColor,
    bi: "",
    bsize: "auto",
    bpos: "0 0",
    br: "0px",
    border: "",
    shadow: "",
    ff: st.fontFamily,
    fs: st.fontSize,
    fw: st.fontWeight,
    fst: st.fontStyle,
    lh: st.lineHeight,
    ls: st.letterSpacing,
    ta: st.textAlign,
    tt: "none",
    td: "none",
    ws: "normal",
    pad: st.padding,
    disp: "block",
    ai: "normal",
    jc: "normal",
    of: "visible",
    blend: "normal",
    img: "",
    fit: "",
    pos: "",
    video: "",
    poster: "",
    href: extra.href || "",
    html: extra.html || "",
  };
}

for (const slug of slugs) {
  const layouts = {};
  for (const [key, w, h] of [["d", 1440, 900], ["m", 390, 844]]) {
    await page.setViewportSize({ width: w, height: h });
    await page.goto("https://neyroport.ru/publikacii/tpost/" + slug, { waitUntil: "domcontentloaded", timeout: 90000 });
    await page.waitForTimeout(1500);
    const raw = await page.evaluate(() => {
      const popup = document.querySelector(".t-feed__post-popup__content") || document.querySelector(".t-feed__post-popup");
      const art = { left: 0, top: 0, width: window.innerWidth, height: document.body.scrollHeight };
      const pick = (sel) => popup.querySelector(sel) || document.querySelector(sel);
      const nodes = [];
      let z = 1;
      const add = (el, html, href) => {
        if (!el) return;
        const r = el.getBoundingClientRect();
        const st = getComputedStyle(el);
        nodes.push({
          x: Math.round((r.left - art.left) * 100) / 100,
          y: Math.round((r.top - art.top) * 100) / 100,
          w: Math.round(r.width * 100) / 100,
          h: Math.round(Math.max(r.height, el.scrollHeight) * 100) / 100,
          z: z++,
          zoom: 1,
          op: "1",
          color: st.color,
          bg: "rgba(0,0,0,0)",
          bi: "",
          bsize: "auto",
          bpos: "0% 0%",
          br: "0px",
          border: "",
          shadow: "",
          ff: st.fontFamily,
          fs: st.fontSize,
          fw: st.fontWeight,
          fst: st.fontStyle,
          lh: st.lineHeight,
          ls: st.letterSpacing,
          ta: st.textAlign,
          tt: "none",
          td: "none",
          ws: "normal",
          pad: st.padding,
          disp: "block",
          ai: "normal",
          jc: "normal",
          of: "visible",
          blend: "normal",
          img: "",
          fit: "",
          pos: "",
          video: "",
          poster: "",
          href: href || "",
          html: html ?? el.innerHTML,
        });
      };
      const back = document.querySelector(".js-feed-close-text");
      add(back, back ? back.innerText : "", "/news");
      add(document.querySelector(".t-popup__close"), null, "/news");
      add(pick(".js-feed-post-title"), null, "");
      add(pick(".js-feed-post-date"), null, "");
      add(pick(".t-feed__post-popup__tag"), null, "");
      add(pick(".js-feed-post-text"), null, "");
      const pageH = Math.round(document.body.scrollHeight);
      return {
        bodyBg: getComputedStyle(document.body).backgroundColor,
        h: pageH,
        secTop: Math.round(art.top + scrollY),
        secH: Math.round(Math.max(art.height, popup.scrollHeight)),
        secW: Math.round(art.width),
        nodes: nodes.filter((n) => n.w > 2 && n.h > 2 && n.html),
      };
    });
    layouts[key] = {
      bodyBg: raw.bodyBg,
      h: Math.max(raw.h, raw.secTop + raw.secH),
      secs: [{ top: raw.secTop, h: raw.secH, w: raw.secW, bg: "rgb(255,255,255)", br: "0px", nodes: raw.nodes }],
    };
  }
  for (const key of ["d", "m"]) {
    for (const n of layouts[key].secs[0].nodes) {
      n.html = await replaceAsync(n.html, /src="([^"]+)"/g, async (_, url) => `src="${await localize(url)}"`);
    }
  }
  fs.writeFileSync(path.join("src/content/origin", slug + ".json"), JSON.stringify(layouts));
  console.log(slug, "nodes", layouts.d.secs[0].nodes.length, "h", layouts.d.h);
}
await browser.close();

async function replaceAsync(str, re, fn) {
  const matches = [...str.matchAll(re)];
  if (!matches.length) return str;
  let out = str;
  for (const m of matches) {
    const next = await fn(m[0], m[1]);
    out = out.replace(m[0], next);
  }
  return out;
}
