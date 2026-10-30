import { Dossier, Section } from "@/components/Dossier";
import { PipelineMap } from "@/components/Maps";
import Journey from "@/components/Journey";
import { BeforeAfter, ProgressMatrix, Evidence, EvalPlan, RiskMap, Gantt } from "@/components/Review";

export default function Overview() {
  return (
    <>
      <Dossier
        eyebrow="Progress review · 30 October 2026"
        title="Tunisian procedures, explained in Derja"
        arabic="الإجراءات الإدارية، بالدارجة التونسية"
        lede="Ask by typing, speaking or signing. Get the official steps, with their source."
        fields={[
          { label: "Team", value: "Ayhem · Belhaj · Med Amine" },
          { label: "Workstreams", value: "6, in parallel" },
          { label: "Phase", value: "First prototypes" },
          { label: "Status", value: null, stamp: true },
        ]}
      />

      <Section kicker="1 · Why" title="The problem">
        <BeforeAfter />
      </Section>

      <Section kicker="2 · What" title="The system">
        <PipelineMap />
      </Section>

      <Section kicker="3 · How" title="Follow one question">
        <Journey />
      </Section>

      <Section kicker="4 · Where we are" title="Progress by workstream">
        <ProgressMatrix />
      </Section>

      <Section kicker="5 · Proof" title="What already exists">
        <Evidence />
      </Section>

      <Section kicker="6 · How we will know" title="Evaluation plan">
        <EvalPlan />
      </Section>

      <Section kicker="7 · What could go wrong" title="Risks">
        <RiskMap />
      </Section>

      <Section kicker="8 · Next" title="Plan to the final review">
        <Gantt />
      </Section>
    </>
  );
}
