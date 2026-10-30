# RAG minimal prototype: plan

Owner: **Belhaj**. Code lives in `services/rag/`. Target: working end to end in **1–2 hours**.

## Goal

Prove the retrieval works on a handful of real documents. A Derja / Arabizi / French / formal Arabic question about one of 3 procedures returns the right passages, with their source, through:

```bash
python -m rag.cli "chnowa lazemni bech na3mel passeport?"
```

and through `POST /retrieve` (see [API.md](API.md)). A small evaluation prints a hit-rate table.

**Not in this prototype:** OCR, scraping, databases, amendment tracking, LLM query rewriting, answer generation. The design keeps a place for each of these so they can be added later.

## The documents: 3 procedures, saved by hand (Belhaj, 5 minutes)

Idaraty's robots.txt **blocks AI crawlers**, so the agent must never fetch idaraty.tn. Belhaj saves the pages himself in a normal browser:

1. Open each procedure page on https://idaraty.tn. Use the site search to find "passeport", "carte d'identité nationale" and "extrait de naissance". If an Arabic version exists, open that too.
2. Press Ctrl+S and choose **"Web page, HTML only"**. Save into `services/rag/data/raw/` with these names:
   `passport_fr.html`, `cin_fr.html`, `birth_certificate_fr.html` (plus `_ar.html` versions if available).
3. Fill in `services/rag/data/raw/sources.csv`. The agent creates the file with the header row.

   ```csv
   file,procedure_id,lang,title,source_url,saved_on
   passport_fr.html,passport,fr,Délivrance du passeport,https://idaraty.tn/fr/procedures/...,2026-10-30
   ```

That is 3 to 6 files, which is enough. The agent never writes or edits procedure content. It only processes these files.

## Design

```
data/raw/*.html + sources.csv
   └─ rag.ingest ──► data/processed/chunks.jsonl     (main text → chunks by heading)
                        └─ rag.index ──► data/index/  (BM25 + dense embeddings)
query ─► rag.normalize ─► glossary expansion ─► BM25 top-30 + dense top-30 ─► RRF fusion
      ─► filter (procedure_id, in force on as_of) ─► top_k ─► rag.api /retrieve · rag.cli
```

### Chunk schema (the contract between all modules; write it first in `src/rag/schema.py`)

```python
class Chunk(TypedDict):
    chunk_id: str          # f"{procedure_id}_{lang}#{n:02d}"
    procedure_id: str      # passport | cin | birth_certificate
    lang: str              # fr | ar
    title: str             # procedure title from sources.csv
    section: str           # heading the chunk falls under, "" if none
    text: str              # "<title> — <section>\n<body>", the original text
    source_url: str
    saved_on: str          # ISO date
    valid_from: str | None # None for now; kept for version filtering later
    valid_to: str | None
    status: str            # "in_force" (default) | "abrogated" | "unknown"
```

### Module responsibilities and signatures

| Module | Responsibility | Public function |
|---|---|---|
| `rag.ingest` | Extract the main content of each saved page and split it into chunks | `ingest(raw_dir, out_path) -> list[Chunk]` |
| `rag.normalize` | Normalize text for search | `normalize(text: str) -> str` and `arabizi_to_arabic(text: str) -> str` |
| `rag.index` | Build and load the indexes | `build(chunks_path, index_dir)` and `load(index_dir) -> Index` |
| `rag.retrieve` | Run the hybrid search | `retrieve(query, raw_query=None, procedure_id=None, as_of=None, top_k=5) -> RetrieveResult` |
| `rag.api` | Serve the API | FastAPI `app`, endpoints in [API.md](API.md) |
| `rag.cli` | Command-line demo | `python -m rag.cli "<question>" [--top-k 5] [--procedure passport]` prints a table |
| `rag.eval` | Evaluation report | `python -m rag.eval` writes `reports/eval.md` |

`RetrieveResult` is `{"results": [Chunk + {"score": float, "retrievers": list[str]}], "expanded_queries": list[str], "below_threshold": bool, "latency_ms": int}`.

#### `rag.ingest`
- Extract the main content of each page with `trafilatura`, using `output_format="markdown"` to keep the headings. If that fails, fall back to BeautifulSoup `get_text`.
- Split the content on headings, aiming for chunks of 300–1,200 characters. Merge very short sections into the next one, and split long ones on paragraphs. Drop navigation and footer boilerplate.

#### `rag.normalize`
- Arabic text:
  - remove diacritics and tatweel
  - unify the letter variants: أإآٱ→ا, ى→ي, ة→ه, ؤ→و, ئ→ي
  - convert Arabic-Indic digits to Western digits
- Latin text: lowercase it and fold accents.
- `arabizi_to_arabic` is a deterministic fallback, used on query tokens that mix Latin letters and digits. It maps the digits 3→ع, 7→ح, 9→ق, 5→خ, 8→غ, 2→ء and transliterates the remaining letters roughly.

#### `rag.index`
- Build a BM25 index with `bm25s` over the normalized text.
- Compute dense embeddings with `sentence-transformers`. The model is set by the environment variable `RAG_EMBED_MODEL`:
  - default: `BAAI/bge-m3` (multilingual, strong when the query and the documents are in different languages)
  - `intfloat/multilingual-e5-small` if the machine is slow or short on RAM
