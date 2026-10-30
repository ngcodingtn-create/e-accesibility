# RAG prototype: tasks

Work through the tasks in order. After each task:

1. Run `pytest`.
2. Commit on the `rag/prototype` branch, with a message like `rag: T3 parse idaraty pages`.
3. Update `ai_docs/rag/PROGRESS.md` with what was done, what is blocked, and any questions for Belhaj.

**Minimal demo path, do these first:** T0 → T1 → T2 → T3 → T4 → T5a (BM25) → T6 → T7 → T9. Then do T5b (dense), T8 (eval) and the stretch tasks.

Steps marked 🧑 need Belhaj. Stop, ask, and wait. Do not guess.

---

### T0. Scaffold `services/rag/`
- Create:
  - `pyproject.toml` (Python 3.11)
  - `src/rag/` package
  - `tests/`
  - `data/{raw,processed,metadata,gold}/`
  - `reports/`
  - `Makefile` with targets `setup ingest index serve eval test`
  - `.gitignore` (ignore `data/raw/`? **no**: raw sources are committed so results are reproducible; ignore `*.db`, `*.npy`, `.env`, `.venv`)
  - `README.md`
- Create `ai_docs/rag/PROGRESS.md`.
- **Done when:** `make setup && make test` passes with one placeholder test.

### T1. Source registry
- Create `data/sources.yaml`. For each of the 5 procedures (`cin`, `birth_certificate`, `passport`, `residence_certificate`, `criminal_record_b3`), list:
  - the Idaraty procedure page URLs (fr and ar)
  - the legal texts the page cites (title, number, URL if known)
- You may browse idaraty.tn to find candidate URLs. First check robots.txt and the terms of use (CGU), and record what you found in PROGRESS.md.
- 🧑 Belhaj confirms the URL list before T2 runs at scale.
- **Done when:** sources.yaml has 5 procedures with at least the Idaraty pages, and Belhaj has approved it.

### T2. Polite fetcher with manual fallback
- `rag.fetch`:
  - downloads each URL into `data/raw/<doc_id>.<ext>`
  - sends a clear User-Agent and waits 2 s between requests
  - skips files that already exist
  - stores `source_url`, `retrieved_at` and `sha256` in `data/raw/manifest.jsonl`
- If a site refuses the connection or blocks it (iort.gov.tn and legislation.tn may be unreachable from outside Tunisia):
  - log it
  - 🧑 ask Belhaj to save the page manually into `data/raw/` with the expected filename
  - `make ingest` must then work from the manual files.
- **Done when:** the raw files for the 5 Idaraty procedures are present and listed in the manifest.

### T3. Parsers
- `rag.parse.idaraty`: procedure page → a `Procedure` record (fields as in the API contract) plus one chunk per section.
  - Fields that are missing stay `null`.
  - Write unit tests on one saved page.
- `rag.parse.legal`: HTML or born-digital PDF (PyMuPDF) → one chunk per article.
  - Split on `الفصل N` / `Article N`.
  - Prepend `hierarchy_path`.
  - Write a unit test with a small fixture text.
- Output: `data/processed/procedures.jsonl` and `data/processed/chunks.jsonl`.
- **Done when:** every procedure has its section chunks, and the tests pass.

### T4. Storage and version metadata
- Create the SQLite schema exactly as in [01_spec.md](01_spec.md).
- Write a loader from the processed JSONL files.
- Create `data/metadata/versions.yaml`, which sets `valid_from`, `valid_to`, `status` and `article_uid` per chunk or per document.
  - The default is `status: unknown`.
  - 🧑 Belhaj fills in the real values.
- `as_of` filter: `(valid_from IS NULL OR valid_from <= :as_of) AND (valid_to IS NULL OR valid_to > :as_of) AND status != 'abrogated'`.
- **Done when:** `make ingest` builds `rag.db`, and a test proves an abrogated chunk is never returned.

### T5a. BM25 index
- Write the Arabic/French normalizer described in the spec, with unit tests that cover each mapping.
- Build a `bm25s` index over the normalized chunk text and save it to disk.
- **Done when:** `make index` builds it, and a test query «جواز السفر» returns a passport chunk first.

### T5b. Dense index
- Embed the chunks with `BAAI/bge-m3`. Save `embeddings.npy` and the matching `chunk_ids`.
- Search by cosine similarity with numpy.
- Cache embeddings so that only new or changed chunks are re-embedded.
- **Done when:** a French query "passeport pièces à fournir" and an Arabic query both return passport chunks in the top 3.

### T6. Hybrid retriever
- `rag.retrieve(query, raw_query, procedure_id, as_of, top_k, langs, rerank)`:
  1. Normalize the query.
  2. Expand it with `data/glossary.yaml` (🧑 Belhaj owns the glossary content; the agent may draft entries marked `# draft`).
  3. Take the top 50 from BM25 and the top 50 from the dense index, for each query variant.
  4. Fuse them with RRF (k=60).
  5. Apply the `as_of` and `langs` filters, plus `procedure_id` if given.
  6. Rerank with `bge-reranker-v2-m3` if `rerank` is true.
  7. Return the top_k.
- Set `below_threshold` from a configurable score threshold.
- **Done when:** unit tests cover fusion, filtering and the threshold.

### T7. API
- FastAPI app `rag.api:app` implementing [03_api_contract.md](03_api_contract.md) exactly, on port 8001.
- Write request/response models with pydantic.
- **Done when:** contract tests with `TestClient` pass for every endpoint and error case.

### T8. Gold set and evaluation
- `data/gold/questions.jsonl` in the format given in the spec.
  - The agent drafts 10 questions per procedure, mixing Derja in Arabic script, Arabizi, French and MSA, plus 3 out-of-scope questions. Every draft is marked `"draft": true`.
  - 🧑 Belhaj reviews and corrects them, then removes `draft`.
- `rag.eval` computes Recall@5 and MRR@10 overall and per language, with the ablations BM25 / dense / hybrid / +glossary / +rerank.
- It writes `reports/eval_<date>.md`.
- **Done when:** `make eval` produces the report from the approved questions.

### T9. Demo CLI and README
- `python -m rag.cli "<question>" [--as-of DATE] [--rerank]` prints a ranked table with title, section/article, status, source URL and the first 200 characters of the text.
- In the README, cover:
  - setup
  - the data sources and their terms
  - how to add a procedure
  - how to run the eval
  - known limitations
- Open a PR from `rag/prototype` to `main` with a short summary, and the eval table once it exists. **Do not merge.**
- **Done when:** a fresh clone can follow the README to a working demo.

---

## Stretch tasks (after the minimal demo works)

- **S1. LLM query rewriting:** turn a Derja question into one formal Arabic query and one French query, then fuse the results. Make the provider pluggable through an environment variable. It must be off by default and the prototype must work without it.
- **S2. OCR for scanned PDFs:** Docling, with Tesseract `ara+fra` as a baseline. Measure CER on 10 hand-transcribed pages before choosing a tool.
- **S3. Amendments:** detect «يُلغى» / «تُنقّح أحكام الفصل» / «abrogé» / «modifié» to propose rows for the `amendments` table, which 🧑 Belhaj then confirms.
- **S4. Migrate storage** to Postgres + pgvector or Qdrant, and add a `docker-compose.yml`.
- **S5. More procedures:** add the next most-requested procedures from Idaraty.
