# RAG API contract (v0.1)

This is the interface between the knowledge base (Belhaj) and the Derja LLM (Med Amine). **Do not change it without agreement from both owners.** Propose changes in `PROGRESS.md`.

Base URL in development: `http://localhost:8001`

## `GET /health`

Response:

```json
{ "status": "ok", "chunks": 412, "procedures": 5, "index_built_at": "2026-10-30T14:02:00Z" }
```

## `POST /retrieve`

Request:

```json
{
  "query": "شنوّة لازمني باش نعمل passeport؟",
  "raw_query": "chnowa lazemni bech na3mel passeport?",
  "procedure_id": null,
  "as_of": "2026-10-30",
  "top_k": 5,
  "langs": ["ar", "fr"],
  "rerank": false
}
```

| Field | Type | Required | Meaning |
|---|---|---|---|
| `query` | string | yes | Normalized question (Derja in Arabic script, French in Latin script) |
| `raw_query` | string | no | The citizen's original text. Also searched, then fused |
| `procedure_id` | string or null | no | If the LLM router already knows the procedure, restrict the search to it |
| `as_of` | ISO date | no, default today | Return only chunks in force on this date |
| `top_k` | int 1–20 | no, default 5 | |
| `langs` | list of `ar` / `fr` | no, default both | Document languages to search |
| `rerank` | bool | no, default false | Apply the cross-encoder reranker |

Response:

```json
{
  "results": [
    {
      "chunk_id": "idaraty:passport:fr#documents",
      "doc_id": "idaraty:passport:fr",
      "doc_type": "procedure_page",
      "title": "Délivrance du passeport ...",
      "article_no": "documents",
      "hierarchy_path": "Passeport > Pièces à fournir",
      "procedure_ids": ["passport"],
      "lang": "fr",
      "text": "...",
      "source_url": "https://idaraty.tn/...",
      "valid_from": null,
      "valid_to": null,
      "status": "in_force",
      "score": 0.0312,
      "retrievers": ["bm25", "dense"]
    }
  ],
  "expanded_queries": ["جواز السفر", "passeport"],
  "as_of": "2026-10-30",
  "below_threshold": false,
  "latency_ms": 184
}
```

- `score` is the fused RRF score, or the reranker score when `rerank=true`. Higher is better.
- `below_threshold: true` means nothing relevant was found (the top score is under the calibrated threshold). The LLM must then refuse or hand off instead of answering.
- `status` is one of `in_force`, `amended`, `abrogated`, `unknown`. Chunks that are not in force on `as_of` are never returned.

## `GET /procedures`

```json
[{ "procedure_id": "passport", "title_ar": "...", "title_fr": "..." }]
```

## `GET /procedures/{procedure_id}`

Structured data for one procedure, built from the procedure page. A field is `null` when the source doesn't say. Never guess.

```json
{
  "procedure_id": "passport",
  "title_ar": "...",
  "title_fr": "...",
  "summary": "...",
  "required_documents": ["..."],
  "steps": ["..."],
  "fees": "...",
  "where": "...",
  "delay": "...",
  "legal_basis": [{ "doc_id": "...", "title": "...", "source_url": "..." }],
  "source_url": "https://idaraty.tn/...",
  "source_last_updated": "2025-06-01",
  "retrieved_at": "2026-10-30"
}
```

## Errors

Error responses use standard HTTP status codes with a JSON body: `{ "error": "<code>", "detail": "<message>" }`.

- `400 invalid_request`: the request failed validation.
- `404 unknown_procedure`: there is no procedure with that ID.
- `503 index_not_built`: the index has not been built yet.