- Save `embeddings.npy`, the matching `chunk_ids`, and the BM25 index into `data/index/`.

#### `rag.retrieve`
1. Build the query variants: `query`, `raw_query`, the arabizi-converted query, and glossary expansions from `data/glossary.yaml`.
2. For each variant, take the BM25 top 30 and the dense top 30.
3. Fuse all the lists with reciprocal rank fusion, `score = Σ 1/(60 + rank)`.
4. Filter by `procedure_id` (if given) and by `as_of`: keep `valid_from` ≤ as_of < `valid_to` (a `None` bound always passes), and drop `abrogated` chunks.
5. Return the top_k.
6. Set `below_threshold` when the best dense cosine score is under `RAG_MIN_SCORE` (default 0.35; tune it on the eval).

#### Glossary (`data/glossary.yaml`)

The glossary holds vocabulary only, never procedure facts, so the agent can draft it. Example:

```yaml
passport: { derja: ["باسبور", "passeport", "paspor", "baspor"], ar: ["جواز السفر"], fr: ["passeport"] }
cin: { derja: ["لاكارط", "la carte", "karta", "بطاقة التعريف"], ar: ["بطاقة التعريف الوطنية"], fr: ["carte d'identité nationale", "CIN"] }
birth_certificate: { derja: ["مضمون", "madhmoun", "extrait"], ar: ["مضمون ولادة"], fr: ["extrait de naissance", "acte de naissance"] }
```

#### `rag.eval`
- Gold set: `data/gold/questions.jsonl`, about 15 questions. That is 4 per procedure, mixing Derja in Arabic script, Arabizi, French and formal Arabic, plus 3 out-of-scope questions.
- Each line looks like `{"qid":"q01","question":"…","lang":"aeb-latn","procedure_id":"passport","draft":true}`. Out-of-scope questions use `"procedure_id": null`.
- Hit@k counts a question as a hit when any of its top-k chunks has the gold `procedure_id`.
- Report Hit@1, Hit@5 and MRR, overall and per `lang`. For out-of-scope questions, report the share where `below_threshold` is true.
- Run it 3 ways: BM25 only, dense only, and hybrid with the glossary.

## Run it in parallel

**Step 1, main agent (about 10 minutes, then commit).** Create:
- `pyproject.toml`: Python ≥3.10, with dependencies `fastapi uvicorn pydantic bm25s sentence-transformers numpy trafilatura beautifulsoup4 pyyaml pytest httpx`
- `src/rag/` containing `schema.py` (above) and empty stubs for every module, with the signatures above
- `tests/fixtures/chunks.jsonl`: 6 obviously fake chunks (text starts with `FIXTURE`), 2 per procedure
- `data/raw/sources.csv` with only the header row
- `.gitignore` additions: `data/index/`, `data/processed/`
- a short `README.md`

Then ask Belhaj to save the pages (see above) **and do not wait for him.**

**Step 2: four subagents in parallel.** Start them in one message. Each one owns only its own files and works against the schema and fixtures:

| Subagent | Owns | Done when |
|---|---|---|
| A · ingest | `rag/ingest.py`, `tests/test_ingest.py` (a small synthetic HTML fixture) | the fixture HTML gives sensible chunks; works on any saved page |
| B · search | `rag/normalize.py`, `rag/index.py`, `rag/retrieve.py`, their tests | on the fixtures, a passport query returns passport chunks first; the filters and RRF are tested |
| C · serve | `rag/api.py`, `rag/cli.py`, `tests/test_api.py` (with `retrieve` monkeypatched) | the endpoints match [API.md](API.md); the CLI prints a table |
| D · eval | `rag/eval.py`, `data/gold/questions.jsonl` (draft), `data/glossary.yaml` (draft), `tests/test_eval.py` | the metrics are correct on a toy example |

**Step 3, main agent: integrate on the real pages.**
1. Run, in order:

   ```bash
   python -m rag.ingest
   python -m rag.index
   python -m rag.cli "<a question for each procedure>"
   python -m rag.eval
   pytest
   ```

2. Fix whatever breaks.
3. Ask Belhaj to review the gold questions (5 minutes). Then remove `draft` and rerun the evaluation.
4. Write `reports/eval.md` and complete the README: setup, run steps, results table, limitations.
5. Commit, push `rag/prototype`, and open a pull request.

If the pages are not saved yet when integration starts, run the whole pipeline on the fixtures. Then rerun it as soon as the pages arrive.

## Done when

- [ ] `pytest` passes.
- [ ] `python -m rag.ingest` and `python -m rag.index` run on the saved pages.
- [ ] The CLI returns the right procedure first for one question in each procedure and each script.
- [ ] `uvicorn rag.api:app --port 8001` serves `/health`, `/retrieve` and `/procedures`.
- [ ] `reports/eval.md` has the table comparing the 3 search modes, on gold questions reviewed by Belhaj.
- [ ] A pull request from `rag/prototype` to `main` is open, with the demo output and the eval table.

## Next, after the prototype (not now)

Add laws and decrees with one chunk per article («الفصل»), version dates and an amendments table. Then add OCR for scans (Docling, Tesseract `ara+fra`), the reranker `bge-reranker-v2-m3`, LLM query rewriting, and Postgres + pgvector. The reasons are in [background_research.md](background_research.md).
