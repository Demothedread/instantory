//BARTLEBY-LOCALRUES-002 
•	Stack Context: Frontend (React/Next.js on Vercel), Backend (Node.js/Express or FastAPI on Render), Blob storage (Vercel Blob or AWS S3), SQL (Render-hosted or Neon). Auth via Google OAuth.
	] •	Functional Scope:
• Handle uploads ≤20MB (images/docs) + user instructions per item.
• Post sequentially to OpenAI GPT-4o API for structured metadata extraction.
• Persist metadata in SQL tables supporting inventory exports (XLS, CSV).
• Frontend: masonry grid UI, clickable cards, vectorized search.
• Export formats must be easily generated and user-friendly.
	•	Design Aesthetic: “Neo-Deco-Rococo” — art deco base with rococo flourishes updated for modern layering, line emphasis, bezel neon accents, depth illusion via texture.
	•	Modular Architecture: Separate concerns strictly—API endpoints, data models, UI components, and storage adapters. Use feature flags and modular imports.
	•	Code Style & Practices:
• Maintain clarity and minimalism—avoid overcomplexity.
• Prioritize readable, well-documented code with markdown comments.
• Favor small, atomic, testable modules; enforce separation of logic and presentation.
• Use TypeScript where applicable for type safety and maintainability.
	•	API & Data Handling:
• Enforce robust error handling and rate limiting on OpenAI API calls.
• Normalize SQL schema for scalable metadata storage.
• Ensure asynchronous processing with concurrency control on uploads.
	•	Security & Auth:
• Strict Google OAuth integration and session management.
• Validate and sanitize all user inputs.
• Secure blob storage access with scoped permissions.
	•	Performance:
• Optimize frontend loading with SSR/SSG where feasible.
• Cache frequent queries and data exports.
• Lazy-load UI components and images in masonry grid.