export type Source = { label: string; url: string };
export type Fact = { value: string; label: string; source?: Source; note?: string };

export type Axis = {
  slug: string;
  n: string;
  name: string;
  arabic: string;
  owner: string;
  stage: string;
  color: string;
  oneLine: string;
  problem: string;
  facts: Fact[];
  next: string[];
  docs?: Source;
};

export const REPO = "https://github.com/ngcodingtn-create/e-accesibility";

export const AXES: Axis[] = [
  {
    slug: "knowledge-base",
    n: "01",
    name: "Knowledge base",
    arabic: "قاعدة المعارف",
    owner: "Belhaj",
    stage: "Prototype being built",
    color: "var(--kb)",
    oneLine: "Store the official rules with their source and dates, and find the ones that answer a Derja question.",
    problem:
      "Procedures live on several portals, in Arabic and French, and they change. The assistant may only answer from a rule that is in force, so the knowledge base has to know where each passage came from and when it applies.",
    facts: [
      {
        value: "2.7% → 98.3%",
        label: "Accuracy on date-specific legal questions: current text only, versus an index that keeps every version (French tax law, 32,436 article versions).",
        source: { label: "Temporal misgrounding benchmark, 2026", url: "https://papers.cool/arxiv/2608.09393" },
      },
      {
        value: "≈ 2,250",
        label: "Administrative procedures Tunisia plans to simplify in 2025–2027, so the rules will keep moving.",
        source: { label: "La Presse", url: "https://www.lapresse.tn/?p=4365989" },
      },
      {
        value: "≈ 60%",
        label: "Lower Arabic OCR error rate for vision-language models than for classic OCR (KITAB-Bench). Needed later, for scanned texts.",
        source: { label: "KITAB-Bench", url: "https://arxiv.org/abs/2502.14949" },
      },
    ],
    next: [
      "Working /retrieve API on 3 procedures: passport, national ID card, birth certificate",
      "First test report: Hit@1 and MRR over ~15 questions in four scripts",
      "Then laws and decrees split by article («الفصل»), with validity dates and amendments",
      "Later: OCR for scanned texts, a reranker, more procedures",
    ],
    docs: { label: "ai_docs/rag", url: `${REPO}/tree/main/ai_docs/rag` },
  },
  {
    slug: "derja-llm",
    n: "02",
    name: "Derja LLM",
    arabic: "النموذج اللغوي بالدارجة",
    owner: "Med Amine",
    stage: "Design done, build starting",
    color: "var(--llm)",
    oneLine: "Understand the request, fetch the rules in force, and answer in Derja without inventing anything.",
    problem:
      "General models rarely answer in Tunisian Derja, and any model will state rules confidently that it never read. The LLM must route the question, answer only from retrieved passages, prove each sentence with a citation, and hand off when it cannot.",
    facts: [
      {
        value: "29–53% → ~80%",
        label: "Tunisian intent detection: general LLMs out of the box, versus fine-tuned models (NADI 2026 shared task). Routing uses a trained classifier.",
        source: { label: "NADI 2026", url: "https://arxiv.org/html/2609.27086" },
      },
      {
        value: "744",
        label: "Tunisian instructions in TounsiBench, where most models fail to answer in Tunisian at all. Our dialect check uses its criteria.",
        source: { label: "TounsiBench, EMNLP 2025", url: "https://aclanthology.org/2025.emnlp-main.1756/" },
      },
    ],
    next: [
      "Text spine: question → router → /retrieve → cited answer in Derja",
      "Citation check that blocks any sentence without a retrieved source",
      "Handoff to a human when retrieval is empty or the check fails",
      "Light LoRA tuning on Derja style and refusals only, never on facts",
    ],
  },
  {
    slug: "text-channel",
    n: "03",
    name: "Text channel",
    arabic: "القناة النصية",
    owner: "Med Amine",
    stage: "Design done, build starting",
    color: "var(--text)",
    oneLine: "Arabizi in, accessible text out.",
    problem:
      "Many Tunisians type Derja in Latin letters with digits for Arabic sounds (Arabizi). There is no standard spelling. The answer must then be readable by everyone, including screen-reader users, in correct right-to-left layout.",
    facts: [
      {
        value: "0",
        label: "Ready-made Tunisian Arabizi → Arabic models found on Hugging Face. We train a small one on the TArC corpus.",
        source: { label: "TArC corpus", url: "https://aclanthology.org/2022.lrec-1.121" },
      },
      {
        value: "WCAG 2.2 AA",
        label: "Accessibility target. EN 301 549 v4.1.1 (September 2026) now references WCAG 2.2.",
        source: { label: "Deque on EN 301 549", url: "https://www.deque.com/blog/en-301-549-v4-1-1-is-final-what-changed-what-it-means-and-what-you-should-do/" },
      },
    ],
    next: [
      "Digit map + small character model (ByT5) trained on TArC",
      "Keep French and English words in Latin script, as official documents do",
      "Accessible answer view: numbered steps, sources, RTL, screen-reader tests",
    ],
  },
  {
    slug: "speech",
    n: "04",
    name: "Speech",
    arabic: "الكلام",
    owner: "Ayhem · Med Amine",
    stage: "TTS prototype published",
    color: "var(--speech)",
    oneLine: "Derja speech in, Derja speech out.",
    problem:
      "Speech recognition models trained on formal Arabic fail on Derja mixed with French. On the output side, the voice must read numbers, dates and French administrative terms the way a Tunisian would.",
    facts: [
      {
        value: "82–94%",
        label: "Word error rate of off-the-shelf Whisper large-v3 on Tunisian test sets. Fine-tuned versions report about 15–17%.",
        source: { label: "LinTO, 2025", url: "https://arxiv.org/abs/2504.02604" },
      },
      {
        value: "≈ 8.5 h",
        label: "Training speech in Ayhem's Tn-TTS dataset (4,730 clips, measured). The VoxCPM2 fine-tune ran 147 full fine-tuning steps.",
        source: { label: "Code-Quasar/Tn-TTS", url: "https://huggingface.co/datasets/Code-Quasar/Tn-TTS" },
      },
      {
        value: "13.05",
        label: "VoxCPM2's own Arabic word error rate, far behind its main languages. Tunisian quality comes from our fine-tune.",
        source: { label: "VoxCPM", url: "https://github.com/OpenBMB/VoxCPM" },
      },
    ],
    next: [
      "TTS: clean transcripts, train for several epochs, pick checkpoints by measured error",
      "TTS: read numbers, dates and dinar amounts in Derja before synthesis",
      "TTS: listening test with 15–20 native speakers",
      "ASR: fine-tune Whisper on ≈100 h of open Tunisian speech (LinTO, TunSwitch)",
    ],
    docs: { label: "ai_docs/tts", url: `${REPO}/tree/main/ai_docs/tts` },
  },
  {
    slug: "sign-language",
    n: "05",
    name: "Sign language",
    arabic: "لغة الإشارة",
    owner: "Med Amine",
    stage: "Scoping with partners",
    color: "var(--sign)",
    oneLine: "Tunisian Sign Language in, signing avatar out.",
    problem:
      "Tunisian Sign Language (LST) has around 21,000 signers and almost no data. Continuous sign translation is still a research problem even for well-resourced languages, and Deaf users reject robotic avatars.",
    facts: [
      {
        value: "57",
        label: "Signs in the largest public Tunisian Sign Language dataset, as still images. No LST dictionary exists.",
        source: { label: "Mendeley TunSL", url: "https://data.mendeley.com/datasets/fbjjgzgv7f" },
      },
      {
        value: "≈ 30%",
        label: "Share of LST signs related to French Sign Language: a distant relative, so LSF data does not transfer directly.",
        source: { label: "Frontiers, 2023", url: "https://www.frontiersin.org/journals/communication/articles/10.3389/fcomm.2023.1201148/full" },
      },
    ],
    next: [
      "Approach ATILS and AVAST (Deaf associations) and the LaTICE lab (WebSign)",
      "Record 60–100 administrative signs with 8–12 Deaf signers",
      "Recognize isolated signs from body and hand keypoints",
      "Build the avatar from recorded signs, always shown with text",
    ],
  },
  {
    slug: "improvement-loop",
    n: "06",
    name: "Improvement loop",
    arabic: "حلقة التحسين",
    owner: "Med Amine",
    stage: "Design done",
    color: "var(--loop)",
    oneLine: "Measure every turn, fix the worst, ship only what is better.",
    problem:
      "Every model in the pipeline will make mistakes in ways nobody predicted. The loop finds them in real use, gets them labeled by native speakers and Deaf signers, and makes sure a new model never reaches a citizen unless it beats the live one.",
    facts: [
      {
        value: "2004-63",
        label: "Tunisia's data-protection law, still in force: consent and declaration to the INPDP. A replacement bill is in parliament.",
        source: { label: "Global Law Experts", url: "https://globallawexperts.com/tunisia-moves-replace-its-twentyyearold-data/" },
      },
    ],
    next: [
      "Log every turn with consent (Langfuse, self-hosted)",
      "Dashboard: task success, handoff rate, latency, per-channel use",
      "Frozen test sets and an evaluation gate in GitHub Actions",
      "Model registry (MLflow) and canary rollout",
    ],
  },
];

