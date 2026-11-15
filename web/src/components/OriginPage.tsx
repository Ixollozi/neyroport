"use client";

import { useEffect, useRef } from "react";
import { useLocale } from "next-intl";
import { useLead } from "@/components/LeadModal";

type OriginNode = {
  x: number;
  y: number;
  w: number;
  h: number;
  z: number;
  zoom: number;
  op: string;
  color: string;
  bg: string;
  bi: string;
  bsize: string;
  bpos: string;
  br: string;
  border: string;
  shadow: string;
  ff: string;
  fs: string;
  fw: string;
  fst: string;
  lh: string;
  ls: string;
  ta: string;
  tt: string;
  td: string;
  ws: string;
  pad: string;
  disp: string;
  ai: string;
  jc: string;
  of: string;
  blend: string;
  img: string;
  fit: string;
  pos: string;
  video: string;
  poster: string;
  href: string;
  html: string;
};

type OriginSection = {
  top: number;
  h: number;
  w: number;
  bg: string;
  br: string;
  nodes: OriginNode[];
};

export type OriginLayouts = {
  d: { bodyBg: string; h: number; secs: OriginSection[] };
  m: { bodyBg: string; h: number; secs: OriginSection[] };
};

const ROUTES: Record<string, string> = {
  "/": "/",
  "/about": "/about",
  "/about_tlns": "/about-tlns",
  "/reviews": "/reviews",
  "/faq": "/faq",
  "/contacts": "/contacts",
  "/rent": "/rent",
  "/medical_institutions": "/institutions",
  "/news": "/news",
  "/training_meth": "/useful",
  "/privacy": "/privacy",
  "/terms_of_use": "/terms",
  "/account_details": "/requisites",
  "/insult": "/insult",
  "/vestibulyarnie_narusheniya": "/vestibulyarnie-narusheniya",
  "/dtsp-u-detej-vzroslyih": "/dtsp",
  "/demieliniziruyushchie-zabolevaniya": "/demieliniziruyushchie-zabolevaniya",
  "/degenerativnye-zabolevaniya": "/degenerativnye-zabolevaniya",
  "/zaderzka_razvitia": "/rechevye-rasstroystva",
  "/sdvg": "/sdvg",
  "/insomniya": "/insomniya",
  "/brain_aging": "/demieliniziruyushchie-zabolevaniya",
  "/brain_injury": "/degenerativnye-zabolevaniya",
};

function scalePx(value: string, z: number) {
  if (!value || z === 1) return value;
  return value.replace(/(-?\d*\.?\d+)px/g, (_, n) => {
    const v = Math.round(parseFloat(n) * z * 100) / 100;
    return `${v}px`;
  });
}

function mapHref(href: string, locale: string) {
  if (!href) return "";
  if (href.startsWith("#")) return href;
  if (/^(tel:|mailto:)/.test(href)) return href;
  if (/popup/i.test(href)) return "#lead";
  let path = href;
  if (/^https?:/.test(href)) {
    try {
      const u = new URL(href);
      if (!u.hostname.endsWith("neyroport.ru")) return href;
      path = u.pathname + u.search + u.hash;
    } catch {
      return href;
    }
  }
  const hash = path.includes("#") ? path.slice(path.indexOf("#")) : "";
  const clean = (path.split("#")[0].split("?")[0].replace(/\/$/, "") || "/");
  const dest = ROUTES[clean];
  if (dest) return `/${locale}${dest}${hash}`;
  if (path.startsWith("/")) return `/${locale}${clean}${hash}`;
  return href;
}

function rewriteHtml(html: string, locale: string) {
  const clean = html
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<script[\s\S]*?<\/script>/gi, "");
  return clean.replace(/href="([^"]*)"/g, (_, href) => `href="${mapHref(href, locale)}"`);
}

