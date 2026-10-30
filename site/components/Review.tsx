import Link from "next/link";
import { REPO } from "@/lib/content";

/* ---------- Before / after ---------- */
export function BeforeAfter() {
  return (
    <div className="ba">
      <div className="ba-row">
        <span className="ba-tag">Today</span>
        <div className="ba-steps">
          <span>Search several portals</span><i>→</i>
          <span>Formal Arabic or French</span><i>→</i>
          <span>PDFs, some outdated</span><i>→</i>
          <span className="bad">Visit the office to ask</span>
        </div>
      </div>
      <div className="ba-row good">
        <span className="ba-tag">With the assistant</span>
        <div className="ba-steps">
          <span>Ask in Derja: type, speak or sign</span><i>→</i>
          <span className="ok">Steps in Derja + the official source</span>
        </div>
      </div>
    </div>
  );
}

/* ---------- Progress matrix ---------- */
type S = "done" | "now" | "next";
const COLS = ["Research", "Design", "Data", "Prototype", "Evaluated"];
const ROWS: { name: string; slug: string; owner: string; cells: [S, string][] }[] = [
  { name: "Knowledge base", slug: "knowledge-base", owner: "Belhaj", cells: [["done", ""], ["done", "API contract"], ["now", "3 procedure pages"], ["now", "agent building /retrieve"], ["next", "Hit@1, MRR"]] },
  { name: "Derja LLM", slug: "derja-llm", owner: "Med Amine", cells: [["done", ""], ["done", "route · cite · hand off"], ["next", "grounded examples"], ["now", "text spine"], ["next", "faithfulness"]] },
  { name: "Text channel", slug: "text-channel", owner: "Med Amine", cells: [["done", ""], ["done", "one spelling convention"], ["now", "TArC corpus"], ["now", "normalizer"], ["next", "CER"]] },
  { name: "Speech · voice", slug: "speech", owner: "Ayhem", cells: [["done", ""], ["done", ""], ["done", "4,730 clips · 8.5 h"], ["done", "model published"], ["now", "listening test"]] },
  { name: "Speech · recognition", slug: "speech", owner: "Med Amine", cells: [["done", ""], ["done", ""], ["now", "≈ 106 h identified"], ["next", "Whisper fine-tune"], ["next", "WER"]] },
  { name: "Sign language", slug: "sign-language", owner: "Med Amine", cells: [["done", ""], ["done", "60–100 signs scope"], ["now", "Deaf partners"], ["next", "sign classifier"], ["next", "comprehension"]] },
  { name: "Improvement loop", slug: "improvement-loop", owner: "Med Amine", cells: [["done", ""], ["done", "gate rules"], ["next", "logged turns"], ["now", "eval gate in CI"], ["next", "—"]] },
];

export function ProgressMatrix() {
  return (
    <div className="scroll-x" style={{ display: "grid", gap: 14 }}>
      <div className="pm" role="table" aria-label="Progress by workstream and stage">
        <span className="h" />
        {COLS.map(c => <span key={c} className="h">{c}</span>)}
        {ROWS.map(r => (
          <div key={r.name} style={{ display: "contents" }} role="row">
            <div className="row"><Link href={`/axes/${r.slug}/`}>{r.name}</Link><span>{r.owner}</span></div>
            {r.cells.map(([s, note], k) => (
              <div key={k} className={`cell ${s}`} role="cell" aria-label={`${COLS[k]}: ${s === "done" ? "done" : s === "now" ? "in progress" : "not started"}${note ? `, ${note}` : ""}`}>
                {s === "done" && !note ? "✓" : note}
              </div>
            ))}
          </div>
        ))}
      </div>
      <div className="pm-legend">
        <span className="done"><i />Done</span>
        <span className="now"><i />In progress</span>
        <span><i />Not started</span>
      </div>
    </div>
  );
}

