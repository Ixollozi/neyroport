"use client";

import { useEffect } from "react";

export type PageBand = {
  file: string;
  width: number;
  height: number;
};

/**
 * Full-page / band stack from origin captures.
 * Enables `body.np-shot-mode` → hides live SiteHeader/SiteFooter while PNGs
 * still include baked chrome (Strategy B). Do NOT show live nav on top of
 * screenshots that already contain the menu (double-header bug).
 */
export function PageShot({
  bands,
  className,
}: {
  bands: PageBand[];
  className?: string;
}) {
  useEffect(() => {
    document.body.classList.add("np-shot-mode");
    return () => document.body.classList.remove("np-shot-mode");
  }, []);

  if (!bands?.length) return null;
  return (
    <div className={`np-page-shot${className ? ` ${className}` : ""}`}>
      {bands.map((b, i) => (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          key={b.file}
          src={b.file}
          alt=""
          width={b.width}
          height={b.height}
          className="np-page-shot__band"
          decoding="async"
          loading={i < 2 ? "eager" : "lazy"}
        />
      ))}
    </div>
  );
}