function NodeView({ node, locale, onLead }: { node: OriginNode; locale: string; onLead: () => void }) {
  const z = node.zoom || 1;
  const href = mapHref(node.href, locale);
  const lead = href === "#lead";
  const style: React.CSSProperties = {
    position: "absolute",
    left: node.x,
    top: node.y,
    width: node.w,
    height: node.h,
    zIndex: node.z,
    opacity: Number(node.op) || 1,
    color: node.color,
    backgroundColor: node.bg,
    backgroundImage: node.bi || undefined,
    backgroundSize: node.bsize === "auto" ? undefined : scalePx(node.bsize, z),
    backgroundPosition: node.bpos,
    backgroundRepeat: "no-repeat",
    borderRadius: scalePx(node.br, z),
    border: node.border ? scalePx(node.border, z) : undefined,
    boxShadow: node.shadow ? scalePx(node.shadow, z) : undefined,
    fontFamily: /Inter/i.test(node.ff)
      ? "var(--font-inter), Inter, Arial, sans-serif"
      : node.ff,
    fontSize: scalePx(node.fs, z),
    fontWeight: node.fw,
    fontStyle: node.fst,
    lineHeight: node.lh === "normal" ? "normal" : scalePx(node.lh, z),
    letterSpacing: node.ls === "normal" ? "normal" : scalePx(node.ls, z),
    textAlign: node.ta as React.CSSProperties["textAlign"],
    textTransform: node.tt as React.CSSProperties["textTransform"],
    textDecoration: node.td,
    whiteSpace: node.ws as React.CSSProperties["whiteSpace"],
    padding: scalePx(node.pad, z),
    display: node.disp,
    alignItems: node.ai,
    justifyContent: node.jc,
    boxSizing: "border-box",
    overflow: node.of,
    mixBlendMode: node.blend === "normal" ? undefined : (node.blend as React.CSSProperties["mixBlendMode"]),
  };
  const inner = (
    <>
      {node.img ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={node.img} alt="" style={{ objectFit: (node.fit || "cover") as React.CSSProperties["objectFit"], objectPosition: node.pos || "center" }} />
      ) : null}
      {node.video ? (
        <video src={node.video} poster={node.poster || undefined} autoPlay muted loop playsInline />
      ) : null}
      {node.html ? <span dangerouslySetInnerHTML={{ __html: rewriteHtml(node.html, locale) }} /> : null}
    </>
  );
  if (href && !lead) {
    return (
      <a className="np-origin__el" href={href} style={style}>
        {inner}
      </a>
    );
  }
  if (lead) {
    return (
      <button type="button" className="np-origin__el" style={style} onClick={onLead}>
        {inner}
      </button>
    );
  }
  return (
    <div className="np-origin__el" style={style}>
      {inner}
    </div>
  );
}

function Layout({
  layout,
  mode,
  locale,
  onLead,
}: {
  layout: OriginLayouts["d"];
  mode: "d" | "m";
  locale: string;
  onLead: () => void;
}) {
  return (
    <div
      className={`np-origin np-origin--${mode}`}
      style={{ height: layout.h, background: layout.bodyBg }}
    >
      {layout.secs.map((sec, i) => (
        <section
          key={i}
          className="np-origin__sec"
          style={{
            top: sec.top,
            height: sec.h,
            width: sec.w,
            background: sec.bg,
            borderRadius: sec.br,
          }}
        >
          {sec.nodes.map((node, j) => (
            <NodeView key={j} node={node} locale={locale} onLead={onLead} />
          ))}
        </section>
      ))}
    </div>
  );
}

export function OriginPage({ data, bare = false }: { data: OriginLayouts; bare?: boolean }) {
  const locale = useLocale();
  const { openLead } = useLead();
  const mobile = useRef<HTMLDivElement>(null);

  useEffect(() => {
    document.body.classList.toggle("np-article", bare);
    const el = mobile.current;
    if (!el) return;
    const apply = () => {
      const phone = !document.documentElement.classList.contains("np-fit");
      if (!phone) {
        el.style.zoom = "";
        return;
      }
      const w = document.documentElement.clientWidth || window.innerWidth;
      el.style.zoom = String(w / 390);
    };
    apply();
    window.addEventListener("resize", apply);
    const obs = new MutationObserver(apply);
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    return () => {
      document.body.classList.remove("np-article");
      window.removeEventListener("resize", apply);
      obs.disconnect();
    };
  }, [bare]);

  return (
    <>
      <Layout layout={data.d} mode="d" locale={locale} onLead={openLead} />
      <div className="np-origin-mobile">
        <div ref={mobile}>
          <Layout layout={data.m} mode="m" locale={locale} onLead={openLead} />
        </div>
      </div>
    </>
  );
}
