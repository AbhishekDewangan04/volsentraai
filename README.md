# Volsentra AI — Electricity Theft & Anomaly Command Center

Full-stack application built with [TanStack Start](https://tanstack.com/start) (React 19, plain JavaScript) with file-based routing, server-side rendering, and Vercel/Nitro deployment support.

## What is in the project

| Route | Description |
| --- | --- |
| `/` | Landing page and overview of detection analytics |
| `/dashboard` | Command center, 3D grid, consumers, transformers, live monitor, and inspection lab |
| `GET /api/time` | Server route endpoint |

## Run locally

```bash
npm install
npm run dev
```

## Build and deploy

```bash
npm run build
```

The build targets Vercel using Nitro and generates `.vercel/output`.

## Authentication setup

Volsentra supports Google Authentication powered by Firebase Auth, with a built-in guest demo fallback.

To enable live Google Sign-In:
1. In the [Firebase Console](https://console.firebase.google.com/), create a project and enable **Authentication > Sign-in method > Google**.
2. Add your deployment domains (e.g. `localhost` and your Vercel URL `*.vercel.app`) to **Authentication > Settings > Authorized domains**.
3. Create a Web App in Project Settings and copy the credentials to your environment (`.env` or Vercel Environment Variables):

```bash
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_APP_ID=your_app_id
```

If these environment variables are omitted or empty, the app runs in demo mode where visitors can use **Continue as demo** with full dashboard access.
