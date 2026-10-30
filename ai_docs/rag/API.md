# RAG API (v0.1)

This is the interface between the knowledge base (Belhaj) and the Derja LLM (Med Amine). Change it only with both owners' agreement.

Run the service with:

```
uvicorn rag.api:app --port 8001
```

## `GET /health`

```json
{ "status": "ok", "chunks": 42, "procedures": 3, "embed_model": "BAAI/bge-m3" }
```

## `POST /retrieve`

Request (only `query` is required):

```json
{
  "query": "شنوّة لازمني باش نعمل passeport؟",
  "raw_query": "chnowa lazemni bech na3mel passeport?",
  "procedure_id": null,
  "as_of": "2026-10-30",
  "top_k": 5
}
```

Response:

```json
{
  "results": [
    {
      "chunk_id": "passport_fr#03",
      "procedure_id": "passport",
      "lang": "fr",
      "title": "Délivrance du passeport",
      "section": "Pièces à fournir",
      "text": "…",
      "source_url": "https://idaraty.tn/fr/procedures/…",
      "saved_on": "2026-10-30",
      "valid_from": null,
      "valid_to": null,
      "status": "in_force",
      "score": 0.0312,
      "retrievers": ["bm25", "dense"]
    }
  ],
  "expanded_queries": ["جواز السفر", "passeport"],
  "below_threshold": false,
  "latency_ms": 120
}
```

- `below_threshold: true` means nothing relevant was found. The LLM must then refuse or hand off instead of answering.
- Chunks that are not in force on `as_of` are never returned.

## `GET /procedures`

```json
[{ "procedure_id": "passport", "title": "Délivrance du passeport", "langs": ["fr"], "chunks": 14 }]
```

## Errors

Errors return `{ "error": "<code>", "detail": "<message>" }`:

| Status | Code | When |
|---|---|---|
| 400 | `invalid_request` | the request is malformed |
| 503 | `index_not_built` | the index has not been built yet; run `python -m rag.index` |
