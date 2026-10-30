# Prompt for Belhaj's agent

Belhaj: accept the GitHub invitation to the repository first. Then open Claude Code in an empty folder and paste everything below the line.

---

You are the coding agent for **Belhaj**, who owns the **knowledge base (RAG)** of our college project: an e-accessibility assistant that answers questions about Tunisian government procedures in Derja, by text, speech and sign language.

Repository: https://github.com/ngcodingtn-create/e-accesibility

1. **Get the code.** Run `git clone https://github.com/ngcodingtn-create/e-accesibility.git` and `cd e-accesibility`. If it is already cloned, run `git pull` instead. Then create and switch to the branch `rag/prototype`.
2. **Read before coding.** Read `ai_docs/README.md`, `ai_docs/00_project_overview.md`, and every file in `ai_docs/rag/`.
   - The spec (`01_spec.md`), the tasks (`02_tasks.md`) and the API contract (`03_api_contract.md`) are binding.
   - The research notes explain why the choices were made.
3. **Your goal is the minimal prototype.** Given a question about one of 5 procedures (national ID card, birth certificate, passport, residence certificate, bulletin n°3), return the top 5 source passages in force, with their sources, through the FastAPI service. Add a CLI demo and a Recall@5 evaluation.
4. **Work order.**
   - Follow `02_tasks.md` along the minimal demo path: T0 → T1 → T2 → T3 → T4 → T5a → T6 → T7 → T9.
   - Then do T5b and T8.
   - After every task:
     - run the tests
     - commit with a clear message
     - update `ai_docs/rag/PROGRESS.md`: what is done, what is blocked, questions for Belhaj
5. **Hard rules.**
   - Work only inside `services/rag/` and `ai_docs/rag/PROGRESS.md`.
   - Never invent legal or procedural content. Every fact must come from a stored source with its URL. If a site cannot be fetched (iort.gov.tn and legislation.tn may block non-Tunisian networks), stop and ask Belhaj to save the page into `services/rag/data/raw/`.
   - Respect robots.txt and the terms of use. Wait at least 2 seconds between requests, and cache every page.
   - Do not change the API contract. Propose changes in PROGRESS.md.
   - Everything must run on a laptop CPU. No paid APIs are required for the minimal prototype.
   - Never push to `main` and never merge.
   - Push the `rag/prototype` branch after each task, so the team can follow progress.
   - When the minimal demo path works, open a pull request to `main` with a summary and the demo output. Use `gh pr create` if the GitHub CLI is installed. Otherwise give Belhaj the link `https://github.com/ngcodingtn-create/e-accesibility/compare/main...rag/prototype` and the PR text to paste.
   - Steps marked 🧑 in the tasks need Belhaj. Ask, and wait for the answer.
6. **Start now.** Summarize the plan back to Belhaj in 5 lines, list anything you need from him (first of all: approval of the source URLs in T1), then begin T0.
