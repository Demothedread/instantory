🌐 GlobalRules.md – LLM Code Assistant Protocol

⸻

📋 1. Pre‑Flight Context Ingestion
•Directory Scan: Recursively index all project files (src, config, docs, README, tests, env).
•File Sampling: Read first 20–40 lines from entry points, recent edits, task‑relevant files.
•Project Intent Detection: Identify app type (web/API/script/etc.); prompt if ambiguous.
•Build Project Map: Visual graph of modules, classes, entry points, dependencies.

🧭 2. Sequential Thinking & Step‑and‑Plan RAG
•Operate using sequential thinking: break tasks into steps.
•Use advanced RAG or Step‑and‑Plan:
1.Interpret / breakdown assignment.
2.Retrieve context per step.
3.Generate targeted output.
4.Track progress, then iterate to next sub‑task.

🧵 3. Continuity & Context Window Management
•Maintain short‑term context pointer to last N interactions.
•Prevent iterative drift: carry context forward, avoid revisiting resolved issues.
•Trigger "Context Shift" alert if context window max approach.
•For fatal errors: auto‑resolve or flag; for warnings/spelling: defer.

🚧 4. Minimal‑Intrusive Edits & Elegance
•Fail‑safe approach: propose patches before rewrites; refactor only if essential.
•Prefer elegance and efficiency over exhaustive edge cases.
•Avoid large diffs; always include patch previews (unified diff or code snippet).
•Diff-first: present plan → await approval → apply changes.

🧷 5. Naming, Sorting & Code Style
•Naming: use domain‑prefix conventions.
•Alphabetical ordering: for class lists, definitions, CSS rules.
•CSS guidance: declare global variables; suggest theming alternatives.

🪢 6. Module Size & Documentation
•Keep each module ≤ 300 logical lines.
•Use JSDoc‑style docstrings and inline explanations.
•Every project: include README (synopsis, prerequisites, deployment, start, FAQ, use‑cases).
•Include end‑to‑end testing suite with coverage and run instructions.

🧠 7. Assumptions, TODOs & Logging
•Tag assumptions as ASSUME: in comments/log.
•TODOs must include Reason/Back‑context; security‑sensitive ones tagged TODO:SecVal.
•Maintain change log (Chg: YYYY/MM/DD) and prune quiet/stale logs regularly.

📦 8. Dependency & Import Handling
•Tag only third‑party imports.
•Validate dependencies: flag duplicates, deprecated, or unused.
•Provide suggestions or safe alternatives.

🧪 9. Validation, Testing & Linting
•Validation pipeline: Lint → Unit‑test → Isolate (<5 lines) → report results.
•For CSS files: suggest fallback and alternative rules.
•For fatal build/test errors: auto‑resolve or escalate.
•Non‑fatal: log and proceed.

⚡10. Auto-Iteration & Termination
•Allow auto‑iteration: loop through tasks until completion or user‑stop.
•Prevent infinite loops: cap attempts per issue; escalate or admit limitation.
•Track iteration count and context status.

🤖11. Multi‑Agent (Swarm) Strategy
•When project size warrants, spawn specialized agents:
•Maestro: oversees architecture and orchestration.
•Network: manages interactions across modules/layers.
•Project‑Specific: e.g., DB‑Agent, API‑Agent, UI‑Agent.
•Agents share context and hand off tasks under Maestro supervision.

⚙️12. Rule Precedence & Overrides
•These are default/global rules.
•Local/project‑level or later rules override these.
•When conflicts occur: apply the more specific or most recent rule.

💻 13. Language-Specific Coding Standards

**Python:**
•Follow PEP 8 guidelines strictly.
•Use `asyncio` and `async/await` patterns for non-blocking, concurrent operations.
•Implement robust exception handling with clear, informative logging using the standard `logging` module configured for structured output (e.g., JSON logs) with appropriate log levels (DEBUG, INFO, WARNING, ERROR).
•Organize backend code following a modular architecture pattern with clear separation between API routes, data access layers, and integrations.
•Respect distinct middleware and route structures located under `/middleware` and `/routes` respectively.

**JavaScript/TypeScript:**
•Use camelCase for variable and function names; PascalCase for React components.
•Prefer functional components with React Hooks for state and lifecycle management.
•Maintain clear separation of concerns between presentation components (UI) and container components (business logic).
•Follow a scalable folder structure:
  ```
  /src
    /components
    /hooks
    /contexts
    /services
    /styles
    /utils
  ```
•Use TypeScript where applicable for type safety and maintainability.

🔐 14. Security & Quality Standards
•Code suggestions must consider secure practices, including validating inputs, avoiding hardcoded secrets, and using environment variables.
•Validate and sanitize all user inputs.
•Implement proper error handling and security measures.
•Generate commit messages following the Conventional Commits specification (e.g., `feat(api): add vector search endpoint`).
•Always include inline comments explaining non-obvious logic to help maintain clarity.

⸻

✔️ Quick Start Summary

| Phase | Behavior |
|-------|----------|
| Preflight | Map project, ingest code, detect intent |
| Planning | Sequential Step‑and‑Plan with RAG; restate task & ambiguities |
| Execution | Minimal patch-first edits; JSDoc; alphabetical ordering; logging |
| Validation | Lint → test → isolate; auto‑resolve errors, defer warnings |
| Iteration | Iterate tasks with context-carry; cap loops; multi-agent if needed |
| Documentation | README, context log, inline docs, TODOs with context, change logs |

⸻

End of GlobalRules.md. This document is ready for direct inclusion in your repo or agent configuration.
