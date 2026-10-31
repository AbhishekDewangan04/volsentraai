# Volsentra AI

**AI-powered electricity theft and anomaly detection command center for power distribution utilities.**

Volsentra AI scores every smart meter on a grid, explains *why* each one was flagged, and points field inspectors at the losses that matter most.

**Live demo:** https://volsentraai.vercel.app

<!-- Add 2 to 3 screenshots here, for example: -->
<!-- ![Command center](docs/command-center.png) -->

---

## Features

- **Command center:** grid health score, KPIs, load chart, cause breakdown, top-priority inspection list and a live alert feed.
- **Consumers and risk:** searchable table with risk heat strip, filters, bulk actions, cards and map views, and CSV/JSON/PDF export.
- **Investigation report:** baseline vs. actual consumption, SHAP-style "why was this flagged" reasons, peer comparison and a reasoning timeline.
- **3D grid explorer:** substations, feeders, transformers and consumers coloured by risk, with a 12-month time-lapse.
- **Live IoT monitor:** a virtual smart-meter simulator streaming readings every 2 seconds, a pipeline view and a scenario injector (theft, meter fault, comms failure, legitimate spike).
- **Transformer analysis:** energy in vs. billed, loss percentage and suspicious clusters.
- **Case management:** kanban board from new case to resolved, with notes and an activity log.
- **Scenario lab:** nine regression scenarios with expected vs. actual classification.
- **Model performance:** precision, recall, F1, ROC/PR curves, confusion matrix and model comparison.
- **Ask Volsentra:** an in-app copilot that answers questions about the grid data.
- **Sign-in with Google** (Firebase Authentication) or **continue as demo**.

## Tech stack

| Area | Tools |
| --- | --- |
| Framework | TanStack Start (React, file-based routing, SSR) |
| UI | Tailwind CSS, shadcn/ui, Radix UI, Framer Motion |
| Charts | Recharts |
| Data and state | TanStack Query, built-in seeded demo data |
| Auth | Firebase Authentication (Google) |
| Exports | jsPDF, html2canvas |
| Hosting | Vercel (Nitro preset) |

## Getting started

**Requirements:** Node.js 20 or newer and npm.

```bash
git clone https://github.com/AbhishekDewangan04/volsentraai.git
cd volsentraai
npm install
npm run dev
```

The app opens at `http://localhost:5173`.

The repo includes an `.npmrc` with `legacy-peer-deps=true`, which avoids a peer-dependency conflict between some TanStack AI packages.

### Environment variables

Copy `.env.example` to `.env` and fill in your Firebase web app values:

```
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_APP_ID=
```

If these are not set, the app runs in **demo-only mode**: Google sign-in is hidden behind a notice and **Continue as demo** opens the dashboard.

### Authentication setup (Firebase)

1. Create a project at [console.firebase.google.com](https://console.firebase.google.com).
2. Add a **Web app** and copy its config values into `.env`.
3. Go to **Authentication > Sign-in method** and enable **Google**.
4. Go to **Authentication > Settings > Authorized domains** and add your deployed domain (for example `volsentraai.vercel.app`). `localhost` is included by default.

## Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Start the development server |
| `npm run build` | Production build (Vercel output in `.vercel/output`) |
| `npm run lint` | Run ESLint |

## Deployment (Vercel)

1. Import the GitHub repo into Vercel.
2. Add the four `VITE_FIREBASE_*` variables under **Settings > Environment Variables** (Production and Preview).
3. Deploy. The production build uses Nitro's Vercel preset, and a small stub replaces the Cloudflare-only `cloudflare:workers` module that the development server uses.
4. Add the Vercel domain to Firebase's authorized domains.

Redeploy after changing environment variables, because they apply only to new builds.

## Project structure

```
src/
  components/   UI, charts, layout, landing page, auth and feature components
  lib/          auth context, Firebase setup, theme, helpers
  routes/       file-based routes (landing, login, dashboard pages)
  stubs/        stand-in for cloudflare:workers on Vercel builds
```

## About the data

All consumers, readings, alerts and cases in the demo are **synthetic**, generated from a seeded random source so results are reproducible. No real customer data is used. The model metrics shown are illustrative for demonstration purposes.

## Roadmap

- Connect a real backend and database for persistent cases and users
- Replace the virtual meter simulator with live hardware (for example an ESP32 with a current and voltage sensor)
- Train and serve the detection model behind an API

## Author

Built by **Abhishek Dewangan**.

## License

Add a license of your choice (for example MIT) before sharing the repo publicly.
