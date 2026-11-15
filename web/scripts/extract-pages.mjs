import { chromium } from "playwright";
import crypto from "crypto";
import fs from "fs";
import path from "path";

const outDir = path.resolve("src/content/origin");
const mediaDir = path.resolve("public/media/origin");
fs.mkdirSync(outDir, { recursive: true });
fs.mkdirSync(mediaDir, { recursive: true });

const PAGES = [
  ["about", "/about"],
  ["method", "/about_tlns"],
  ["reviews", "/reviews"],
  ["faq", "/faq"],
  ["contacts", "/contacts"],
  ["rent", "/rent"],
  ["institutions", "/medical_institutions"],
  ["news", "/news"],
  ["training", "/training_meth"],
  ["insult", "/insult/"],
  ["vestibular", "/vestibulyarnie_narusheniya/"],
  ["dtsp", "/dtsp-u-detej-vzroslyih/"],
  ["demyel", "/demieliniziruyushchie-zabolevaniya/"],
  ["degen", "/degenerativnye-zabolevaniya/"],
  ["speech", "/zaderzka_razvitia/"],
  ["sdvg", "/sdvg/"],
  ["insomniya", "/insomniya/"],
  ["privacy", "/privacy"],
  ["terms", "/terms_of_use"],
  ["requisites", "/account_details"],
  ["0mtimakor1-effect-of-electrical-stimulation-of-tong", "/publikacii/tpost/0mtimakor1-effect-of-electrical-stimulation-of-tong"],
  ["or7rrkp2y1-metodicheskie-rekomendatsii-translingval", "/publikacii/tpost/or7rrkp2y1-metodicheskie-rekomendatsii-translingval"],
  ["2ifjtrden1-metodicheskie-rekomendatsii-primenenie-a", "/publikacii/tpost/2ifjtrden1-metodicheskie-rekomendatsii-primenenie-a"],
  ["m1hdpm5yh1-posobie-neiroport-arhitektura-razuma", "/publikacii/tpost/m1hdpm5yh1-posobie-neiroport-arhitektura-razuma"],
  ["dp7e0juny1-real-world-evidence-of-improved-attentio", "/publikacii/tpost/dp7e0juny1-real-world-evidence-of-improved-attentio"],
  ["9ylv10zk91-translingvalnaya-stimulyatsiya-v-komplek", "/publikacii/tpost/9ylv10zk91-translingvalnaya-stimulyatsiya-v-komplek"],
  ["mt51jm5v81-translingual-neurostimulation-for-periph", "/publikacii/tpost/mt51jm5v81-translingual-neurostimulation-for-periph"],
  ["33dxkunug1-primenenie-metoda-translingvalnoi-stimul", "/publikacii/tpost/33dxkunug1-primenenie-metoda-translingvalnoi-stimul"],
];

const only = process.argv[2];

function fullCdn(url) {
  if (!url) return "";
  return url
    .replace("thb.tildacdn.com", "static.tildacdn.com")
    .replace(/\/-\/(?:resizeb?|empty|format)\/[^/]+\//g, "/")
    .split("?")[0];
}

const fileMap = new Map();

async function localize(url) {
  const abs = fullCdn(url);
  if (!abs || !/^https?:/.test(abs)) return url || "";
  if (fileMap.has(abs)) return fileMap.get(abs);
  const rawName = (abs.split("/").pop() || "file").replace(/[^a-zA-Z0-9._-]/g, "_");
  const ext = (rawName.match(/\.[a-z0-9]+$/i) || [".bin"])[0];
  const base = rawName.replace(/\.[a-z0-9]+$/i, "").slice(0, 40);
  const hash = crypto.createHash("sha1").update(abs).digest("hex").slice(0, 10);
  const name = `${base}-${hash}${ext}`;
  const dest = path.join(mediaDir, name);
  const pub = "/media/origin/" + name;
  fileMap.set(abs, pub);
  if (!fs.existsSync(dest)) {
    try {
      const res = await fetch(abs);
      if (!res.ok) throw new Error(String(res.status));
      const buf = Buffer.from(await res.arrayBuffer());
      fs.writeFileSync(dest, buf);
    } catch (e) {
      console.log("asset fail", abs, e.message);
      fileMap.set(abs, abs);
      return abs;
    }
  }
  return pub;
}

function scalePx(value, z) {
  if (!value || z === 1) return value || "";
  return value.replace(/(-?\d*\.?\d+)px/g, (_, n) => {
    const v = Math.round(parseFloat(n) * z * 100) / 100;
    return `${v}px`;
  });
}

async function prep(page) {
  await page.evaluate(() => {
    document.querySelectorAll(".loader, #loader, .t-zoomer").forEach((n) => n.remove());
  });
  const height = await page.evaluate(() => document.body.scrollHeight);
  for (let y = 0; y < height + 400; y += 700) {
    await page.evaluate((yy) => window.scrollTo({ top: yy, behavior: "instant" }), y);
    await page.waitForTimeout(60);
  }
  await page.evaluate(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
    document.querySelectorAll(".t-animate").forEach((el) => {
      el.classList.add("t-animate_started", "t-animate_complete");
    });
    document.querySelectorAll("img").forEach((img) => {
      const ds = img.getAttribute("data-original") || img.getAttribute("data-src");
      if (ds && (!img.currentSrc || img.currentSrc.includes("empty"))) img.src = ds;
    });
  });
  await page.waitForTimeout(400);
}

