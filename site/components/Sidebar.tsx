"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { AXES, REPO } from "@/lib/content";

const PAGES = [
  { href: "/", num: "—", label: "Overview" },
  { href: "/architecture/", num: "—", label: "Architecture" },
];
const AFTER = [
  { href: "/roadmap/", num: "—", label: "Roadmap & decisions" },
  { href: "/sources/", num: "—", label: "Sources" },
];

export default function Sidebar() {
  const path = usePathname();
  const [open, setOpen] = useState(false);
  const current = (href: string) => (path === href || path === href.replace(/\/$/, "") ? "page" : undefined);

  return (
    <aside className="sidebar" data-open={open}>
      <div className="top-row">
        <Link href="/" className="brand" onClick={() => setOpen(false)}>
          <span className="name">Derja e-Access</span>
          <span className="ar" lang="ar" dir="rtl">النفاذ الرقمي للخدمات الإدارية</span>
          <span className="sub">Student project · 2026</span>
        </Link>
        <button className="menu-btn" aria-expanded={open} onClick={() => setOpen(o => !o)}>
          {open ? "Close" : "Menu"}
        </button>
      </div>

      <nav className="nav" aria-label="Site">
        {PAGES.map(p => (
          <Link key={p.href} href={p.href} aria-current={current(p.href)} onClick={() => setOpen(false)}>
            <span className="num">{p.num}</span><span>{p.label}</span><span />
          </Link>
        ))}
        <div className="group label">Axes of work</div>
        {AXES.map(a => {
          const href = `/axes/${a.slug}/`;
          return (
            <Link key={a.slug} href={href} aria-current={current(href)} onClick={() => setOpen(false)}>
              <span className="num">{a.n}</span>
              <span>{a.name}</span>
              <span className="own">{a.owner.split(" · ")[0]}</span>
            </Link>
          );
        })}
        <div className="group label">Plan</div>
        {AFTER.map(p => (
          <Link key={p.href} href={p.href} aria-current={current(p.href)} onClick={() => setOpen(false)}>
            <span className="num">{p.num}</span><span>{p.label}</span><span />
          </Link>
        ))}
      </nav>

      <div className="side-foot">
        <span>Status as of 30 October 2026</span>
        <a href={REPO}>GitHub repository</a>
        <a href={`${REPO}/tree/main/ai_docs`}>Agent docs (ai_docs)</a>
      </div>
    </aside>
  );
}
