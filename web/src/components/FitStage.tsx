"use client";

import { useEffect, useRef } from "react";

const DESIGN = 1440;

function isPhone() {
  const coarse = window.matchMedia("(pointer: coarse)").matches;
  const shortSide = Math.min(window.screen.width, window.screen.height);
  return coarse && shortSide <= 900;
}

export function FitStage({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const stage = ref.current;
    if (!stage) return;
    const root = document.documentElement;
    let timer = 0;
    let lastW = 0;
    let lastH = 0;

    const apply = () => {
      if (isPhone()) {
        root.classList.remove("np-fit");
        stage.style.zoom = "";
        stage.style.width = "";
        root.style.removeProperty("--np-svh");
        return;
      }
      root.classList.add("np-fit");
      const w = root.clientWidth || window.innerWidth;
      const h = window.innerHeight;
      stage.style.width = `${DESIGN}px`;
      stage.style.zoom = String(w / DESIGN);
      root.style.setProperty("--np-svh", `${(h * DESIGN) / w}px`);
    };

    const snapBack = () => {
      const w = root.clientWidth;
      const h = window.innerHeight;
      if (w === lastW && h === lastH) return;
      window.clearTimeout(timer);
      timer = window.setTimeout(() => {
        timer = 0;
        apply();
        lastW = root.clientWidth;
        lastH = window.innerHeight;
      }, 1000);
    };

    apply();
    lastW = root.clientWidth;
    lastH = window.innerHeight;
    window.addEventListener("resize", snapBack);
    window.visualViewport?.addEventListener("resize", snapBack);
    const observer = new ResizeObserver(snapBack);
    observer.observe(root);
    return () => {
      window.removeEventListener("resize", snapBack);
      window.visualViewport?.removeEventListener("resize", snapBack);
      observer.disconnect();
      window.clearTimeout(timer);
    };
  }, []);

  return (
    <div className="np-stage" ref={ref}>
      {children}
    </div>
  );
}
