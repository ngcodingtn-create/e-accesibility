"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { AXES, REPO } from "@/lib/content";

const PAGES = [
  { href: "/", num: "—", short: "Ov", label: "Overview" },
  { href: "/architecture/", num: "—", short: "Ar", label: "Architecture" },
];
const AFTER = [
  { href: "/roadmap/", num: "—", short: "Rd", label: "Roadmap & decisions" },
  { href: "/sources/", num: "—", short: "Src", label: "Sources" },
];
const KEY = "sidebar-collapsed";

export default function Sidebar() {
  const path = usePathname();
  const [open, setOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const current = (href: string) => (path === href || path === href.replace(/\/$/, "") ? "page" : undefined);

  // The inline script in the layout applies the saved choice before first paint; mirror it here.
  useEffect(() => {
    setCollapsed(document.documentElement.dataset.sidebar === "collapsed");
  }, []);

  const toggleCollapsed = () => {
    const next = !collapsed;
    setCollapsed(next);
    document.documentElement.dataset.sidebar = next ? "collapsed" : "expanded";
    try { localStorage.setItem(KEY, next ? "1" : "0"); } catch {}
  };

  const item = (href: string, num: string, short: string, label: string, own?: string) => (
    <Link key={href} href={href} aria-current={current(href)} onClick={() => setOpen(false)} title={collapsed ? label : undefined}>
      <span className="num" data-short={short}>{num}</span>
      <span className="txt">{label}</span>
      <span className="own">{own}</span>
    </Link>
  );

  return (
    <aside className="sidebar" data-open={open}>
      <div className="top-row">
        <Link href="/" className="brand" onClick={() => setOpen(false)} title={collapsed ? "Derja e-Access" : undefined}>
          <span className="name">Derja e-Access</span>
          <span className="mark" aria-hidden>DE</span>
          <span className="ar" lang="ar" dir="rtl">النفاذ الرقمي للخدمات الإدارية</span>
          <span className="sub">Student project · 2026</span>
        </Link>
        <button className="menu-btn" aria-expanded={open} onClick={() => setOpen(o => !o)}>
          {open ? "Close" : "Menu"}
        </button>
        <button
          className="collapse-btn"
          aria-expanded={!collapsed}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          onClick={toggleCollapsed}
        >
          <span aria-hidden>{collapsed ? "»" : "«"}</span>
        </button>
      </div>

      <nav className="nav" aria-label="Site">
        {PAGES.map(p => item(p.href, p.num, p.short, p.label))}
        <div className="group label">Axes of work</div>
        {AXES.map(a => item(`/axes/${a.slug}/`, a.n, a.n, a.name))}
        <div className="group label">Plan</div>
        {AFTER.map(p => item(p.href, p.num, p.short, p.label))}
      </nav>

      <div className="side-foot">
        <span>Status as of 30 October 2026</span>
        <a href={REPO}>GitHub repository</a>
        <a href={`${REPO}/tree/main/ai_docs`}>Agent docs (ai_docs)</a>
      </div>
    </aside>
  );
}