/* ---------- Evidence ---------- */
const EVIDENCE = [
  { n: "2.29 B", what: "Derja voice model, published", where: "huggingface.co/Code-Quasar/voxcpm-tn", url: "https://huggingface.co/Code-Quasar/voxcpm-tn", who: "Ayhem" },
  { n: "8.5 h", what: "Tunisian speech dataset, 4,730 clips", where: "huggingface.co/datasets/Code-Quasar/Tn-TTS", url: "https://huggingface.co/datasets/Code-Quasar/Tn-TTS", who: "Ayhem" },
  { n: "2", what: "API contracts agreed between axes", where: "ai_docs/rag/API.md · ai_docs/tts/API.md", url: `${REPO}/tree/main/ai_docs`, who: "Team" },
  { n: "4", what: "Parallel coding agents briefed for the RAG prototype", where: "ai_docs/rag/PLAN.md", url: `${REPO}/blob/main/ai_docs/rag/PLAN.md`, who: "Belhaj" },
  { n: "6", what: "Research areas reviewed, with sources", where: "/sources", url: "/sources/", who: "Team" },
  { n: "1", what: "Public repository with automatic site deploy", where: "github.com/ngcodingtn-create/e-accesibility", url: REPO, who: "Med Amine" },
];

export function Evidence() {
  return (
    <div className="evidence">
      {EVIDENCE.map(e => {
        const inner = (<><span className="who">{e.who}</span><span className="n">{e.n}</span><span className="what">{e.what}</span><span className="where">{e.where} ↗</span></>);
        return e.url.startsWith("/")
          ? <Link key={e.what} href={e.url} className="ev">{inner}</Link>
          : <a key={e.what} href={e.url} className="ev">{inner}</a>;
      })}
    </div>
  );
}

/* ---------- Evaluation plan ---------- */
const EVAL: [string, string, string, string][] = [
  ["Knowledge base", "Hit@1 on the gold question set", "≥ 80%", "first run pending"],
  ["Derja LLM", "Sentences backed by a cited passage", "100% shipped", "not measured yet"],
  ["Text channel", "Character error rate, Arabizi → Arabic", "≤ 10%", "not measured yet"],
  ["Speech · voice", "Round-trip error vs. real speech · listening score", "≤ 1.5× · ≥ 3.5 / 5", "not measured yet"],
  ["Speech · recognition", "Word error rate on Tunisian test speech", "≤ 25%", "not measured yet"],
  ["Sign language", "Top-1 accuracy on signers not seen in training", "≥ 70%", "not measured yet"],
  ["Whole system", "Task success on scripted procedures", "≥ 80%", "not measured yet"],
];

