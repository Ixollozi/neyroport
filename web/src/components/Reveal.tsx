"use client";

import type { ReactNode } from "react";

/** Origin has no scroll-reveal; passthrough for layout only. */
export function Reveal({
  children,
  className,
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) {
  return <div className={className}>{children}</div>;
}