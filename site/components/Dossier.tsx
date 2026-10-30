import type { ReactNode } from "react";

export function Stamp({ small = false, text = "In progress" }: { small?: boolean; text?: string }) {
  return (
    <span className={`stamp${small ? " small" : ""}`} aria-label={`Status: ${text}`}>
      <span>{text}</span>
      <span className="ar" lang="ar">قيد الإنجاز</span>
    </span>
  );
}

export type Field = { label: string; value: ReactNode; stamp?: boolean };

/** Page header styled as the top of an administrative form: title block plus labelled cells. */
export function Dossier({ eyebrow, title, arabic, lede, fields }: {
  eyebrow: string; title: string; arabic?: string; lede: ReactNode; fields: Field[];
}) {
  return (
    <header className="dossier">
      <div className="titles">
        <span className="label">{eyebrow}</span>
        <h1>{title}</h1>
        {arabic && <p className="ar-title" lang="ar" dir="rtl">{arabic}</p>}
        <p className="lede">{lede}</p>
      </div>
      <div className="formrow">
        {fields.map(f => (
          <div key={f.label} className={`cell${f.stamp ? " stampcell" : ""}`}>
            <span className="label">{f.label}</span>
            {f.stamp ? <div style={{ paddingTop: 6 }}><Stamp /></div> : <span className="val">{f.value}</span>}
          </div>
        ))}
      </div>
    </header>
  );
}

export function Section({ kicker, title, children, intro }: { kicker?: string; title: string; intro?: ReactNode; children: ReactNode }) {
  return (
    <section className="block">
      <div className="sec-title">
        <h2>{title}</h2>
        {kicker && <span className="label">{kicker}</span>}
      </div>
      {intro && <div className="prose">{intro}</div>}
      {children}
    </section>
  );
}

export function Figures({ items }: { items: { value: string; label: string; source?: { label: string; url: string }; color?: string }[] }) {
  return (
    <div className="figures">
      {items.map(f => (
        <div key={f.value + f.label} className="figure">
          <span className="value" style={{ color: f.color }}>{f.value}</span>
          <p>{f.label}</p>
          {f.source && <a href={f.source.url}>{f.source.label} ↗</a>}
        </div>
      ))}
    </div>
  );
}
