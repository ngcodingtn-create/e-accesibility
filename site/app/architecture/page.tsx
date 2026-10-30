import type { Metadata } from "next";
import { Dossier, Section } from "@/components/Dossier";
import { PipelineMap } from "@/components/Maps";
import { REPO } from "@/lib/content";

export const metadata: Metadata = { title: "Architecture" };

export default function Architecture() {
  return (
    <>
      <Dossier
        eyebrow="Architecture"
        title="One pipeline, three channels, one source of truth"
        arabic="مسار واحد، ثلاث قنوات، مرجع واحد"
        lede="Each way of asking is understood by its own model and turned into the same request. One reasoning step answers from the knowledge base. The answer goes back out through the citizen’s channel, and a loop underneath measures everything."
        fields={[
          { label: "Channels", value: "Text · Speech · Sign" },
          { label: "Source of truth", value: "Knowledge base (axis 01)" },
          { label: "Interfaces", value: "HTTP + JSON, fixed contracts" },
          { label: "Status", value: null, stamp: true },
        ]}
      />

      <Section title="The map" intro={<p>Every block links to its axis.</p>}>
        <PipelineMap />
      </Section>

      <Section title="One question, end to end" kicker="Illustrative; content is a placeholder, not real requirements">
        <ul className="steps">
          <li><span className="k">01</span><span><b>Typed in Arabizi.</b> <span className="mono">chnowa lazemni bech na3mel passeport?</span></span></li>
          <li><span className="k">02</span><span><b>Normalized.</b> <span lang="ar" dir="rtl">شنوّة لازمني باش نعمل <span lang="fr" dir="ltr">passeport</span>؟</span> Derja in Arabic script, the French word kept in Latin script.</span></li>
          <li><span className="k">03</span><span><b>Routed.</b> A small classifier recognizes the passport procedure. If unsure, the assistant asks back.</span></li>
          <li><span className="k">04</span><span><b>Retrieved.</b> <span className="mono">POST /retrieve</span> returns the passport passages in force today, each with its source.</span></li>
          <li><span className="k">05</span><span><b>Written and checked.</b> Numbered steps in Derja; every sentence must match a cited passage, or the answer is blocked and handed to a human.</span></li>
          <li><span className="k">06</span><span><b>Rendered.</b> Shown as accessible text, read aloud by the VoxCPM voice, or signed by the avatar.</span></li>
          <li><span className="k">07</span><span><b>Logged, with consent.</b> A rephrase or a thumbs-down sends the session to the improvement loop.</span></li>
        </ul>
      </Section>

      <Section title="Contracts between axes" intro={<p>These interfaces are written down before the code, so each axis can be built against them in parallel.</p>}>
        <div className="scroll-x sheet" style={{ padding: 0 }}>
          <table className="ledger">
            <thead><tr><th>From</th><th>To</th><th>Contract</th><th>Spec</th></tr></thead>
            <tbody>
              <tr><td>Any channel</td><td>Derja LLM</td><td className="mono">{"{ text, raw_text, modality, confidence }"}</td><td>In design</td></tr>
              <tr><td>Derja LLM</td><td>Knowledge base</td><td className="mono">POST /retrieve</td><td><a href={`${REPO}/blob/main/ai_docs/rag/API.md`}>ai_docs/rag/API.md</a></td></tr>
              <tr><td>Derja LLM</td><td>Voice</td><td className="mono">POST /tts</td><td><a href={`${REPO}/blob/main/ai_docs/tts/API.md`}>ai_docs/tts/API.md</a> (proposed)</td></tr>
              <tr><td>Every axis</td><td>Improvement loop</td><td className="mono">one trace per turn</td><td>In design</td></tr>
            </tbody>
          </table>
        </div>
      </Section>
    </>
  );
}
