import type { Metadata } from "next";
import { Dossier, Section } from "@/components/Dossier";
import { Timeline } from "@/components/Common";
import { DECISIONS, RISKS } from "@/lib/content";

export const metadata: Metadata = { title: "Roadmap & decisions" };

export default function Roadmap() {
  return (
    <>
      <Dossier
        eyebrow="Plan"
        title="Roadmap and decisions"
        arabic="خارطة الطريق والقرارات"
        lede="Build the text path first, because speech and sign only deliver an answer; then add speech, the improvement loop, and the sign channel. Each phase ends in a demo."
        fields={[
          { label: "Next milestone", value: "A typed question answered with its source" },
          { label: "Decisions logged", value: String(DECISIONS.length) },
          { label: "Status", value: null, stamp: true },
        ]}
      />

      <Section title="Phases">
        <Timeline />
      </Section>

      <Section title="Decisions, and the evidence behind them">
        <div className="scroll-x sheet" style={{ padding: 0 }}>
          <table className="ledger">
            <thead><tr><th>No.</th><th>Decision</th><th>Why</th><th>Affects</th></tr></thead>
            <tbody>
              {DECISIONS.map((d, k) => (
                <tr key={d.d}><td className="num">D{k + 1}</td><td><b>{d.d}</b></td><td className="muted">{d.why}</td><td>{d.who}</td></tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      <Section title="Risks and what we do about them">
        <div className="scroll-x sheet" style={{ padding: 0 }}>
          <table className="ledger">
            <thead><tr><th>Risk</th><th>Response</th></tr></thead>
            <tbody>
              {RISKS.map(r => (<tr key={r.t}><td><b>{r.t}</b></td><td className="muted">{r.m}</td></tr>))}
            </tbody>
          </table>
        </div>
      </Section>
    </>
  );
}
