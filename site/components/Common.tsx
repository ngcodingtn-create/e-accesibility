import Link from "next/link";
import { AXES, PHASES } from "@/lib/content";
import { Stamp } from "./Dossier";

/** Horizontal project timeline; the current phase is marked. */
export function Timeline() {
  return (
    <ol className="timeline">
      {PHASES.map(p => (
        <li key={p.name} className={p.state}>
          <span className="bar" aria-hidden />
          <span className="label">{p.state === "done" ? "Done" : p.state === "now" ? "We are here" : "Next"}</span>
          <b>{p.name}</b>
          <span className="small muted">{p.note}</span>
        </li>
      ))}
    </ol>
  );
}

/** Ledger of the six axes with owner, stage and a stamp. */
export function StatusBoard() {
  return (
    <div className="scroll-x sheet" style={{ padding: 0 }}>
      <table className="ledger">
        <thead>
          <tr><th>No.</th><th>Axis</th><th>Owner</th><th>Where it stands</th><th>Status</th></tr>
        </thead>
        <tbody>
          {AXES.map(a => (
            <tr key={a.slug}>
              <td className="num">{a.n}</td>
              <td><span className="swatch" style={{ ["--c" as string]: a.color }} /><Link href={`/axes/${a.slug}/`}>{a.name}</Link><div className="small muted">{a.oneLine}</div></td>
              <td>{a.owner}</td>
              <td>{a.stage}</td>
              <td><Stamp small /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

type Row = { label: string; sub?: string; from: number; to: number; color: string; text: string };

/** Bars on a shared 0..max scale; a bar with from > 0 is drawn as a range. */
export function RangeBars({ rows, max, ticks, unit = "", title }: { rows: Row[]; max: number; ticks: number[]; unit?: string; title: string }) {
  const W = 900, L = 280, R = 860, rowH = 58, top = 14;
  const x = (v: number) => L + ((R - L) * v) / max;
  const H = top + rows.length * rowH + 34;
  return (
    <svg className="dia" viewBox={`0 0 ${W} ${H}`} role="img" aria-label={title}>
      {ticks.map(t => (
        <g key={t}>
          <line x1={x(t)} x2={x(t)} y1={top - 4} y2={top + rows.length * rowH} stroke="var(--rule-2)" />
          <text x={x(t)} y={H - 10} textAnchor="middle" className="t-label">{t}{unit}</text>
        </g>
      ))}
      {rows.map((r, i) => {
        const y = top + i * rowH;
        const x0 = x(r.from), x1 = Math.max(x(r.to), x0 + 3);
        return (
          <g key={r.label}>
            <text x={0} y={y + 22} style={{ fontSize: 15, fontWeight: 600 }}>{r.label}</text>
            {r.sub && <text x={0} y={y + 41} className="t-muted" style={{ fontSize: 12.5 }}>{r.sub}</text>}
            <rect x={L} y={y + 12} width={R - L} height={22} fill="var(--field)" />
            <rect x={x0} y={y + 12} width={x1 - x0} height={22} fill={r.color} />
            <text x={Math.min(x1 + 8, R - 4)} y={y + 28} textAnchor={x1 + 8 > R - 60 ? "end" : "start"} style={{ fontSize: 14, fontWeight: 600, fill: x1 + 8 > R - 60 ? "var(--sheet)" : "var(--ink)" }}>{r.text}</text>
          </g>
        );
      })}
    </svg>
  );
}

/** A left-to-right chain of boxes; collapses to a column on phones. */
export function Flow({ nodes, color }: { nodes: { t: string; s?: string; solid?: boolean; c?: string }[]; color: string }) {
  return (
    <div className="flow">
      {nodes.map((n, i) => (
        <div key={n.t} style={{ display: "contents" }}>
          <div className={`node${n.solid ? " solid" : ""}`} style={{ ["--c" as string]: n.c ?? color }}>
            <b>{n.t}</b>
            {n.s && <span>{n.s}</span>}
          </div>
          {i < nodes.length - 1 && <div className="arrow" aria-hidden>→</div>}
        </div>
      ))}
    </div>
  );
}
