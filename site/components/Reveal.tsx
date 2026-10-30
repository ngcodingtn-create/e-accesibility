"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

/** Adds `.in` to [data-reveal] elements as they scroll into view. Without JS, everything stays visible. */
export default function Reveal() {
  const path = usePathname();
  useEffect(() => {
    const root = document.documentElement;
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    root.classList.add("reveal-ready");
    const io = new IntersectionObserver(entries => {
      for (const e of entries) if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); }
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.12 });
    document.querySelectorAll("[data-reveal]:not(.in)").forEach(el => io.observe(el));
    return () => io.disconnect();
  }, [path]);
  return null;
}
