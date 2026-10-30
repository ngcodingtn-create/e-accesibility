import { Flow, RangeBars } from "./Common";
import { LoopCycle } from "./Maps";
import { Section } from "./Dossier";

/* ---------------- 01 Knowledge base ---------------- */

function VersionTimeline() {
  const L = 150, R = 900, y0 = 2016, y1 = 2027;
  const x = (y: number) => L + ((R - L) * (y - y0)) / (y1 - y0);
  const years = Array.from({ length: y1 - y0 + 1 }, (_, i) => y0 + i);
  return (
    <svg className="dia" viewBox="0 0 920 230" role="img" aria-label="Illustrative timeline: article 5 version 1 applies from 2016 to 2023, version 2 from 2023 onwards. A question about 2021 must get version 1; a question today must get version 2.">
      {years.map(y => (
        <g key={y}>
          <line x1={x(y)} x2={x(y)} y1={20} y2={170} stroke="var(--rule-2)" />
          <text x={x(y)} y={190} textAnchor="middle" className="t-label">{y}</text>
        </g>
      ))}
      <text x={0} y={62} style={{ fontSize: 14, fontWeight: 600 }}>Article 5 · v1</text>
      <text x={0} y={80} className="t-muted" style={{ fontSize: 12 }}>amended 2023</text>
      <rect x={x(2016)} y={50} width={x(2023) - x(2016)} height={26} fill="var(--field)" stroke="var(--ink-3)" strokeDasharray="4 3" />
      <text x={x(2016) + 10} y={68} style={{ fontSize: 13 }}>valid_from 2016 · valid_to 2023</text>
      <text x={0} y={122} style={{ fontSize: 14, fontWeight: 600 }}>Article 5 · v2</text>
      <text x={0} y={140} className="t-muted" style={{ fontSize: 12 }}>in force</text>
      <rect x={x(2023)} y={110} width={R - x(2023)} height={26} fill="var(--kb)" />
      <text x={x(2023) + 10} y={128} style={{ fontSize: 13, fill: "var(--sheet)", fontWeight: 600 }}>valid_from 2023 · valid_to —</text>
      <line x1={x(2021.4)} x2={x(2021.4)} y1={30} y2={168} stroke="var(--ink)" strokeWidth={2} />
      <text x={x(2021.4) + 6} y={36} style={{ fontSize: 12.5, fontWeight: 600 }}>“What applied in 2021?” → v1</text>
      <line x1={x(2026.83)} x2={x(2026.83)} y1={92} y2={168} stroke="var(--flag)" strokeWidth={2} />
      <text x={x(2026.83) - 6} y={160} textAnchor="end" style={{ fontSize: 12.5, fontWeight: 600, fill: "var(--flag)" }}>Asked today → v2</text>
      <text x={0} y={222} className="t-muted" style={{ fontSize: 12 }}>Illustrative. An index of current text only cannot answer the first question, and may cite a repealed rule.</text>
    </svg>
  );
}

function ChunkCard() {
  const rows: [string, string][] = [
    ["chunk_id", "passport_fr#03"],
    ["procedure_id", "passport"],
    ["section", "Pièces à fournir"],
    ["text", "“Délivrance du passeport — …”"],
    ["source_url", "idaraty.tn/fr/procedures/…"],
    ["valid_from", "null"],
    ["valid_to", "null"],
    ["status", "in_force"],
  ];
  return (
    <div className="chunk">
      <div className="label">One stored chunk (illustrative)</div>
      <dl>
        {rows.map(([k, v]) => (<div key={k}><dt>{k}</dt><dd>{v}</dd></div>))}
      </dl>
    </div>
  );
}

