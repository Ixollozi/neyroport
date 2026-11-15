import { chromium } from "playwright";
import crypto from "crypto";
import fs from "fs";
import path from "path";

const mediaDir = path.resolve("public/media/origin");
fs.mkdirSync(mediaDir, { recursive: true });
const cache = new Map();

function fullCdn(url) {
  return url
    .replace("thb.tildacdn.com", "static.tildacdn.com")
    .replace(/\/-\/(?:resizeb?|empty|format)\/[^/]+\//g, "/")
    .split("?")[0];
}

async function localize(url) {
  const abs = fullCdn(url);
  if (!abs || !/^https?:/.test(abs)) return "";
  if (cache.has(abs)) return cache.get(abs);
  const rawName = (abs.split("/").pop() || "file").replace(/[^a-zA-Z0-9._-]/g, "_");
  const ext = (rawName.match(/\.[a-z0-9]+$/i) || [".bin"])[0];
  const base = rawName.replace(/\.[a-z0-9]+$/i, "").slice(0, 40);
  const hash = crypto.createHash("sha1").update(abs).digest("hex").slice(0, 10);
  const name = `${base}-${hash}${ext}`;
  const dest = path.join(mediaDir, name);
  const pub = "/media/origin/" + name;
  cache.set(abs, pub);
  if (!fs.existsSync(dest)) {
    const res = await fetch(abs);
    if (!res.ok) return abs;
    fs.writeFileSync(dest, Buffer.from(await res.arrayBuffer()));
  }
  return pub;
}

function nodeFrom(el, art, extra) {
  const r = el.getBoundingClientRect();
  const st = getComputedStyle(el);
  return {
    x: Math.round((r.left - art.left) * 100) / 100,
    y: Math.round((r.top - art.top) * 100) / 100,
    w: Math.round(r.width * 100) / 100,
    h: Math.round(r.height * 100) / 100,
    z: extra.z,
    zoom: 1,
    op: "1",
    color: st.color,
    bg: extra.bg || st.backgroundColor,
    bi: extra.bi || "",
    bsize: extra.bsize || st.backgroundSize,
    bpos: extra.bpos || st.backgroundPosition,
    br: st.borderRadius,
    border: st.borderWidth === "0px" ? "" : `${st.borderWidth} ${st.borderStyle} ${st.borderColor}`,
    shadow: st.boxShadow === "none" ? "" : st.boxShadow,
    ff: st.fontFamily,
    fs: st.fontSize,
    fw: st.fontWeight,
    fst: st.fontStyle,
    lh: st.lineHeight,
    ls: st.letterSpacing,
    ta: st.textAlign,
    tt: st.textTransform,
    td: st.textDecorationLine,
    ws: st.whiteSpace,
    pad: st.padding,
    disp: "block",
    ai: "normal",
    jc: "normal",
    of: "hidden",
    blend: "normal",
    img: "",
    fit: "cover",
    pos: "center",
    video: "",
    poster: "",
    href: extra.href || "",
    html: extra.html || "",
  };
}

const mode = process.argv[2] === "m" ? "m" : "d";
const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({
  viewport: { width: mode === "m" ? 390 : 1440, height: mode === "m" ? 844 : 900 },
});
await page.goto("https://neyroport.ru/publikacii/", { waitUntil: "domcontentloaded", timeout: 90000 });
await page.waitForTimeout(1800);
for (let y = 0; y < 4000; y += 600) {
  await page.evaluate((yy) => window.scrollTo({ top: yy, behavior: "instant" }), y);
  await page.waitForTimeout(80);
}
await page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));
await page.waitForTimeout(300);

const raw = await page.evaluate(() => {
  const rec = document.getElementById("rec613195925");
  const rr = rec.getBoundingClientRect();
  const art = { left: rr.left, top: rr.top + scrollY, width: rr.width, height: rr.height };
  const buttons = [...rec.querySelectorAll(".js-feed-parts-switcher")].map((el) => {
    const st = getComputedStyle(el);
    return {
      text: el.innerText.trim(),
      box: el.getBoundingClientRect().toJSON(),
      color: st.color,
      bg: st.backgroundColor,
      br: st.borderRadius,
      fs: st.fontSize,
      fw: st.fontWeight,
      lh: st.lineHeight,
      ff: st.fontFamily,
      pad: st.padding,
    };
  });
  const posts = [...rec.querySelectorAll(".js-feed-post")].map((post) => {
    const img = post.querySelector(".t-feed__post-bgimg");
    const date = post.querySelector(".js-feed-post-date");
    const tag = post.querySelector(".t-feed__post-tag");
    const title = post.querySelector(".js-feed-post-title");
    const descr = post.querySelector(".js-feed-post-descr");
    const link = post.querySelector(".js-feed-post-link");
    const pick = (el) => {
      if (!el) return null;
      const st = getComputedStyle(el);
      const r = el.getBoundingClientRect();
      return {
        box: r.toJSON(),
        color: st.color,
        fs: st.fontSize,
        fw: st.fontWeight,
        lh: st.lineHeight,
        ls: st.letterSpacing,
        ff: st.fontFamily,
        ta: st.textAlign,
        text: el.innerText.trim(),
      };
    };
    const ist = img ? getComputedStyle(img) : null;
    return {
      href: link ? link.getAttribute("href") : "",
      post: post.getBoundingClientRect().toJSON(),
      img: img
        ? { box: img.getBoundingClientRect().toJSON(), bi: ist.backgroundImage, bsize: ist.backgroundSize, bpos: ist.backgroundPosition, br: ist.borderRadius }
        : null,
      date: pick(date),
      tag: pick(tag),
      title: pick(title),
      descr: pick(descr),
    };
  });
  return { art, buttons, posts, bg: getComputedStyle(rec).backgroundColor };
});

