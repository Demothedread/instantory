# Bartleby Project Local Rules

## Project Overview
Bartleby is an AI-powered document and image management system designed to streamline organization, retrieval, and analysis of large volumes of unstructured data. The system's primary goals include enabling intelligent content search, automated metadata extraction, and seamless user collaboration.

## System Workflow
- **Authentication & Session Management:** Secure user authentication is handled via OAuth and JWT tokens, establishing a session for each user.
- **User-Scoped Storage:** All uploaded documents and images are stored in user-specific locations, ensuring privacy and access control.
- **Ingestion & Pre-Processing:** Uploaded files are ingested and pre-processed, with text extraction and format normalization performed as needed.
- **AI-Driven Summarization & Metadata Extraction:** The system leverages OpenAI models to summarize content and extract metadata, enriching each file with searchable attributes.
- **Data Persistence & Vector Search:** Metadata and embeddings are stored in a vector-enabled database, enabling fast semantic search and retrieval across user data.
- **Interactive UI & Insights:** The frontend provides real-time feedback, visualizations, and interactive tools for exploring, searching, and managing user content.

## Stack Context
- **Frontend:** React/Next.js on Vercel
- **Backend:** Python using Quart framework with asynchronous I/O, centered on `server.py` as primary entry point
- **Storage:** Vercel Blob or AWS S3 for blob storage
- **Database:** SQL (Render-hosted or Neon) with vector search indexing using Neon PostgreSQL
- **Authentication:** Google OAuth
- **AI Integration:** OpenAI API for content analysis, natural language understanding, and vector similarity search

## Architecture Structure
- **Backend Code:** Application code resides under `/backend`, with middleware modules in `/backend/middleware` (e.g., `cors.py`, `error_handlers.py`, `request_logger.py`, `security.py`, `setup.py`) and route handlers in `/backend/routes` (e.g., `auth_routes.py`, `documents.py`, `inventory.py`, `process.py`)

## Functional Scope
- Handle uploads ≤20MB (images/docs) + user instructions per item
- Post sequentially to OpenAI GPT-4o API for structured metadata extraction
- Persist metadata in SQL tables supporting inventory exports (XLS, CSV)
- Frontend: masonry grid UI, clickable cards, vectorized search
- Export formats must be easily generated and user-friendly

## Design Aesthetic: "Neo-Deco-Rococo"
A wholly original style that blends the timeless elegance and math-infused consonant logic of Art deco with the chaotic, over-the-top, grandeur and gaiety of the rococo, creating a juxtaposing discordance in an effortlessly chic, maximal impact updated to suit modern sensibilities with neon highlights and undertones, chiaroscuro dramatic lighting, differing thickness of lines emphasis, bezel accents, and the illusion of 3D depth and space through light, layer, and material elements, while still adhering to Vignelli's Principles of Design.  Visual traits include layered metallic textures, pastel-neon color contrasts, dynamic lighting effects, scroll-based layering, and metallic finishes, creating responsive, interactive elements that enhance user engagement and accessibility. Weave these elements into the UI to create a visually striking and engaging user experience that reflects the system's advanced capabilities, begin each page/module design by asking "what is the essential purpose of this tool or page? What analog component or tool does it replace? Can our design honor the same principles, incorporating or updating a digital equivalent into its UI, or else, through abtraction, instill the same essence, leaving our users with a sense of wonder and delight?" Be unafraid to break the rules around web design, but assure a UI that is uncluttered, intuitively navigable, functionality over form but not every time, BUT every element must always provide a clear purpose and enhances usability.

## Modular Architecture
- Separate concerns strictly—API endpoints, data models, UI components, and storage adapters
- Use feature flags and modular imports
- Maintain clarity and minimalism—avoid overcomplexity
- Prioritize readable, well-documented code with markdown comments
- Favor small, atomic, testable modules; enforce separation of logic and presentation

## API & Data Handling
- Enforce robust error handling and rate limiting on OpenAI API calls
- Normalize SQL schema for scalable metadata storage
- Ensure asynchronous processing with concurrency control on uploads

## Security & Auth
- Strict Google OAuth integration and session management
- Validate and sanitize all user inputs
- Secure blob storage access with scoped permissions

## Performance
- Optimize frontend loading with SSR/SSG where feasible
- Cache frequent queries and data exports
- Lazy-load UI components and images in masonry grid

## Prompting Guidelines for Chat
When using Copilot Chat or inline prompts:
- Be explicit about the change or feature you need
- If a prompt is too terse (e.g., `refactor search logic`), consider adding context:
  - e.g. "Refactor the vector similarity search in the `/api/documents/search` endpoint to handle edge cases and log errors using our established logging framework."
- Example prompt for improving upload flow:
  "Improve the file upload flow to provide real-time progress feedback, handle file validation errors gracefully, and optimize for large image files."
- Example prompt for diagnosing vector search mismatches:
  "Investigate why the vector search is returning irrelevant results for certain queries, add detailed logging of vector embeddings and similarity scores, and suggest fixes."