export function EvalPlan() {
  return (
    <div className="scroll-x sheet" style={{ padding: 0 }}>
      <table className="ledger">
        <thead><tr><th>Axis</th><th>Metric</th><th>Our target</th><th>Now</th></tr></thead>
        <tbody>
          {EVAL.map(([a, m, t, now]) => (
            <tr key={a}><td><b>{a}</b></td><td className="muted">{m}</td><td className="mono">{t}</td><td><span className="pending">{now}</span></td></tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ---------- Risk heatmap ---------- */
const RISKS = [
  { id: "R1", t: "No public Tunisian Sign Language data", l: 5, i: 4, m: "Record 60–100 signs with Deaf partners" },
  { id: "R2", t: "Three people, seven workstreams", l: 4, i: 4, m: "Text spine first; reuse open models" },
  { id: "R3", t: "The LLM invents a rule", l: 3, i: 5, m: "Citation check + human handoff" },
  { id: "R4", t: "Legal portals hard to reach", l: 4, i: 3, m: "Pages saved by hand; OCR later" },
  { id: "R5", t: "Voice and face are personal data", l: 2, i: 5, m: "Consent, keypoints only, host in Tunisia" },
  { id: "R6", t: "Benchmarks are self-reported", l: 3, i: 2, m: "Re-measure on our own test sets" },
];

export function RiskMap() {
  const band = (s: number) => (s >= 15 ? "red" : s >= 7 ? "amber" : "green");
  return (
    <div className="risk">
      <div className="risk-grid-wrap">
        <span className="risk-y label">Likelihood →</span>
        <div className="risk-grid" role="img" aria-label="Risk heatmap: likelihood by impact, with six risks placed">
          {[5, 4, 3, 2, 1].map(l => [1, 2, 3, 4, 5].map(i => (
            <div key={`${l}-${i}`} className={`rc ${band(l * i)}`}>
              {RISKS.filter(r => r.l === l && r.i === i).map(r => <span key={r.id} className="rdot">{r.id}</span>)}
            </div>
          )))}
        </div>
        <span className="risk-x label">Impact →</span>
      </div>
      <ol className="risk-list">
        {RISKS.map(r => (
          <li key={r.id}>
            <span className={`rdot ${band(r.l * r.i)}`}>{r.id}</span>
            <div><b>{r.t}</b><span>{r.m}</span></div>
          </li>
        ))}
      </ol>
      <p className="small muted" style={{ gridColumn: "1 / -1" }}>Team estimate, scored likelihood × impact (red ≥ 15, amber 7–14, green ≤ 6).</p>
    </div>
  );
}

/* ---------- Gantt ---------- */
const MONTHS = ["Sep", "Oct", "Nov", "Dec", "Jan", "Feb", "Mar", "Apr", "May", "Jun"];
const TASKS: { t: string; from: number; to: number; s: S; c: string }[] = [
  { t: "Research", from: 0, to: 1.9, s: "done", c: "var(--ink)" },
  { t: "Architecture + contracts", from: 1.2, to: 2, s: "done", c: "var(--ink)" },
  { t: "Voice model (VoxCPM)", from: 0.5, to: 2.6, s: "now", c: "var(--speech)" },
  { t: "Knowledge base prototype", from: 1.9, to: 3, s: "now", c: "var(--kb)" },
  { t: "Text spine: LLM + normalizer", from: 2, to: 4, s: "now", c: "var(--llm)" },
  { t: "Speech recognition", from: 3, to: 5.5, s: "next", c: "var(--speech)" },
  { t: "Improvement loop", from: 4, to: 6.5, s: "next", c: "var(--loop)" },
  { t: "Sign channel", from: 4.5, to: 8, s: "next", c: "var(--sign)" },
  { t: "Evaluation + report", from: 7, to: 10, s: "next", c: "var(--ink-3)" },
];
const TODAY = 1 + 30 / 31; // 30 October

export function Gantt() {
  const W = 960, L = 230, R = 950, top = 34, rowH = 34;
  const x = (m: number) => L + ((R - L) * m) / MONTHS.length;
  const H = top + TASKS.length * rowH + 30;
  return (
    <div className="sheet scroll-x">
      <svg className="dia" viewBox={`0 0 ${W} ${H}`} style={{ minWidth: 720 }} role="img" aria-label="Indicative plan from September 2026 to June 2027, with today marked on 30 October">
        {MONTHS.map((m, k) => (
          <g key={m}>
            <rect x={x(k)} y={top - 6} width={x(k + 1) - x(k)} height={TASKS.length * rowH + 8} fill={k % 2 ? "var(--paper)" : "transparent"} />
            <text x={(x(k) + x(k + 1)) / 2} y={18} textAnchor="middle" className="t-label">{m}</text>
          </g>
        ))}
        {TASKS.map((t, k) => {
          const y = top + k * rowH;
          return (
            <g key={t.t}>
              <text x={0} y={y + 19} style={{ fontSize: 15.5, fontWeight: t.s === "next" ? 400 : 600 }}>{t.t}</text>
              <rect x={x(t.from)} y={y + 5} width={x(t.to) - x(t.from)} height={18}
                fill={t.s === "next" ? "var(--sheet)" : t.c} stroke={t.c} strokeWidth={1.5} strokeDasharray={t.s === "next" ? "4 3" : undefined} />
            </g>
          );
        })}
        <line x1={x(TODAY)} x2={x(TODAY)} y1={top - 6} y2={H - 22} stroke="var(--flag)" strokeWidth={2} />
        <text x={x(TODAY)} y={H - 6} textAnchor="middle" style={{ fontSize: 13, fontWeight: 600, fill: "var(--flag)" }}>Today · 30 Oct</text>
      </svg>
      <p className="small muted" style={{ marginTop: 8 }}>Indicative plan; solid = done or in progress, dashed = planned. Final review date to confirm.</p>
    </div>
  );
}