await browser.close();

let z = 1;
const nodes = [];
const artTop = raw.art.top;
const artLeft = raw.art.left;

function pushBox(box, fields) {
  nodes.push({
    x: Math.round((box.x - artLeft) * 100) / 100,
    y: Math.round((box.y + 0 - (artTop - (raw.art.top))) * 100) / 100,
    w: Math.round(box.width * 100) / 100,
    h: Math.round(box.height * 100) / 100,
    z: z++,
    zoom: 1,
    op: "1",
    color: fields.color || "rgb(33,36,41)",
    bg: fields.bg || "rgba(0,0,0,0)",
    bi: fields.bi || "",
    bsize: fields.bsize || "cover",
    bpos: fields.bpos || "50% 50%",
    br: fields.br || "0px",
    border: "",
    shadow: "",
    ff: fields.ff || "Inter, Arial, sans-serif",
    fs: fields.fs || "16px",
    fw: fields.fw || "400",
    fst: "normal",
    lh: fields.lh || "normal",
    ls: fields.ls || "normal",
    ta: fields.ta || "left",
    tt: "none",
    td: "none",
    ws: "normal",
    pad: fields.pad || "0px",
    disp: "block",
    ai: "normal",
    jc: "normal",
    of: "hidden",
    blend: "normal",
    img: "",
    fit: "cover",
    pos: "center",
    video: "",
    poster: "",
    href: fields.href || "",
    html: fields.html || "",
  });
}

for (const b of raw.buttons) {
  pushBox(b.box, b);
  nodes[nodes.length - 1].html = b.text;
  nodes[nodes.length - 1].y = Math.round((b.box.y - (raw.art.top - artTop) - (raw.art.top - raw.art.top)) * 100) / 100;
}

// boxes are viewport coords; art.top was stored as document top. Recompute y from viewport by using the stored art viewport top.
// The evaluate stored art.top as document coordinate (rr.top + scrollY) and we scrolled back to 0, so rr.top === document top.
// box.y is viewport y. At scroll 0, viewport y === document y. So y = box.y - artViewportTop.
// I stored art.top as document top. At scroll 0 they match. Use box.y - (art.top) if art.top is document and scroll is 0.
// Fix y properly below.

const artDocTop = raw.art.top;
for (const n of nodes) {
  /* filled below */
}

nodes.length = 0;
z = 1;
function add(box, fields) {
  const y = Math.round((box.y - (artDocTop - 0)) * 100) / 100;
  // at scrollY 0, box.y is document y if we measured at scroll 0.
  nodes.push({
    x: Math.round((box.x - raw.art.left) * 100) / 100,
    y: Math.round((box.y - (artDocTop)) * 100) / 100,
    w: Math.round(box.width * 100) / 100,
    h: Math.round(box.height * 100) / 100,
    z: z++,
    zoom: 1,
    op: "1",
    color: fields.color || "rgb(33,36,41)",
    bg: fields.bg || "rgba(0,0,0,0)",
    bi: fields.bi || "",
    bsize: fields.bsize || "auto",
    bpos: fields.bpos || "50% 50%",
    br: fields.br || "0px",
    border: "",
    shadow: "",
    ff: fields.ff || "Inter, Arial, sans-serif",
    fs: fields.fs || "16px",
    fw: fields.fw || "400",
    fst: "normal",
    lh: fields.lh || "normal",
    ls: fields.ls || "normal",
    ta: fields.ta || "start",
    tt: "none",
    td: "none",
    ws: "normal",
    pad: fields.pad || "0px",
    disp: "block",
    ai: "normal",
    jc: "normal",
    of: "hidden",
    blend: "normal",
    img: "",
    fit: "cover",
    pos: "center",
    video: "",
    poster: "",
    href: fields.href || "",
    html: fields.html || "",
  });
}

for (const b of raw.buttons) {
  add(b.box, { ...b, html: b.text, bg: b.bg });
}
for (const p of raw.posts) {
  if (p.img) {
    const bi = p.img.bi && p.img.bi !== "none" ? p.img.bi : "";
    add(p.img.box, { bi, bsize: p.img.bsize, bpos: p.img.bpos, br: p.img.br, href: p.href, of: "hidden" });
  }
  for (const part of [p.date, p.tag, p.title, p.descr]) {
    if (!part || !part.text) continue;
    add(part.box, { ...part, html: part.text, href: p.href });
  }
}

for (const n of nodes) {
  if (n.bi && n.bi.includes("url(")) {
    const urls = [...n.bi.matchAll(/url\(["']?([^"')]+)/g)].map((m) => m[1]);
    for (const u of urls) {
      const local = await localize(u);
      n.bi = n.bi.replace(u, local);
    }
  }
}

const news = JSON.parse(fs.readFileSync("src/content/origin/news.json", "utf8"));
const sec = {
  top: Math.round(artDocTop),
  h: Math.round(raw.art.height),
  w: Math.round(raw.art.width),
  bg: raw.bg,
  br: "0px",
  nodes,
};
news[mode].secs.push(sec);
news[mode].h = Math.max(news[mode].h, sec.top + sec.h);
fs.writeFileSync("src/content/origin/news.json", JSON.stringify(news));
console.log(mode, "posts", raw.posts.length, "nodes", nodes.length, "h", news[mode].h);