async function extract(page) {
  return page.evaluate(() => {
    const isFooter = (rec) => {
      const t = (rec.innerText || "").replace(/\s+/g, " ");
      return /Задать вопрос специалисту/.test(t) && /Telegram/.test(t);
    };
    const isChrome = (rec) => {
      const c = rec.className || "";
      if (/uc-header|uc-menu|uc-popup|t-popup|uc-footer/.test(c)) return true;
      if (isFooter(rec)) return true;
      return false;
    };
    const clipOf = (el) => {
      const b = el.getBoundingClientRect();
      let left = b.left;
      let top = b.top;
      let right = b.right;
      let bottom = b.bottom;
      let node = el.parentElement;
      while (node && node !== document.documentElement) {
        const st = getComputedStyle(node);
        const clips = st.overflowX !== "visible" || st.overflowY !== "visible";
        if (clips) {
          const p = node.getBoundingClientRect();
          left = Math.max(left, p.left);
          top = Math.max(top, p.top);
          right = Math.min(right, p.right);
          bottom = Math.min(bottom, p.bottom);
        }
        node = node.parentElement;
      }
      return { left, top, right, bottom, width: right - left, height: bottom - top };
    };
    const bodyBg = getComputedStyle(document.body).backgroundColor;
    let footerTop = Infinity;
    for (const rec of document.querySelectorAll(".t-rec")) {
      if (!isFooter(rec)) continue;
      const art = rec.querySelector(".t396__artboard");
      const box = clipOf(art || rec);
      if (box.height > 8) footerTop = Math.min(footerTop, box.top + window.scrollY);
    }
    const secs = [];
    let pageBottom = 0;
    for (const rec of document.querySelectorAll(".t-rec")) {
      if (isChrome(rec)) continue;
      const art = rec.querySelector(".t396__artboard");
      if (!art) continue;
      const ar = clipOf(art);
      if (ar.width < 40 || ar.height < 8) continue;
      if (ar.left >= window.innerWidth - 8) continue;
      const top = Math.round(ar.top + window.scrollY);
      if (top >= footerTop - 2) continue;
      const height = Math.round(Math.min(ar.height, footerTop - top));
      const nodes = [];
      let i = 0;
      for (const el of rec.querySelectorAll(".tn-elem")) {
        const est = getComputedStyle(el);
        if (est.display === "none" || est.visibility === "hidden") continue;
        if (parseFloat(est.opacity) === 0) continue;
        const atom = el.querySelector(".tn-atom") || el;
        const ast = getComputedStyle(atom);
        const r = el.getBoundingClientRect();
        if (r.width < 1 || r.height < 1) continue;
        if (r.right < ar.left - 2 || r.left > ar.right + 2) continue;
        const zoom = parseFloat(el.style.zoom) || 1;
        const img = atom.querySelector("img");
        const video = atom.querySelector("video");
        const bg = ast.backgroundImage && ast.backgroundImage !== "none" ? ast.backgroundImage : "";
        let html = "";
        if (!img && !video) {
          html = atom.innerHTML.replace(/<script[\s\S]*?<\/script>/gi, "").trim();
          if (html === "&nbsp;" || html === " ") html = "";
        }
        const link = el.closest("a") || el.querySelector("a");
        nodes.push({
          x: Math.round((r.left - ar.left) * 100) / 100,
          y: Math.round((r.top - ar.top) * 100) / 100,
          w: Math.round(r.width * 100) / 100,
          h: Math.round(r.height * 100) / 100,
          z: i++,
          zoom,
          op: String(parseFloat(est.opacity) * parseFloat(ast.opacity)),
          color: ast.color,
          bg: ast.backgroundColor,
          bi: bg,
          bsize: ast.backgroundSize,
          bpos: ast.backgroundPosition,
          br: ast.borderRadius,
          border: ast.borderWidth === "0px" ? "" : `${ast.borderWidth} ${ast.borderStyle} ${ast.borderColor}`,
          shadow: ast.boxShadow === "none" ? "" : ast.boxShadow,
          ff: ast.fontFamily,
          fs: ast.fontSize,
          fw: ast.fontWeight,
          fst: ast.fontStyle,
          lh: ast.lineHeight,
          ls: ast.letterSpacing,
          ta: ast.textAlign,
          tt: ast.textTransform,
          td: ast.textDecorationLine,
          ws: ast.whiteSpace,
          pad: ast.padding,
          disp: ast.display,
          ai: ast.alignItems,
          jc: ast.justifyContent,
          va: ast.verticalAlign,
          of: ast.overflow,
          blend: ast.mixBlendMode,
          img: img ? img.currentSrc || img.src || img.getAttribute("data-original") || "" : "",
          fit: img ? ast.objectFit || getComputedStyle(img).objectFit : "",
          pos: img ? getComputedStyle(img).objectPosition : "",
          video: video ? video.currentSrc || video.src || "" : "",
          poster: video ? video.poster || "" : "",
          href: link ? link.getAttribute("href") || "" : "",
          html,
        });
      }
      secs.push({
        top,
        h: height,
        w: Math.round(ar.width),
        bg: getComputedStyle(art).backgroundColor,
        br: getComputedStyle(art).borderRadius,
        nodes,
      });
      pageBottom = Math.max(pageBottom, top + height);
    }
    return { bodyBg, h: pageBottom, secs };
  });
}