function HybridSearch() {
  return (
    <div className="hs" aria-label="Hybrid search steps">
      <div className="hs-box">Citizen question, any script</div>
      <div className="hs-down" aria-hidden>↓</div>
      <div className="hs-three">
        <div className="hs-box"><b>Keywords</b><span>BM25, catches exact terms like “passeport”</span></div>
        <div className="hs-box"><b>Meaning</b><span>BGE-M3 embeddings, works across languages</span></div>
        <div className="hs-box"><b>Glossary</b><span>Derja word → official Arabic and French terms</span></div>
      </div>
      <div className="hs-down" aria-hidden>↓</div>
      <div className="hs-box">Fuse the three rankings (reciprocal rank fusion)</div>
      <div className="hs-down" aria-hidden>↓</div>
      <div className="hs-box">Keep only passages in force on the question’s date</div>
      <div className="hs-down" aria-hidden>↓</div>
      <div className="hs-box hs-out">Top 5 passages with sources, or a “nothing found” flag → Derja LLM</div>
    </div>
  );
}

function BuildSwimlane() {
  const lanes: [string, (string | null)[], string?][] = [
    ["Main agent", ["Schema, stubs, test data", null, "Real pages, report, pull request"]],
    ["A · Ingest", [null, "Saved pages → chunks", null]],
    ["B · Search", [null, "Keyword + vector search, fusion", null]],
    ["C · Serve", [null, "/retrieve API + demo command", null]],
    ["D · Evaluate", [null, "Test questions + metrics", null]],
  ];
  return (
    <div className="scroll-x">
      <div className="swim">
        <span /><span className="label">1 · Set up · 10 min</span><span className="label">2 · In parallel</span><span className="label">3 · Integrate</span>
        {lanes.map(([who, cells]) => (
          <div key={who} style={{ display: "contents" }}>
            <b>{who}</b>
            {cells.map((c, i) => c ? <span key={i} className={`bar${who === "Main agent" ? " dark" : ""}`}>{c}</span> : <span key={i} />)}
          </div>
        ))}
        <b style={{ color: "var(--text)" }}>Belhaj</b>
        <span className="bar human" style={{ gridColumn: "span 2" }}>Saves 3 pages from Idaraty by hand (5 min) while the agents build</span>
        <span className="bar human">Reviews test questions</span>
      </div>
    </div>
  );
}

function EvalMatrix() {
  const scripts = ["Derja (Arabic script)", "Arabizi", "French", "Formal Arabic"];
  const procs = ["Passport", "National ID card", "Birth certificate"];
  return (
    <div className="scroll-x">
      <div className="evalm">
        <span />
        {scripts.map(s => <span key={s} className="label">{s}</span>)}
        {procs.map(p => (
          <div key={p} style={{ display: "contents" }}>
            <b>{p}</b>
            {scripts.map(s => <span key={s} className="dot" aria-label={`${p} question in ${s}`} />)}
          </div>
        ))}
        <b style={{ color: "var(--flag)" }}>Out of scope</b>
        <span style={{ gridColumn: "span 4" }} className="muted">3 questions that must come back with “nothing found”</span>
      </div>
    </div>
  );
}

function KnowledgeBase() {
  return (
    <>
      <Section title="How it works" kicker="From saved pages to a search API">
        <Flow color="var(--kb)" nodes={[
          { t: "Saved pages", s: "3 Idaraty procedure pages, saved by hand with their URL" },
          { t: "Ingest", s: "Main text extracted and split by heading" },
          { t: "Dates + source", s: "Every chunk keeps its URL, validity dates and status" },
          { t: "Hybrid search", s: "Keywords + meaning + Derja glossary" },
          { t: "/retrieve API", s: "Top 5 passages in force → Derja LLM", solid: true },
        ]} />
        <p className="callout"><strong>Saved by hand:</strong> Idaraty blocks AI crawlers, so we never scrape it.</p>
      </Section>
      <Section title="What is stored, and how it is searched">
        <div className="two-col">
          <ChunkCard />
          <HybridSearch />
        </div>
      </Section>
      <Section title="Which version is in force" intro={<p>Search keeps only the passages in force on the question’s date.</p>}>
        <div className="sheet scroll-x"><div style={{ minWidth: 640 }}><VersionTimeline /></div></div>
      </Section>
      <Section title="How the prototype is being built" intro={<p>One agent, four subagents in parallel: about one to two hours.</p>}>
        <BuildSwimlane />
      </Section>
      <Section title="How it will be measured" intro={<p>≈ 15 questions in four scripts, plus 3 out of scope. No results yet.</p>}>
        <EvalMatrix />
      </Section>
    </>
  );
}

