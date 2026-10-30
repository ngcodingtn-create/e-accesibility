import type { Metadata } from "next";
import { Dossier, Section } from "@/components/Dossier";
import { SOURCES, REPO } from "@/lib/content";

export const metadata: Metadata = { title: "Sources" };

export default function Sources() {
  return (
    <>
      <Dossier
        eyebrow="Sources"
        title="Where the numbers come from"
        arabic="المصادر"
        lede="Research reviewed on 30 October 2026. Where a model’s score is self-reported by its authors, the axis page says so; we re-measure everything on our own test sets before deciding."
        fields={[
          { label: "Areas reviewed", value: "6" },
          { label: "Detailed notes", value: <a className="docs-link" href={`${REPO}/tree/main/ai_docs`}>ai_docs ↗</a> },
        ]}
      />
      {SOURCES.map(g => (
        <Section key={g.axis} title={g.axis}>
          <ul className="steps">
            {g.items.map(s => (<li key={s.url}><span className="k">↗</span><a href={s.url}>{s.label}</a></li>))}
          </ul>
        </Section>
      ))}
    </>
  );
}
