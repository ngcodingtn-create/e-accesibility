import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AXES, axisBySlug } from "@/lib/content";
import { Dossier, Figures, Section } from "@/components/Dossier";
import { AxisDetail } from "@/components/AxisDetail";

export const dynamicParams = false;

export function generateStaticParams() {
  return AXES.map(a => ({ slug: a.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const a = axisBySlug(slug);
  return { title: a ? `${a.n} · ${a.name}` : "Axis" };
}

export default async function AxisPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const a = axisBySlug(slug);
  if (!a) notFound();
  const i = AXES.indexOf(a);
  const prev = AXES[i - 1], next = AXES[i + 1];

  return (
    <>
      <Dossier
        eyebrow={`Axis ${a.n} of 06`}
        title={a.name}
        arabic={a.arabic}
        lede={a.oneLine}
        fields={[
          { label: "Where it stands", value: a.stage },
          { label: "Status", value: null, stamp: true },
          { label: "Working docs", value: a.docs ? <a className="docs-link" href={a.docs.url}>{a.docs.label} ↗</a> : <span className="muted">Coming next</span> },
        ]}
      />

      <Section title="The problem">
        <p className="prose">{a.problem}</p>
      </Section>

      <AxisDetail slug={a.slug} />

      <Section title="Numbers that shaped it">
        <Figures items={a.facts.map(f => ({ ...f, color: a.color }))} />
      </Section>

      <Section title="Next steps">
        <ol className="steps">
          {a.next.map((s, k) => (<li key={s}><span className="k">{String(k + 1).padStart(2, "0")}</span><span>{s}</span></li>))}
        </ol>
      </Section>

      <nav className="pager" aria-label="Other axes">
        {prev ? <Link href={`/axes/${prev.slug}/`}><span className="label">← Axis {prev.n}</span>{prev.name}</Link> : <span />}
        {next ? <Link href={`/axes/${next.slug}/`} className="r"><span className="label">Axis {next.n} →</span>{next.name}</Link> : <Link href="/roadmap/" className="r"><span className="label">Next →</span>Roadmap &amp; decisions</Link>}
      </nav>
    </>
  );
}
