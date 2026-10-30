# ai_docs

Instructions for the AI coding agents working on this repository. Humans can read them too; they are the shared source of truth for scope, interfaces and conventions.

Read in this order:

1. [00_project_overview.md](00_project_overview.md): what the whole system is, who owns what, and the rules every agent follows.
2. The folder for your workstream:
   - [rag/](rag/): knowledge base and retrieval (owner: **Belhaj**)
     - [AGENT_PROMPT.md](rag/AGENT_PROMPT.md): the prompt to start the agent with
     - [PLAN.md](rag/PLAN.md): goal, documents, design and parallel work plan for the minimal prototype
     - [API.md](rag/API.md): the HTTP interface the Derja LLM calls (do not change it without asking)
     - [background_research.md](rag/background_research.md): optional; sources and reasoning for later milestones

   - [tts/](tts/): Derja speech synthesis (owner: **Ayhem**)
     - [README.md](tts/README.md): everything done so far — the VoxCPM2 fine-tune, the Tn-TTS dataset, measured statistics, gaps and next steps
     - [API.md](tts/API.md): the proposed HTTP interface for synthesis

Med Amine's workstreams (LLM / ASR / sign / UI / MLOps) will get their own folders here.
