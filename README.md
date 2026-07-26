<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://ai.google.dev/static/site-assets/images/share-ais-513315318.png" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/6bdb15cc-a059-4e25-8f25-58b9cd8e7e92

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

## Vercel Deployment

This repository is configured for immediate deployment to Vercel Serverless.

1. Create a Vercel project and link it to this GitHub repository.
2. Ensure you configure the following **Environment Variables** in Vercel:
   - `DATABASE_URL`: Your Neon Postgres connection string.
   - `JWT_SECRET`: A secure random string for JWT signing.
3. The build configuration (`vercel.json`) will automatically build the Vite React frontend and run the Express API as Serverless Functions (`/api/*`).