export const axisBySlug = (slug: string) => AXES.find(a => a.slug === slug);

export const PHASES = [
  { name: "Research", note: "Six areas reviewed", state: "done" },
  { name: "Architecture", note: "Axes, owners, interfaces", state: "done" },
  { name: "All axes in progress", note: "TTS published, RAG being built", state: "now" },
  { name: "Text spine", note: "Question to cited answer", state: "next" },
  { name: "Speech end to end", note: "ASR in, VoxCPM out", state: "next" },
  { name: "Improvement loop", note: "Logging, dashboard, gate", state: "next" },
  { name: "Sign channel", note: "Small vocabulary, Deaf validators", state: "next" },
] as const;

export const DECISIONS: { d: string; why: string; who: string }[] = [
  { d: "Build the text path end to end first, then add speech, the loop and sign.", why: "Speech and sign only deliver an answer. Without a correct, grounded answer they are useless.", who: "All" },
  { d: "Facts come only from retrieval, never from model weights.", why: "Rules change; retraining a model for every rule change is impossible.", who: "Med Amine" },
  { d: "Index every passage with its validity dates.", why: "Current-text-only search answered 2.7% of date-specific legal questions; a version-aware index 98.3%.", who: "Belhaj" },
  { d: "One text form: Derja in Arabic script, French and English in Latin script.", why: "Official documents use French terms; datasets disagree on scripts, so everything is mapped to one convention.", who: "All" },
  { d: "Route intents with a small trained classifier.", why: "Zero-shot LLMs scored 29–53% on Tunisian intents; fine-tuned models about 80%.", who: "Med Amine" },
  { d: "Fine-tune Whisper instead of using it off the shelf.", why: "Off-the-shelf large-v3: 82–94% word error rate on Tunisian sets.", who: "Med Amine" },
  { d: "Sign: isolated signs from a small vocabulary, avatar from recorded signs.", why: "No LST dictionary or video corpus exists; generative sign models need large 3D corpora.", who: "Med Amine" },
  { d: "Use licenses that allow a public service (Apache-2.0, MIT, CC-BY).", why: "VoxCPM, Qwen3 and Gemma 4 qualify. Non-commercial models are comparison baselines only.", who: "All" },
  { d: "Self-host in Tunisia; consent before storing voice or video.", why: "Organic Law 2004-63 restricts transfers abroad and requires consent.", who: "All" },
  { d: "No model ships unless it beats the live one, with no user group getting worse.", why: "Protects regional, gender, age and Deaf subgroups from silent regressions.", who: "Med Amine" },
];

