# github/copilot-instructions.md
# Bartleby Project Custom Instructions

Bartleby is an AI-powered document and image management system. The system features:
- **Backend:** Built on Python using the Quart framework with asynchronous I/O for efficient processing.
- **Frontend:** A React application hosted on Vercel, featuring a modern "Neo-deco-rococo" design.
- **AI Integration:** Uses OpenAI's API for content analysis and vector search with Neon PostgreSQL.

## Coding and Design Standards

- **Python:**
  - Follow PEP 8 guidelines.
  - Use `asyncio` and `async/await` patterns for non-blocking operations.
  - Apply robust exception handling with clear, informative logging.

- **JavaScript/TypeScript (React):**
  - Use camelCase for variable names and PascalCase for React components.
  - Prefer functional components and React Hooks.
  - Maintain clean separation of concerns between presentation and business logic.

## Custom Editing and Suggestion Guidelines

- **Minimal and Precise Changes:** When suggesting code edits, apply the smallest viable change that addresses the request. If broader refactoring is needed, ask for clarification.
- **Error Handling and Security:** Code suggestions must consider secure practices (e.g., validating inputs, avoiding hardcoded secrets, and using environment variables).
- **Commit Messages:** Generate commit messages following the Conventional Commits specification (e.g., `feat(api): add vector search endpoint`).
- **Documentation:** Always include inline comments explaining non-obvious logic to help maintain clarity.

## Prompting Guidelines for Chat

- When using Copilot Chat or inline prompts:
  - Be explicit about the change or feature you need.
  - If a prompt is too terse (e.g., `refactor search logic`), consider adding context:  
     - e.g. "Refactor the vector similarity search in the `/api/documents/search` endpoint to handle edge cases and log errors using our established logging framework."_
  - Use role prompting to ask Copilot to act as your “Backend Architect” or “Frontend Engineer” for targeted suggestions.

Remember: Custom instructions are meant to support, not constrain—feel free to update this file as your coding practices or project requirements evolve.
