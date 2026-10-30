import Link from "next/link";

const ax = (slug: string) => `/axes/${slug}/`;

type Box = { t: string; s?: string; href: string; c: string };

const ASK: Box[] = [
  { t: "Text", s: "Arabic script or Arabizi", href: ax("text-channel"), c: "var(--text)" },
  { t: "Speech", s: "Spoken Derja + French", href: ax("speech"), c: "var(--speech)" },
  { t: "Sign language", s: "Camera video", href: ax("sign-language"), c: "var(--sign)" },
];
const UNDERSTAND: Box[] = [
  { t: "Arabizi normalizer", s: "One spelling, one script", href: ax("text-channel"), c: "var(--text)" },
  { t: "Speech recognition", s: "Fine-tuned Whisper", href: ax("speech"), c: "var(--speech)" },
  { t: "Sign recognition", s: "Keypoints → signs", href: ax("sign-language"), c: "var(--sign)" },
];
const RENDER: Box[] = [
  { t: "Accessible text", s: "Steps + sources, RTL", href: ax("text-channel"), c: "var(--text)" },
  { t: "Derja voice", s: "VoxCPM fine-tune", href: ax("speech"), c: "var(--speech)" },
  { t: "Signing avatar", s: "From recorded signs", href: ax("sign-language"), c: "var(--sign)" },
];

function Cell({ b }: { b: Box }) {
  return (
    <Link href={b.href} className="pnode" style={{ ["--c" as string]: b.c }}>
      <b>{b.t}</b>
      {b.s && <span>{b.s}</span>}
    </Link>
  );
}

/** The whole pipeline: knowledge base above, three channels through the LLM, loop below. */
export function PipelineMap() {
  return (
    <div className="scroll-x">
      <div className="pmap">
        <div className="pband" style={{ ["--c" as string]: "var(--kb)" }}>
          <Link href={ax("knowledge-base")} className="pband-title">01 · Knowledge base</Link>
          <div className="pchips">
            <span>Official pages &amp; texts</span><i>→</i><span>Parse &amp; chunk</span><i>→</i><span>Validity dates</span><i>→</i><span>Hybrid search</span>
          </div>
          <span className="pband-note">⇅ /retrieve</span>
        </div>
        <div className="pgrid">
          <span className="label">Citizen asks</span>
          <span className="label">Understand</span>
          <span className="label">Reason</span>
          <span className="label">Render</span>
          {ASK.map((b, i) => <div key={b.t} style={{ gridColumn: 1, gridRow: i + 2 }}><Cell b={b} /></div>)}
          {UNDERSTAND.map((b, i) => <div key={b.t} style={{ gridColumn: 2, gridRow: i + 2 }}><Cell b={b} /></div>)}
          <Link href={ax("derja-llm")} className="pllm" style={{ gridColumn: 3, gridRow: "2 / 5" }}>
            <span className="label" style={{ color: "inherit", opacity: .8 }}>02</span>
            <b>Derja LLM</b>
            <span>Routes the question, fetches the rules in force, writes numbered steps in Derja, checks every sentence against a cited rule.</span>
            <span className="pllm-out">Can’t prove it? Ask back or hand off to a human.</span>
          </Link>
          {RENDER.map((b, i) => <div key={b.t} style={{ gridColumn: 4, gridRow: i + 2 }}><Cell b={b} /></div>)}
        </div>
        <div className="pband" style={{ ["--c" as string]: "var(--loop)" }}>
          <Link href={ax("improvement-loop")} className="pband-title">06 · Improvement loop</Link>
          <div className="pchips">
            <span>Telemetry</span><span>Dashboards</span><span>Failure mining</span><span>Annotation</span><span>Retraining</span><span>Evaluation gate</span><span>Registry</span><span>Canary</span>
          </div>
        </div>
      </div>
    </div>
  );
}

/** Eight stages on an ellipse with arrows between them. */
export function LoopCycle() {
  const cx = 380, cy = 250, rx = 300, ry = 185;
  const names = ["Telemetry", "Dashboards", "Failure mining", "Annotation", "Retraining", "Evaluation gate", "Registry", "Canary deploy"];
  const pt = (deg: number) => {
    const r = (deg * Math.PI) / 180;
    return [cx + rx * Math.cos(r), cy + ry * Math.sin(r)];
  };
  return (
    <svg className="dia" viewBox="0 0 760 500" role="img" aria-label="Improvement loop: telemetry, dashboards, failure mining, annotation, retraining, evaluation gate, registry, canary deploy, then back to telemetry">
      <defs>
        <marker id="arr" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
          <path d="M0,0 L10,5 L0,10 z" fill="var(--ink-3)" />
        </marker>
      </defs>
      {names.map((_, k) => {
        const a0 = -90 + 45 * k + 15, a1 = -90 + 45 * (k + 1) - 15;
        const [x0, y0] = pt(a0), [x1, y1] = pt(a1);
        return <path key={k} d={`M${x0},${y0} A${rx},${ry} 0 0 1 ${x1},${y1}`} className="line" strokeWidth={1.5} markerEnd="url(#arr)" />;
      })}
      {names.map((n, k) => {
        const [x, y] = pt(-90 + 45 * k);
        const gate = n === "Evaluation gate";
        return (
          <g key={n}>
            <rect x={x - 82} y={y - 20} width={164} height={40} fill={gate ? "var(--ink)" : "var(--sheet)"} stroke={gate ? "var(--ink)" : "var(--rule)"} />
            <text x={x} y={y + 5} textAnchor="middle" style={{ fontSize: 15, fontWeight: 600, fill: gate ? "var(--sheet)" : "var(--ink)" }}>{n}</text>
          </g>
        );
      })}
      <circle r={7} className="loop-dot">
        <animateMotion dur="10s" repeatCount="indefinite" rotate="auto"
          path={`M${cx},${cy - ry} A${rx},${ry} 0 1 1 ${cx},${cy + ry} A${rx},${ry} 0 1 1 ${cx},${cy - ry}`} />
      </circle>
      <text x={cx} y={cy - 8} textAnchor="middle" style={{ fontFamily: "var(--cond)", fontSize: 24, fontWeight: 700 }}>Nothing ships unless</text>
      <text x={cx} y={cy + 22} textAnchor="middle" style={{ fontFamily: "var(--cond)", fontSize: 24, fontWeight: 700 }}>it beats the live model</text>
    </svg>
  );
}
