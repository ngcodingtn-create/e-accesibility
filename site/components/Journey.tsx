"use client";

import { useEffect, useRef, useState } from "react";

type Stage = { key: string; name: string; axis: string; color: string };

const STAGES: Stage[] = [
  { key: "ask", name: "Ask", axis: "03", color: "var(--text)" },
  { key: "normalize", name: "Normalize", axis: "03", color: "var(--text)" },
  { key: "route", name: "Route", axis: "02", color: "var(--llm)" },
  { key: "retrieve", name: "Retrieve", axis: "01", color: "var(--kb)" },
  { key: "answer", name: "Write + check", axis: "02", color: "var(--llm)" },
  { key: "deliver", name: "Deliver", axis: "03 · 04 · 05", color: "var(--speech)" },
];

const STEP_MS = 3200;

function Screen({ k }: { k: string }) {
  switch (k) {
    case "ask":
      return (
        <div className="j-screen">
          <span className="label">Citizen types, in Arabizi</span>
          <p className="j-big mono j-type">chnowa lazemni bech na3mel passeport?</p>
        </div>
      );
    case "normalize":
      return (
        <div className="j-screen">
          <span className="label">One spelling, one script</span>
          <p className="j-big j-strike mono">chnowa lazemni bech na3mel</p>
          <p className="j-big" lang="ar" dir="rtl">شنوّة لازمني باش نعمل <span lang="fr" dir="ltr">passeport</span>؟</p>
        </div>
      );
    case "route":
      return (
        <div className="j-screen">
          <span className="label">Which procedure?</span>
          <div className="j-bars">
            {[["Passport", 93], ["National ID card", 4], ["Birth certificate", 3]].map(([n, v], i) => (
              <div key={n as string} className="j-bar" style={{ ["--w" as string]: `${v}%`, ["--d" as string]: `${i * 120}ms` }}>
                <span>{n}</span><i /><b>{v}%</b>
              </div>
            ))}
          </div>
        </div>
      );
    case "retrieve":
      return (
        <div className="j-screen">
          <span className="label">Rules in force today, with sources</span>
          <div className="j-chips">
            {["Passport · documents", "Passport · fees", "Passport · where to apply"].map((c, i) => (
              <span key={c} className="j-chip" style={{ ["--d" as string]: `${i * 180}ms` }}>
                <b>[{i + 1}]</b> {c} <em>in force ✓</em>
              </span>
            ))}
          </div>
        </div>
      );
    case "answer":
      return (
        <div className="j-screen">
          <span className="label">Every sentence must cite a passage</span>
          <ol className="j-answer">
            {["Documents to bring", "Where to apply", "Fees and delay"].map((s, i) => (
              <li key={s} style={{ ["--d" as string]: `${i * 220}ms` }}><span>{s}</span><b>[{i + 1}] ✓</b></li>
            ))}
          </ol>
          <p className="j-note">No source? Ask back, or hand off to a human.</p>
        </div>
      );
    default:
      return (
        <div className="j-screen">
          <span className="label">Back in the citizen’s channel</span>
          <div className="j-out">
            <div style={{ ["--c" as string]: "var(--text)" }}><b>Text</b><span>steps + sources</span></div>
            <div style={{ ["--c" as string]: "var(--speech)" }}>
              <b>Voice</b>
              <span className="j-wave" aria-hidden>{Array.from({ length: 14 }, (_, i) => <i key={i} style={{ ["--d" as string]: `${i * 70}ms` }} />)}</span>
            </div>
            <div style={{ ["--c" as string]: "var(--sign)" }}><b>Sign</b><span>avatar + captions</span></div>
          </div>
        </div>
      );
  }
}

/** Step-through animation of one question moving through the pipeline. */
export default function Journey() {
  const [i, setI] = useState(0);
  const [playing, setPlaying] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Start playing the first time the widget is on screen, unless the viewer prefers less motion.
  useEffect(() => {
    const el = ref.current;
    if (!el || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setPlaying(true); io.disconnect(); } }, { threshold: 0.4 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (!playing) return;
    const t = setTimeout(() => setI(n => (n + 1) % STAGES.length), STEP_MS);
    return () => clearTimeout(t);
  }, [playing, i]);

  const go = (n: number) => { setPlaying(false); setI((n + STAGES.length) % STAGES.length); };
  const step = (d: number) => { setPlaying(false); setI(n => (n + d + STAGES.length) % STAGES.length); };
  const pct = (i / (STAGES.length - 1)) * 100;

  return (
    <div className="journey" ref={ref}>
      <div className="j-track" style={{ ["--p" as string]: `${pct}%` }}>
        <div className="j-rail"><div className="j-fill" /></div>
        {STAGES.map((s, n) => (
          <button
            key={s.key}
            className={`j-stop${n === i ? " on" : ""}${n < i ? " past" : ""}`}
            style={{ ["--c" as string]: s.color }}
            onClick={() => go(n)}
            aria-label={`Step ${n + 1}: ${s.name}`}
            aria-current={n === i ? "step" : undefined}
          >
            <span className="dot" />
            <span className="nm">{s.name}</span>
            <span className="ax">axis {s.axis}</span>
          </button>
        ))}
      </div>

      <div className="j-stage" style={{ ["--c" as string]: STAGES[i].color }} key={i} aria-live="polite">
        <Screen k={STAGES[i].key} />
      </div>

      <div className="j-controls">
        <button onClick={() => step(-1)} aria-label="Previous step">←</button>
        <button onClick={() => setPlaying(p => !p)} className="j-play">{playing ? "Pause" : "Play"}</button>
        <button onClick={() => step(1)} aria-label="Next step">→</button>
        <span className="label">Step {i + 1} / {STAGES.length} · illustrative</span>
      </div>
    </div>
  );
}
