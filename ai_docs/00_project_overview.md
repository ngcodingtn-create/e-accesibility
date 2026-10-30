# Project overview: e-Accessibility pipeline for Tunisian government services

## What we are building

A citizen asks a question about an administrative procedure (national ID card, birth certificate, passport, ...) in Tunisian Derja, by **text** (Arabic script or Arabizi), **speech**, or **Tunisian Sign Language (LST)**. The system:

1. Converts every input into one normalized text request.
2. Has a **Derja LLM** identify the procedure and call the **knowledge base** to fetch the official rules currently in force.
3. Writes an answer in Derja that uses only the retrieved rules and cites them.
4. Returns the answer in the citizen's channel: accessible text, Derja speech (VoxCPM), or a signing avatar.

A continuous-improvement loop (telemetry → dashboards → failure mining → annotation → retraining → evaluation gate → registry → canary deploy) improves every model. Nothing reaches a citizen without passing the evaluation gate.

```
                 ┌────────────── Knowledge base (RAG) ──────────────┐
                 │ official docs → OCR/parse → chunk + versions →   │
                 │                         hybrid retrieval         │
                 └──────────────────────▲──────────┬───────────────┘
                               what to look up  relevant articles
text  ─► normalizer ─┐                  │          ▼
speech ─► Derja ASR ─┼─► normalized ─► Derja LLM ─► grounded ─┬─► accessible text
sign  ─► sign recog ─┘    request      (route, tools,  answer  ├─► Derja TTS (VoxCPM)
                                        ground, handoff)       └─► 3D sign avatar
```

## Team and ownership

| Owner | Workstream | Status (30 Oct 2026) |
|---|---|---|
| **Ayhem** | Derja speech synthesis (VoxCPM fine-tune) | Working prototype, quality being improved |
| **Belhaj** | Knowledge base: sources, parsing, chunking + versioning, hybrid retrieval | Minimal prototype starting (this folder: `ai_docs/rag/`) |
| **Med Amine** | Arabizi normalizer, Derja ASR, Derja LLM + grounding, sign channel, accessible UI, MLOps loop, integration | Research and architecture done, build starts with the text spine |

## Repository layout (monorepo)

```
ai_docs/            instructions for agents (this folder)
services/rag/       knowledge base + retrieval API      (Belhaj)
services/tts/       VoxCPM Derja TTS                    (Ayhem)
services/llm/       Derja LLM, routing, grounding       (Med Amine)
services/asr/       Derja speech recognition            (Med Amine)
services/web/       accessible front end                (Med Amine)
```

Each service is a self-contained Python project (or JS for `web`) with its own README, tests and dependencies. Services talk over HTTP with JSON, and the contracts live in `ai_docs/<service>/API.md`.

## Rules every agent follows

1. **Never invent legal or procedural content.** Every fact about a procedure must come from a source document that is stored in the repo with its URL and retrieval date. If a source cannot be fetched, stop and ask the human owner to provide it.
2. **Work only inside your own service folder.** Do not edit other services or `ai_docs/`.
3. **Do not change an API contract on your own.** Propose the change in your pull request and ask the owner.
4. **Work on a branch and open a pull request. Never push to `main`, and never merge.**
5. **Do not crawl government websites.** Idaraty's robots.txt blocks AI crawlers. Source pages are saved by hand by the human owner. Their URLs are committed to the repo, but the pages themselves are not (the repo is public).
6. **Use only licenses we can deploy.** Prefer Apache-2.0 or MIT models and libraries. Non-commercial (NC) models may be used only as evaluation baselines, and must be labeled as such.
7. **Do not commit personal data or secrets.** No real citizen data, and no API keys. Use `.env` files, listed in `.gitignore`.

## Text conventions (shared across all services)

- Derja is written in **Arabic script**. French and English words stay in **Latin script** (e.g. `باش نعمل passeport`). Arabizi is converted to this form at the input and never stored as the canonical text.
- Legal articles in Tunisian Arabic legal texts are called **«الفصل»** (fasl), not «المادة». In French they are "Article".
- The Arabic version of a legal text is authoritative. French versions are for information only.
- Use ISO dates (`YYYY-MM-DD`). Use `aeb` as the language code for Tunisian Arabic, `ar` for formal Arabic (MSA), and `fr` for French.
