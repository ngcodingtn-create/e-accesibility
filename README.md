# e-Accessibility for Tunisian government services

College project. A citizen asks about an administrative procedure in Tunisian Derja, by **text** (Arabic script or Arabizi), **speech** or **Tunisian Sign Language**. The system:

1. finds the official rule that is in force,
2. answers in Derja and cites its source,
3. replies in the same channel: accessible text, Derja speech (VoxCPM), or a signing avatar.

## Team

| Who | Workstream | Folder |
|---|---|---|
| Ayhem | Derja speech synthesis (VoxCPM) | `services/tts/` |
| Belhaj | Knowledge base and retrieval (RAG) | `services/rag/` |
| Med Amine | Derja LLM, Arabizi normalizer, speech recognition, sign channel, accessible UI, MLOps loop, integration | `services/llm/`, `services/asr/`, `services/web/` |

## Project site

**https://ngcodingtn-create.github.io/e-accesibility/**: architecture, the six axes of work and where each stands. The source is in `site/` (Next.js, static export). Every push to `main` that touches `site/` redeploys it.

```bash
cd site && npm install && npm run dev   # http://localhost:3010
```

## Where to start

- **Humans and AI agents:** read [ai_docs/README.md](ai_docs/README.md) first.
- **RAG agent:** follow [ai_docs/rag/AGENT_PROMPT.md](ai_docs/rag/AGENT_PROMPT.md).

## Working rules

- `main` only receives reviewed pull requests. Each workstream works on its own branch (e.g. `rag/prototype`).
- Never commit secrets, `.env` files or personal data.