/* ---------------- 02 Derja LLM ---------------- */

function DerjaLLM() {
  return (
    <>
      <Section title="How it answers" kicker="Facts come only from retrieval">
        <div className="llm-flow">
          <Flow color="var(--llm)" nodes={[
            { t: "Request", s: "From any channel, already normalized" },
            { t: "Route", s: "Small classifier picks the procedure" },
            { t: "Retrieve", s: "Calls /retrieve for rules in force", c: "var(--kb)" },
            { t: "Write", s: "Numbered steps in Derja, with citations" },
            { t: "Check", s: "Every sentence must match a cited passage" },
          ]} />
          <div className="branch">
            <div className="pass"><b>Pass</b><span>Answer with its sources</span></div>
            <div className="fail"><b>Fail or nothing found</b><span>Ask back, or hand off to a human agent</span></div>
          </div>
        </div>
      </Section>
      <Section title="Why a trained router" intro={<p>Models trained on Tunisian data recognize intents far better than general LLMs.</p>}>
        <div className="sheet">
          <RangeBars title="Tunisian intent detection accuracy" max={100} ticks={[0, 25, 50, 75, 100]} unit="%" rows={[
            { label: "General LLMs, zero-shot", sub: "range across models", from: 29, to: 53, color: "var(--ink-3)", text: "29–53%" },
            { label: "Fine-tuned (LoRA)", sub: "NADI 2026", from: 0, to: 80, color: "var(--llm)", text: "≈ 80%" },
          ]} />
        </div>
      </Section>
      <Section title="Model choice">
        <ul className="steps">
          <li><span className="k">LLM</span><span>Qwen3-8B or Gemma 4, both Apache-2.0, so they can serve a public service. Prompting + retrieval first; light LoRA tuning on Derja style and refusals only.</span></li>
          <li><span className="k">Router</span><span>A fine-tuned Tunisian encoder (TunBERT or MARBERT) over procedure IDs, with an “unknown” class.</span></li>
          <li><span className="k">Check</span><span>Each cited ID must exist in the retrieved set, and each sentence must be supported by its passage (natural-language inference model).</span></li>
          <li><span className="k">Serve</span><span>vLLM on a GPU; llama.cpp for laptop demos. LangGraph for tools and the human handoff.</span></li>
        </ul>
      </Section>
    </>
  );
}

/* ---------------- 03 Text channel ---------------- */

function TextChannel() {
  const map: [string, string, string][] = [["3", "ع", "ʿayn"], ["7", "ح", "ḥā’"], ["9", "ق", "qāf"], ["5", "خ", "khā’"], ["8", "غ", "ghayn"], ["2", "ء", "hamza"]];
  return (
    <>
      <Section title="From Arabizi to one spelling" intro={<p>Derja in Arabic script; French and English stay in Latin script.</p>}>
        <div className="digits">
          {map.map(([d, a, n]) => (
            <div key={d} className="digit">
              <span className="d">{d}</span><span className="to" aria-hidden>→</span><span className="a" lang="ar">{a}</span><span className="n">{n}</span>
            </div>
          ))}
        </div>
        <div className="sheet translit">
          <div><span className="label">Typed</span><p className="mono big">chnowa lazemni bech na3mel passeport?</p></div>
          <div><span className="label">Normalized</span><p className="big" lang="ar" dir="rtl">شنوّة لازمني باش نعمل <span lang="fr" dir="ltr">passeport</span>؟</p></div>
        </div>
      </Section>
      <Section title="An answer everyone can read">
        <ul className="steps">
          <li><span className="k">01</span><span>Numbered steps, short sentences, with the source of each step.</span></li>
          <li><span className="k">02</span><span>Correct right-to-left layout, with French spans marked as French so screen readers switch voice.</span></li>
          <li><span className="k">03</span><span>WCAG 2.2 AA: contrast, keyboard use, 24 px targets, live region for streamed answers.</span></li>
          <li><span className="k">04</span><span>Tested with NVDA and TalkBack in Arabic, and with real screen-reader users.</span></li>
        </ul>
      </Section>
    </>
  );
}

