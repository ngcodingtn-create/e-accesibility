# Prompt for Belhaj's agent

Before you start:
1. Accept the GitHub invitation to the repository.
2. Open Claude Code in an empty folder.
3. Paste everything below the line.
4. While the agent works, save the 3 procedure pages as described in `ai_docs/rag/PLAN.md` → "The documents". It takes about 5 minutes.

---

You are the coding agent for **Belhaj**, who owns the knowledge base (RAG) of our college project. The project is an assistant that answers questions about Tunisian government procedures in Derja.

Goal: a **minimal RAG prototype, working end to end on a few documents, as fast as possible**. Do not build anything beyond the plan.

0. Check that `git` and Python 3.10 or newer are installed (`git --version`, then `python --version` or `py --version` on Windows). If one is missing, tell Belhaj exactly how to install it, then continue.
1. Clone the repo and create a branch:

   ```
   git clone https://github.com/ngcodingtn-create/e-accesibility.git
   cd e-accesibility
   git checkout -b rag/prototype
   ```

2. Read these three files. Nothing else is required:
   - `ai_docs/00_project_overview.md`
   - `ai_docs/rag/PLAN.md`
   - `ai_docs/rag/API.md`
3. Follow PLAN.md → "Run it in parallel":
   - **Step 1.** Scaffold the project and write the schema, stubs and fixtures. Commit.
   - Then tell Belhaj to save the pages, and do not wait for him.
   - **Step 2.** Launch the **4 subagents (A ingest, B search, C serve, D eval) in a single message** so they run in parallel. Each one gets:
     - its own row of the table
     - the chunk schema
     - the module signatures
     - the instruction to edit only the files it owns
   - **Step 3.** When they finish, integrate and run the full pipeline on the saved pages (or on the fixtures, if the pages are not there yet). Fix problems, write the eval report and the README, push `rag/prototype`, and open a pull request to `main`.
     - Use `gh pr create` if the GitHub CLI is available.
     - Otherwise, give Belhaj the link https://github.com/ngcodingtn-create/e-accesibility/compare/main...rag/prototype and the PR text to paste.
4. Rules:
   - Never fetch idaraty.tn or any other government website. Its robots.txt blocks AI crawlers. Work only from the files Belhaj saves in `services/rag/data/raw/`.
   - Never write or invent procedure content. You may draft the glossary and the gold questions, but they must be marked as drafts for Belhaj to review.
   - Work only in `services/rag/`. Never push to `main`, and never merge.
   - Everything must run on a laptop CPU, with no paid APIs. If downloading `BAAI/bge-m3` is too slow, set `RAG_EMBED_MODEL=intfloat/multilingual-e5-small`.
   - Commit after each step, with clear messages.
   - Belhaj is needed only twice: to save the pages at the start, and to review the gold questions at the end. Ask him only then, unless you are truly blocked.
5. Start now. Tell Belhaj the plan in 3 lines, then begin Step 1.
