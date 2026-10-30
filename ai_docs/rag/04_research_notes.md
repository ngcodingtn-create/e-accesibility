# RAG research notes (30 Oct 2026)

This is background for the choices in [01_spec.md](01_spec.md). Each item is tagged:

- **[W]**: checked on the web on 30 Oct 2026.
- **[M]**: from memory. Confirm it before you rely on it.

## Tunisian sources

- **IORT / JORT** [W]
  - Decree-law 2020-1 makes iort.gov.tn the official electronic Official Journal (JORT), free to access and download.
  - The **Arabic text is authoritative**. French versions are for information only.
  - The JORT is published every Tuesday and Friday.
  - Older issues are scanned PDFs.
- **legislation.tn** [W]: launched in 2014 by the Presidency of the Government. It holds legal texts and circulars.
  - iort.gov.tn and legislation.tn both refused HTTPS connections from a non-Tunisian network during research. Test them from Tunisia, or save pages manually.
- **Idaraty (idaraty.tn)** [W]: a procedures knowledge base in French and Arabic.
  - Each procedure has: summary, prerequisites, steps, legal sources, related procedures, and a last-updated date.
  - It has a "Jeux de données" link and terms of use (CGU), but no API was found.
  - **It is the best seed for the prototype.**
  - Example page: https://idaraty.tn/fr/procedures/creation-compte-e-citoyen-e-mouwaten
- **9anoun.tn** [W]: the Idaraty and parliament (ARP) sites link to it as the national legal database. It timed out when fetched, so its structure and terms are unchecked.
- **data.gov.tn** [W]: relaunched in 2023 with about 2,484 datasets. Legal texts are generally not offered there as open data.
- **Expect procedures to change** [W]: a 2025–2027 government plan aims to simplify about 2,250 procedures. This is why version tracking matters.

## Why versioning is mandatory

- **"Temporal misgrounding" benchmark** (French tax law, 32,436 article versions) [W]: https://papers.cool/arxiv/2608.09393
  - RAG over current text only: **2.7%** accuracy on date-specific questions.
  - A version-aware index: **98.3%**.
- **Graph approaches** [W]: SAT-Graph RAG and FRBR/LRMoo-style models treat each amendment as an event that creates a new version. https://arxiv.org/html/2506.07853v4
  - The student-sized equivalent is the `amendments` table in SQL plus `valid_from` / `valid_to` filters.

## OCR (later milestone)

- **KITAB-Bench, Arabic OCR CER** (ACL Findings 2025) [W]: https://arxiv.org/abs/2502.14949
  - Gemini-2.0-Flash 0.13, GPT-4o 0.31, Tesseract 0.54, PaddleOCR 0.79.
  - Overall, vision LLMs are about 60% better than classic OCR.
- **Qari-OCR** (open, Qwen-VL based) [W]: https://arxiv.org/abs/2506.02295
  - CER 0.061 on its own test set.
  - On the independent SARD benchmark: Mistral OCR 0.051, Qari 0.158, Tesseract 0.162.
- **Born-digital PDFs**: extract the text directly with PyMuPDF; no OCR needed [M]. Measure CER on hand-checked pages before choosing an OCR tool.

## Retrieval

- **BGE-M3** [W]: dense, sparse and multi-vector retrieval in one model, 100+ languages, 8k context, strong cross-lingual results. https://huggingface.co/BAAI/bge-m3
- **Arabic-specific embedders** [W]: Swan / ArabicMTEB (dialect-aware), and Arabic fine-tunes of Qwen3-Embedding. Try them only if BGE-M3 is weak on Derja. https://arxiv.org/abs/2411.01192
- **Reranker** [M]: bge-reranker-v2-m3. For Arabic RAG, a reranker substantially improved faithfulness [W]. https://arxiv.org/abs/2506.06339
- **Arabic RAG leaderboard** [W]: https://huggingface.co/blog/Navid-AI/arabic-rag-leaderboard
- **No Derja retrieval benchmark was found** [W]. Handle Derja questions with query rewriting and a glossary. Derja instructions for testing:
  - TounsiBench (744 instructions): https://aclanthology.org/2025.emnlp-main.1756/
- **BM25 for Arabic** [M]: needs normalization (diacritics, alef/ya/ta marbuta), plus light stemming if recall is low. Fuse BM25 and dense results with RRF (k=60).

## Evaluation

- **Retrieval** [M]: Recall@5/10, MRR@10 and nDCG@10, broken down by question language.
- **Citations** [M]: does the cited `chunk_id` match the gold one? Was the version in force the one cited?
- **Abstention** [M]: does the system abstain when nothing relevant exists?
- **Method** [W]: check citations deterministically (ID matching) wherever possible, not with an LLM judge.
- **Ablations** [M]: BM25 vs dense vs hybrid vs +glossary vs +rerank.
