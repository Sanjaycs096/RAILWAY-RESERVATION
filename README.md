<div align="center">
  <h1>RailNet Enterprise</h1>
  <p>National Railway System Platform</p>
</div>

## Description

RailNet Enterprise is a modern, full-stack application designed to handle complex railway reservations, live tracking, station directory indexing, and robust administrative business analytics.

## Run Locally

**Prerequisites:** Node.js

1. Install dependencies:
   `npm install`
2. Configure Environment Variables:
   Create a `.env` file in the root directory based on `.env.example` and set your `DATABASE_URL` and `JWT_SECRET`.
3. Start the application:
   `npm run dev`

## Vercel Deployment

This repository is configured for immediate deployment to Vercel Serverless.

1. Create a Vercel project and link it to this GitHub repository.
2. Ensure you configure the following **Environment Variables** in Vercel:
   - `DATABASE_URL`: Your Neon Postgres connection string.
   - `JWT_SECRET`: A secure random string for JWT signing.
3. The build configuration (`vercel.json`) will automatically build the Vite React frontend and run the Express API as Serverless Functions (`/api/*`).
