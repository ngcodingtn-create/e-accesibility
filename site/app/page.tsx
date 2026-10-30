import Link from "next/link";
import { Dossier, Section } from "@/components/Dossier";
import { StatusBoard, Timeline } from "@/components/Common";

export default function Overview() {
  return (
    <>
      <Dossier
        eyebrow="Project file · status as of 30 October 2026"
        title="An assistant that explains Tunisian procedures in Derja"
        arabic="مساعد يشرح الإجراءات الإدارية بالدارجة التونسية"
        lede="A citizen asks how to get a passport, an ID card or a birth certificate, by typing, speaking or signing. The assistant finds the official rule that is in force, explains it in Derja with its source, and answers in the same way it was asked."
        fields={[
          { label: "Team", value: "Ayhem · Belhaj · Med Amine" },
          { label: "Axes of work", value: "6, running in parallel" },
          { label: "Phase", value: "First prototypes" },
          { label: "Status", value: null, stamp: true },
        ]}
      />

      <Section title="Three ways to ask, one grounded answer" intro={<p>Built for citizens who are Deaf, blind or low-vision, or more at ease in Derja than in formal Arabic or French. Every answer points to the rule it comes from.</p>}>
        <div className="ways">
          <div className="ways-in">
            <div className="slip" style={{ ["--c" as string]: "var(--text)" }}><span className="label">Typed</span><p className="mono">chnowa lazemni bech na3mel passeport?</p></div>
            <div className="slip" style={{ ["--c" as string]: "var(--speech)" }}><span className="label">Spoken</span><p>Derja mixed with French, on a phone</p></div>
            <div className="slip" style={{ ["--c" as string]: "var(--sign)" }}><span className="label">Signed</span><p>Tunisian Sign Language, on camera</p></div>
          </div>
          <div className="ways-arrow" aria-hidden>→</div>
          <div className="ways-core">
            <b>Derja assistant</b>
            <p>Finds the rule in force, writes the steps in Derja, checks every sentence against its source.</p>
          </div>
          <div className="ways-arrow" aria-hidden>→</div>
          <div className="ways-out">
            <span className="label">Answer, in the same channel</span>
            <ol>
              <li>Documents to bring <span className="tag">cited</span></li>
              <li>Where to apply <span className="tag">cited</span></li>
              <li>Fees and delay <span className="tag">cited</span></li>
            </ol>
            <p className="small muted">Each step links to the passage it comes from, in the version in force.</p>
          </div>
        </div>
      </Section>

      <Section title="Where each axis stands" intro={<p>Six axes of work, all in progress at the same time. Fixed interfaces between them mean no axis waits for another.</p>}>
        <StatusBoard />
      </Section>

      <Section title="Timeline">
        <Timeline />
      </Section>

      <Section title="Read next">
        <ul className="steps">
          <li><span className="k">→</span><span><Link href="/architecture/">Architecture</Link>: how the pieces connect, and one question followed end to end.</span></li>
          <li><span className="k">01</span><span><Link href="/axes/knowledge-base/">Knowledge base</Link>: the prototype being built now.</span></li>
          <li><span className="k">04</span><span><Link href="/axes/speech/">Speech</Link>: Ayhem’s published Derja voice and its training data.</span></li>
        </ul>
      </Section>
    </>
  );
}
