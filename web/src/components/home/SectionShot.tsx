"use client";

import type { CSSProperties, ReactNode } from "react";
import { Link } from "@/i18n/navigation";

type Hotspot = {
  href?: string;
  external?: boolean;
  onClick?: () => void;
  label: string;
  style: CSSProperties;
};

export function SectionShot({
  src,
  alt,
  width,
  height,
  className,
  hotspots = [],
  children,
}: {
  src: string;
  alt: string;
  width: number;
  height: number;
  className?: string;
  hotspots?: Hotspot[];
  children?: ReactNode;
}) {
  return (
    <section className={`np-shot${className ? ` ${className}` : ""}`}>
      <div className="np-shot__frame">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={src}
          alt={alt}
          width={width}
          height={height}
          className="np-shot__img"
          decoding="async"
          loading="eager"
          fetchPriority="high"
        />
        {hotspots.map((h) => {
          if (h.onClick) {
            return (
              <button
                key={h.label}
                type="button"
                className="np-shot__hot"
                style={h.style}
                aria-label={h.label}
                onClick={h.onClick}
              />
            );
          }
          if (h.external && h.href) {
            return (
              <a
                key={h.label}
                className="np-shot__hot"
                style={h.style}
                href={h.href}
                target={h.href.startsWith("http") ? "_blank" : undefined}
                rel={h.href.startsWith("http") ? "noreferrer" : undefined}
                aria-label={h.label}
              />
            );
          }
          return (
            <Link
              key={h.label}
              className="np-shot__hot"
              style={h.style}
              href={h.href || "/"}
              aria-label={h.label}
            />
          );
        })}
        {children}
      </div>
    </section>
  );
}
