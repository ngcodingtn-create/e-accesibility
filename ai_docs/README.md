# ai_docs

Instructions for the AI coding agents working on this repository. Humans can read them too; they are the shared source of truth for scope, interfaces and conventions.

Read in this order:

1. [00_project_overview.md](00_project_overview.md): what the whole system is, who owns what, and the rules every agent follows.
2. The folder for your workstream:
   - [rag/](rag/): knowledge base and retrieval (owner: **Belhaj**)
     - [01_spec.md](rag/01_spec.md): scope, architecture and data model of the minimal prototype
     - [02_tasks.md](rag/02_tasks.md): ordered tasks with acceptance criteria
     - [03_api_contract.md](rag/03_api_contract.md): the HTTP interface the Derja LLM calls (do not change it without asking)
     - [04_research_notes.md](rag/04_research_notes.md): sources, tools and the reasoning behind the choices
     - [AGENT_PROMPT.md](rag/AGENT_PROMPT.md): the prompt to start the agent with
     - `PROGRESS.md`: created and kept up to date by the agent

Other workstreams (TTS by Ayhem, LLM / ASR / sign / UI / MLOps by Med Amine) will get their own folders here.