/* ---------------- 04 Speech ---------------- */

function Speech() {
  return (
    <>
      <Section title="Speech synthesis · Ayhem" kicker="VoxCPM2 fine-tuned on Derja, published on Hugging Face" intro={<p>VoxCPM2 (2.3 B parameters) fine-tuned by Ayhem, published as <a href="https://huggingface.co/Code-Quasar/voxcpm-tn">Code-Quasar/voxcpm-tn</a>.</p>}>
        <Flow color="var(--speech)" nodes={[
          { t: "Derja text", s: "starts with “(Tunisian Dialect)”" },
          { t: "Language model", s: "plans words and rhythm" },
          { t: "Acoustic model", s: "adds voice detail" },
          { t: "Diffusion decoder", s: "generates the sound, patch by patch" },
          { t: "48 kHz audio", s: "streamed", solid: true },
        ]} />
        <div className="patches" aria-label="Audio is generated patch by patch; each patch is fed back to make the next">
          {Array.from({ length: 12 }, (_, k) => <i key={k} style={{ ["--d" as string]: `${k * 0.35}s` }} />)}
          <span className="cap">one patch every 0.16 s of speech · each one feeds the next</span>
        </div>
      </Section>
      <Section title="The training data" intro={<p>Measured from <a href="https://huggingface.co/datasets/Code-Quasar/Tn-TTS">Code-Quasar/Tn-TTS</a>: 4,730 clips, ≈ 8.5 h.</p>}>
        <div className="sheet">
          <RangeBars title="Training clips per style tag" max={2800} ticks={[0, 700, 1400, 2100, 2800]} rows={[
            { label: "No style", sub: "(Tunisian Dialect)", from: 0, to: 2649, color: "var(--speech)", text: "2,649" },
            { label: "Cheerful", from: 0, to: 438, color: "var(--speech)", text: "438" },
            { label: "Calm", from: 0, to: 436, color: "var(--speech)", text: "436" },
            { label: "Measured", from: 0, to: 408, color: "var(--speech)", text: "408" },
            { label: "Conversational", from: 0, to: 406, color: "var(--speech)", text: "406" },
            { label: "Serious", from: 0, to: 393, color: "var(--speech)", text: "393" },
          ]} />
        </div>
        <div className="scroll-x sheet" style={{ padding: 0 }}>
          <table className="ledger">
            <thead><tr><th>Measured</th><th>Train</th><th>Validation</th></tr></thead>
            <tbody>
              <tr><td>Clips · hours</td><td>4,730 · ≈ 8.5 h</td><td>179 · ≈ 0.2 h</td></tr>
              <tr><td>Median clip length</td><td>5.3 s</td><td>2.5 s</td></tr>
              <tr><td>Share of Latin-script characters</td><td>31%</td><td>13%</td></tr>
              <tr><td>Clips with a reference recording</td><td>31%</td><td>32%</td></tr>
            </tbody>
          </table>
        </div>
        <p className="callout"><strong>Next:</strong> clean the transcripts, train longer, run a listening test. <a href="https://github.com/ngcodingtn-create/e-accesibility/tree/main/ai_docs/tts">Details</a></p>
      </Section>
      <Section title="Speech recognition" intro={<p>Off-the-shelf Whisper fails on Tunisian speech, so we fine-tune it; the same model then scores the voice.</p>}>
        <div className="sheet">
          <RangeBars title="Word error rate on Tunisian test sets, lower is better" max={100} ticks={[0, 25, 50, 75, 100]} unit="%" rows={[
            { label: "Whisper large-v3, as is", sub: "LinTO paper, 3 test sets", from: 82, to: 94, color: "var(--ink-3)", text: "82–94%" },
            { label: "Whisper, fine-tuned", sub: "self-reported, NADI 2026", from: 15, to: 17, color: "var(--speech)", text: "≈ 15–17%" },
          ]} />
        </div>
        <Flow color="var(--speech)" nodes={[
          { t: "Test sentence", s: "numbers, dates, admin terms" },
          { t: "VoxCPM voice", s: "synthesizes it" },
          { t: "Tunisian ASR", s: "transcribes it" },
          { t: "Character error rate", s: "compared to real recordings", solid: true },
        ]} />
      </Section>
    </>
  );
}

