# github/copilot-instructions.md

## Bartleby Project Custom Instructions

Bartleby is an AI-powered document and image management system designed to streamline organization, retrieval, and analysis of large volumes of unstructured data. The system's primary goals include enabling intelligent content search, automated metadata extraction, and seamless user collaboration. Functionally, Bartleby integrates robust backend services for data ingestion, processing, and indexing with a dynamic frontend interface for visualization and interaction.

## System Workflow

- **Authentication & Session Management:** Secure user authentication is handled via OAuth and JWT tokens, establishing a session for each user.
- **User-Scoped Storage:** All uploaded documents and images are stored in user-specific locations, ensuring privacy and access control.
- **Ingestion & Pre-Processing:** Uploaded files are ingested and pre-processed, with text extraction and format normalization performed as needed.
- **AI-Driven Summarization & Metadata Extraction:** The system leverages OpenAI models to summarize content and extract metadata, enriching each file with searchable attributes.
- **Data Persistence & Vector Search:** Metadata and embeddings are stored in a vector-enabled database, enabling fast semantic search and retrieval across user data.
- **Interactive UI & Insights:** The frontend provides real-time feedback, visualizations, and interactive tools for exploring, searching, and managing user content.

- **Backend:** Built on Python using the Quart framework with asynchronous I/O for efficient, scalable processing of document and image data streams. The backend handles AI integration, vector search indexing with Neon PostgreSQL, and secure API endpoints. The Bartleby backend is a Python-based service centered on `server.py` as its primary entry point. Application code resides under `/backend`, with middleware modules in `/backend/middleware` (e.g., `cors.py`, `error_handlers.py`, `request_logger.py`, `security.py`, `setup.py`) and route handlers in `/backend/routes` (e.g., `auth_routes.py`, `documents.py`, `inventory.py`, `process.py`).
- **Frontend:** A React application hosted on Vercel, featuring a modern "Neo-deco-rococo" design language. This style is a deliberate blend of Art Deco geometry and Rococo embellishment, updated for modern UI/UX needs. Visual traits include layered metallic textures, pastel-neon color contrasts, dynamic lighting effects, scroll-based layering, and metallic finishes, creating responsive, interactive elements that enhance user engagement and accessibility.

- **AI Integration:** Uses OpenAI's API for advanced content analysis, natural language understanding, and vector similarity search to provide highly relevant results and insights.

## Coding and Design Standards

- **Python:**
  - Follow PEP 8 guidelines strictly.
  - Use `asyncio` and `async/await` patterns for non-blocking, concurrent operations.
  - Implement robust exception handling with clear, informative logging using the standard `logging` module configured for structured output (e.g., JSON logs) with appropriate log levels (DEBUG, INFO, WARNING, ERROR).
  - Organize backend code following a modular architecture pattern with clear separation between API routes, data access layers, and AI integrations.
  - has distinct middleware and route structures located under `/middleware` and `/routes` respectively, which should be respected when writing or editing logic.

- **JavaScript/TypeScript (React):**
  - Use camelCase for variable and function names; PascalCase for React components.
  - Prefer functional components with React Hooks for state and lifecycle management.
  - Maintain clear separation of concerns between presentation components (UI) and container components (business logic).
  - Follow a scalable folder structure, e.g.:

    ```
    /src
      /components
      /hooks
      /contexts
      /services
      /styles
      /utils
    ```

  - Adhere to the "Neo-deco-rococo" design language by incorporating layered metallic textures, pastel-neon contrasts, dynamic lighting effects, scroll-based layering, and metallic finishes, alongside interactive UI elements that respond fluidly across devices.

## Custom Editing and Suggestion Guidelines

- **Minimal and Precise Changes:** When suggesting code edits, apply the smallest viable change that addresses the request. If broader refactoring is needed, ask for clarification.
- **Error Handling and Security:** Code suggestions must consider secure practices, including validating inputs, avoiding hardcoded secrets, and using environment variables.
- **Commit Messages:** Generate commit messages following the Conventional Commits specification (e.g., `feat(api): add vector search endpoint`).
- **Documentation:** Always include inline comments explaining non-obvious logic to help maintain clarity.

## Prompting Guidelines for Chat

- When using Copilot Chat or inline prompts:
  - Be explicit about the change or feature you need.
  - If a prompt is too terse (e.g., `refactor search logic`), consider adding context:  
    - e.g. "Refactor the vector similarity search in the `/api/documents/search` endpoint to handle edge cases and log errors using our established logging framework."
  - Example prompt for improving upload flow:  
    "Improve the file upload flow to provide real-time progress feedback, handle file validation errors gracefully, and optimize for large image files."
  - Example prompt for diagnosing vector search mismatches:  
    "Investigate why the vector search is returning irrelevant results for certain queries, add detailed logging of vector embeddings and similarity scores, and suggest fixes."

Remember: Custom instructions are meant to support, not constrain—feel free to update this file as your coding practices or project requirements evolve.
