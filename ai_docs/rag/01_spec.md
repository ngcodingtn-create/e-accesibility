# RAG knowledge base: minimal prototype spec

Owner: **Belhaj**. Code lives in `services/rag/`.

## Goal of the minimal prototype

Given a citizen question about one of **5 procedures**, written in Derja (Arabic script), Arabizi, French or formal Arabic, return the **top 5 source passages that are in force**, each with its source and validity dates, through an HTTP API. Measure the result with Recall@5 on a small gold set.

The prototype is done when this command:

```bash
python -m rag.cli "chnowa lazemni bech na3mel passeport?"
```

prints the passport passages with their sources, and `make eval` prints a Recall@5 / MRR table.

## Scope

**In scope**
- 5 procedures:
  - `cin`: national ID card (carte d'identité nationale)
  - `birth_certificate`: extrait de naissance
  - `passport`: passport
  - `residence_certificate`: certificat de résidence
  - `criminal_record_b3`: bulletin n°3
- Procedure pages from **Idaraty** (idaraty.tn, French and Arabic). These pages list prerequisites, steps, sources and a last-updated date.
- The legal texts those pages cite, when they are available as HTML or born-digital PDF (from IORT / legislation.tn).
- Version metadata (`valid_from`, `valid_to`, `status`) filled in **by hand** in a YAML file.
- Hybrid retrieval: BM25 + dense embeddings + reciprocal rank fusion, filtered to the rules in force on a given date, with optional reranking.
- FastAPI service following [03_api_contract.md](03_api_contract.md).
- A gold set of 50+ questions and an evaluation script.

**Out of scope for now (later milestones)**
- OCR of scanned documents (Docling / Tesseract `ara+fra` / Qari-OCR). Born-digital PDFs only, using PyMuPDF.
- Ingesting the full JORT.
- Detecting amendments automatically.
- Generating answers. That is the Derja LLM's job (Med Amine). This service only retrieves.
- Production databases. Use SQLite now, with Postgres + pgvector or Qdrant later.

## Architecture

```
data/sources.yaml ──► fetch (polite, cached) ──► data/raw/*.html|pdf
                                                     │
                                         parse (idaraty / legal text)
                                                     │
                                  data/processed/{procedures,chunks}.jsonl
                                                     │
                     data/metadata/versions.yaml ──► load into SQLite (rag.db)
                                                     │
                         ┌───────────────────────────┴──────────────┐
                    BM25 index (bm25s,                     dense index (BGE-M3,
                    Arabic/French normalizer)              numpy .npy, cosine)
                         └──────────────┬───────────────────────────┘
query ─► normalize ─► glossary expansion ─► top-50 each ─► RRF (k=60)
      ─► filter in force on as_of ─► [optional rerank: bge-reranker-v2-m3] ─► top_k
                                                     │
                                         FastAPI  /retrieve  /procedures
```

## Data model (SQLite)

```sql
CREATE TABLE documents (
  doc_id        TEXT PRIMARY KEY,        -- e.g. "idaraty:passport:fr" or "loi:1975-40"
  doc_type      TEXT NOT NULL,           -- procedure_page | loi | decret | arrete | circulaire | form
  title         TEXT NOT NULL,
  number        TEXT,                    -- official number, e.g. "75-40"
  jort_ref      TEXT,                    -- JORT issue/date if known
  lang          TEXT NOT NULL,           -- ar | fr
  source_url    TEXT NOT NULL,
  retrieved_at  TEXT NOT NULL,           -- ISO date
  sha256        TEXT NOT NULL            -- hash of the raw file
);

CREATE TABLE chunks (
  chunk_id       TEXT PRIMARY KEY,       -- "<doc_id>#<section-or-article>"
  doc_id         TEXT NOT NULL REFERENCES documents(doc_id),
  article_uid    TEXT,                   -- shared by the ar and fr versions of the same article
  article_no     TEXT,                   -- "الفصل 5" / "Article 5" / section name for procedure pages
  hierarchy_path TEXT,                   -- "Loi 75-40 > Chapitre 2 > Article 5"
  section        TEXT,                   -- for procedure pages: summary|documents|steps|fees|where|delays|sources
  procedure_ids  TEXT NOT NULL,          -- JSON array, e.g. ["passport"]
  lang           TEXT NOT NULL,
  text           TEXT NOT NULL,          -- original text, header path prepended
  valid_from     TEXT,                   -- ISO date or NULL if unknown
  valid_to       TEXT,                   -- ISO date or NULL if still in force
  status         TEXT NOT NULL DEFAULT 'in_force'  -- in_force | amended | abrogated | unknown
);

CREATE TABLE amendments (
  src_doc_id      TEXT NOT NULL,         -- the text doing the change
  target_chunk_id TEXT NOT NULL,
  action          TEXT NOT NULL,         -- modifies | abrogates | replaces
  effective_date  TEXT NOT NULL
);

CREATE TABLE procedures (
  procedure_id  TEXT PRIMARY KEY,        -- cin | birth_certificate | passport | residence_certificate | criminal_record_b3
  title_ar      TEXT, title_fr TEXT,
  data_json     TEXT NOT NULL            -- structured fields, see 03_api_contract.md
);
```

## Chunking rules

- **Procedure pages**: one chunk per section (summary, required documents, steps, fees, where to apply, delays, legal sources). Prepend the procedure title to every chunk.
- **Legal texts**: one chunk per article. Split on `^\s*الفصل\s+\d+` (Arabic) and `^\s*(Article|Art\.)\s+\d+` (French). Prepend `hierarchy_path`. Never split an article across chunks.
- **Tables**: keep a table as one chunk, rendered as Markdown with its caption.
- Every chunk keeps a link to its `source_url`.

## Text normalization (index side and query side)

Used for BM25 and the glossary. The stored `text` stays original.

- Arabic:
  - remove diacritics (harakat) and tatweel `ـ`
  - map `أ إ آ ٱ` → `ا`, `ى` → `ي`, `ة` → `ه`, `ؤ` → `و`, `ئ` → `ي`
  - map Arabic-Indic digits to Western digits
- Latin: lowercase, fold accents (`é` → `e`), and split `d'identité` → `d identite`.
- Arabizi digits in the query (only when the token mixes Latin letters and digits): `3`→`ع`, `7`→`ح`, `9`→`ق`, `5`→`خ`, `8`→`غ`, `2`→`ء`. Also keep the raw form as a second query. A proper Arabizi normalizer is Med Amine's task; this is only a fallback.

## Glossary expansion

`data/glossary.yaml` maps Derja / Arabizi / colloquial terms to formal terms in Arabic and French. Belhaj writes and checks it. Example entry (the agent may propose entries, and Belhaj verifies them):

```yaml
passport:
  derja: ["باسبور", "passeport", "paspor"]
  ar: ["جواز السفر"]
  fr: ["passeport"]
cin:
  derja: ["لاكارط", "la carte", "بطاقة التعريف"]
  ar: ["بطاقة التعريف الوطنية"]
  fr: ["carte d'identité nationale", "CIN"]
```

When a query matches a glossary term, also search with the formal Arabic and French terms. Fuse all result lists with RRF.

## Tech choices

| Need | Choice | Why |
|---|---|---|
| Language / packaging | Python 3.11, `uv` (or pip + venv) | simple, reproducible |
| API | FastAPI + pydantic v2 | typed contract, auto docs |
| Storage | SQLite (stdlib `sqlite3`) | no server needed for a prototype |
| Keyword search | `bm25s` | fast, pure Python |
| Embeddings | `BAAI/bge-m3` (via `FlagEmbedding` or `sentence-transformers`) | multilingual (ar/fr), strong cross-lingual retrieval, MIT license |
| Reranker (optional) | `BAAI/bge-reranker-v2-m3` | multilingual, Apache-2.0 |
| PDF text | `pymupdf` | born-digital PDFs |
| HTML parsing | `httpx` + `selectolax` or `beautifulsoup4` | |
| Tests | `pytest` | |

Everything must run on a laptop CPU. BGE-M3 on CPU is fine for a few thousand chunks. Cache the embeddings.

## Evaluation

The gold set lives at `data/gold/questions.jsonl`, one JSON object per line:

```json
{"qid": "q001", "question": "chnowa lazemni bech na3mel passeport?", "lang": "aeb-latn", "procedure_id": "passport", "gold_chunk_ids": ["idaraty:passport:fr#documents"], "as_of": "2026-10-30", "notes": "Arabizi"}
```

- At least 50 questions: 10 per procedure, mixed across Derja in Arabic script, Arabizi, French and formal Arabic. Add at least 3 out-of-scope questions with `gold_chunk_ids: []`.
- **Belhaj writes or approves every gold question and label.** The agent may draft them but must mark them `"draft": true`.
- Metrics: Recall@5, MRR@10, and for out-of-scope questions whether the top score falls below the threshold. Report them overall and per `lang`.
- Ablation table: BM25 only, dense only, hybrid, hybrid + glossary, hybrid + glossary + rerank.
- Output: `reports/eval_<date>.md`.

## Definition of done (minimal prototype)

- [ ] `make setup && make ingest && make index` work from a clean clone.
- [ ] The 5 procedures are ingested with sources, and versions are filled in for every chunk (`unknown` is allowed but counted).
- [ ] `uvicorn rag.api:app` serves the endpoints in the contract, and `/docs` shows them.
- [ ] `python -m rag.cli "<question>"` prints the top 5 results with source URL and status.
- [ ] `make eval` writes the ablation report, and the gold set has at least 50 human-approved questions.
- [ ] README explains setup, the data sources and their licenses/terms, and how to add a procedure.
- [ ] A PR is open from `rag/prototype` to `main`.