export const RISKS: { t: string; m: string }[] = [
  { t: "No public Tunisian Sign Language data", m: "Scope to 60–100 signs recorded with Deaf partners." },
  { t: "Legal portals are hard to reach", m: "Start from procedure pages saved by hand; OCR later." },
  { t: "The LLM invents rules", m: "Retrieval-only facts, a citation check, human handoff." },
  { t: "Three people, six axes", m: "Text spine first, open models reused, sign scoped down." },
  { t: "Voice and face are personal data", m: "Consent first, keypoints instead of video, hosting in Tunisia." },
  { t: "Benchmark numbers are self-reported", m: "Re-measure everything on our own frozen test set." },
];

export const SOURCES: { axis: string; items: Source[] }[] = [
  { axis: "Knowledge base", items: [
    { label: "Idaraty procedure pages", url: "https://idaraty.tn" },
    { label: "Temporal misgrounding in legal RAG (2026)", url: "https://papers.cool/arxiv/2608.09393" },
    { label: "BGE-M3 multilingual embeddings", url: "https://huggingface.co/BAAI/bge-m3" },
    { label: "KITAB-Bench, Arabic OCR", url: "https://arxiv.org/abs/2502.14949" },
    { label: "Qari-OCR", url: "https://arxiv.org/abs/2506.02295" },
  ]},
  { axis: "Derja LLM", items: [
    { label: "TounsiBench (EMNLP 2025)", url: "https://aclanthology.org/2025.emnlp-main.1756/" },
    { label: "NADI 2026 shared task", url: "https://arxiv.org/html/2609.27086" },
    { label: "Tunisian Derja dataset (LINAGORA)", url: "https://huggingface.co/datasets/linagora/Tunisian_Derja_Dataset" },
  ]},
  { axis: "Text channel", items: [
    { label: "TArC Tunisian Arabish corpus", url: "https://aclanthology.org/2022.lrec-1.121" },
    { label: "How well do LLMs understand Tunisian Arabic? (2025)", url: "https://arxiv.org/abs/2511.16683" },
  ]},
  { axis: "Speech", items: [
    { label: "Ayhem's model: Code-Quasar/voxcpm-tn", url: "https://huggingface.co/Code-Quasar/voxcpm-tn" },
    { label: "Ayhem's dataset: Code-Quasar/Tn-TTS", url: "https://huggingface.co/datasets/Code-Quasar/Tn-TTS" },
    { label: "VoxCPM (OpenBMB)", url: "https://github.com/OpenBMB/VoxCPM" },
    { label: "LinTO Tunisian ASR paper", url: "https://arxiv.org/abs/2504.02604" },
    { label: "Habibi-TTS (comparison baseline)", url: "https://github.com/SWivid/Habibi-TTS" },
  ]},
  { axis: "Sign language", items: [
    { label: "LST and LSF (Frontiers, 2023)", url: "https://www.frontiersin.org/journals/communication/articles/10.3389/fcomm.2023.1201148/full" },
    { label: "TunSL image dataset", url: "https://data.mendeley.com/datasets/fbjjgzgv7f" },
    { label: "Isharah (Saudi SL, 2025)", url: "https://arxiv.org/abs/2506.03615" },
    { label: "WFD/WASLI statement on signing avatars", url: "https://wfdeaf.org/wp-content/uploads/WFD-and-WASLI-Statement-on-Avatar-FINAL-14032018-Updated-14042018.pdf" },
  ]},
  { axis: "Improvement loop", items: [
    { label: "Langfuse (self-hosted tracing)", url: "https://langfuse.com" },
    { label: "Tunisian data-protection reform", url: "https://globallawexperts.com/tunisia-moves-replace-its-twentyyearold-data/" },
    { label: "UTMOSv2 speech quality predictor", url: "https://github.com/sarulab-speech/utmosv2" },
  ]},
];
