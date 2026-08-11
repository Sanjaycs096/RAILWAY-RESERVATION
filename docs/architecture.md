# Architecture

RailNet Enterprise uses a modern web stack:

- **Frontend:** React 19, TypeScript, Vite, Tailwind CSS.
- **Backend:** Node.js, Express, TypeScript.
- **Database:** PostgreSQL (Neon).

The frontend and backend are housed within a monolithic repository, sharing some configuration while having a clean separation (`src/` for frontend, `server/` for backend). The frontend is bundled via Vite, and the backend is bundled via esbuild to run as serverless functions (e.g., Vercel).