/* ---------------- 05 Sign language ---------------- */

function SignLanguage() {
  return (
    <>
      <Section title="How little data exists" intro={<p>No Tunisian Sign Language dictionary or video corpus exists.</p>}>
        <div className="sheet">
          <RangeBars title="Number of signs per dataset" max={520} ticks={[0, 100, 200, 300, 400, 500]} rows={[
            { label: "TunSL (Tunisian)", sub: "still images, 7 signers", from: 0, to: 57, color: "var(--sign)", text: "57" },
            { label: "Our target", sub: "8–12 Deaf signers, video", from: 60, to: 100, color: "var(--flag)", text: "60–100" },
            { label: "KArSL (Saudi Arabic SL)", sub: "pretraining only", from: 0, to: 502, color: "var(--ink-3)", text: "502" },
          ]} />
        </div>
      </Section>
      <Section title="Both directions, kept simple">
        <div className="stack-flows">
          <span className="label">Recognition</span>
          <Flow color="var(--sign)" nodes={[
            { t: "Camera", s: "pose extracted on the device" },
            { t: "Keypoints", s: "hands, body, face" },
            { t: "Sign classifier", s: "isolated signs" },
            { t: "Intent", s: "→ Derja LLM", solid: true },
          ]} />
          <span className="label">Production</span>
          <Flow color="var(--sign)" nodes={[
            { t: "Answer", s: "from the LLM" },
            { t: "Glosses", s: "only words from our lexicon" },
            { t: "Recorded signs", s: "one clip per gloss" },
            { t: "Avatar + text", s: "always captioned", solid: true },
          ]} />
        </div>
        <p className="callout"><strong>Deaf signers validate every sign.</strong> The avatar always shows text and offers a human interpreter.</p>
      </Section>
    </>
  );
}

/* ---------------- 06 Improvement loop ---------------- */

function ImprovementLoop() {
  return (
    <>
      <Section title="The loop" intro={<p>Log every turn, label the worst, retrain, ship only if better.</p>}>
        <div className="sheet"><LoopCycle /></div>
      </Section>
      <Section title="What each model must beat">
        <div className="scroll-x sheet" style={{ padding: 0 }}>
          <table className="ledger">
            <thead><tr><th>Model</th><th>Gate metric</th></tr></thead>
            <tbody>
              <tr><td>Speech recognition</td><td>Character and word error rate, on clean and code-switched speech</td></tr>
              <tr><td>Arabizi normalizer</td><td>Character error rate against hand-normalized text</td></tr>
              <tr><td>Knowledge base</td><td>Hit@1, MRR, version accuracy of citations</td></tr>
              <tr><td>Derja LLM</td><td>Faithfulness, citation accuracy, correct refusals, dialect rating by native speakers</td></tr>
              <tr><td>Voice (TTS)</td><td>Round-trip character error rate, listening-test score</td></tr>
              <tr><td>Sign</td><td>Accuracy on signers not seen in training; comprehension by Deaf users</td></tr>
              <tr><td>Whole system</td><td>Task success on scripted procedures, with no user group getting worse</td></tr>
            </tbody>
          </table>
        </div>
      </Section>
      <Section title="Tools">
        <p className="prose">Langfuse · Metabase · Label Studio · MLflow · GitHub Actions, all self-hosted.</p>
      </Section>
    </>
  );
}

export function AxisDetail({ slug }: { slug: string }) {
  switch (slug) {
    case "knowledge-base": return <KnowledgeBase />;
    case "derja-llm": return <DerjaLLM />;
    case "text-channel": return <TextChannel />;
    case "speech": return <Speech />;
    case "sign-language": return <SignLanguage />;
    case "improvement-loop": return <ImprovementLoop />;
    default: return null;
  }
}