function rewriteHtml(html, mapHref) {
  return html.replace(/\s(?:href|src)="([^"]+)"/g, (all, url) => {
    const attr = all.startsWith(" href") || all.includes("href=") ? "href" : "src";
    if (attr === "src") return ` src="${url}"`;
    return ` href="${mapHref(url)}"`;
  });
}

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });

const discovered = await (async () => {
  await page.goto("https://neyroport.ru/about", { waitUntil: "domcontentloaded", timeout: 90000 });
  await page.waitForTimeout(1500);
  return page.evaluate(() =>
    [...document.querySelectorAll("a")]
      .map((a) => ({ t: (a.innerText || "").replace(/\s+/g, " ").trim().slice(0, 40), h: a.getAttribute("href") }))
      .filter((a) => a.h && /полез|заболев|обучен/i.test(a.t)),
  );
})();
console.log("discovered", JSON.stringify(discovered.slice(0, 20)));

const targets = only ? PAGES.filter((p) => p[0].includes(only) || p[1].includes(only)) : PAGES;

for (const [name, urlPath] of targets) {
  const url = "https://neyroport.ru" + urlPath;
  console.log(">>", name);
  const layouts = {};
  for (const [key, vw, vh] of [
    ["d", 1440, 900],
    ["m", 390, 844],
  ]) {
    await page.setViewportSize({ width: vw, height: vh });
    await page.goto(url, { waitUntil: "domcontentloaded", timeout: 90000 });
    await page.waitForTimeout(1200);
    await prep(page);
    layouts[key] = await extract(page);
    console.log("  ", key, "secs", layouts[key].secs.length, "h", layouts[key].h, "nodes", layouts[key].secs.reduce((s, r) => s + r.nodes.length, 0));
  }

  const walk = async (node) => {
    if (node.img) node.img = await localize(node.img);
    if (node.video) node.video = await localize(node.video);
    if (node.poster) node.poster = await localize(node.poster);
    if (node.bi && node.bi.includes("url(")) {
      const urls = [...node.bi.matchAll(/url\(["']?([^"')]+)/g)].map((m) => m[1]);
      let next = node.bi;
      for (const u of urls) {
        const local = await localize(u);
        next = next.replace(u, local);
      }
      node.bi = next;
    }
  };
  for (const key of ["d", "m"]) {
    for (const sec of layouts[key].secs) {
      for (const node of sec.nodes) await walk(node);
    }
  }

  const file = path.join(outDir, `${name}.json`);
  fs.writeFileSync(file, JSON.stringify(layouts));
  console.log("  wrote", file, fs.statSync(file).size);
}

await browser.close();
console.log("assets", fileMap.size);
