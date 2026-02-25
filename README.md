# ClickFlow Agent Runtime

Multi-agent orchestration system for ClickFlow.

## Quick Start

```bash
# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env with your tokens

# Start runtime
npm run dev
```

## Architecture

```
clickflow-runtime/
├── src/
│   ├── agents/
│   │   ├── dispatcher.ts     # Router / supervisor
│   │   ├── growth.ts         # Outbound SDR
│   │   ├── intake.ts         # Spec collector
│   │   ├── support.ts        # Support / QA
│   │   ├── build.ts          # Astro + Codex builder
│   │   └── ops.ts            # Vercel + infrastructure
│   ├── lib/
│   │   ├── github.ts         # GitHub API client
│   │   ├── vercel.ts         # Vercel API client
│   │   ├── kommo.ts          # Kommo API client
│   │   ├── stripe.ts         # Stripe webhook handler
│   │   ├── codex.ts          # Codex integration
│   │   └── queue.ts          # Message queue
│   ├── types/
│   │   └── index.ts          # TypeScript types
│   └── index.ts              # Entry point
├── package.json
└── tsconfig.json
```

## Agents

### ClickFlow-Dispatcher
Routes all events, manages conversation locks.

### ClickFlow-Growth
Outbound campaigns via email/SMS/WhatsApp.

### ClickFlow-Intake
Collects SiteSpec, validates completeness.

### ClickFlow-Support
QA process, change orders, customer support.

### ClickFlow-Build
Creates repos, runs Codex, deploys to Vercel.

### ClickFlow-Ops
Manages Vercel projects, domains, incidents.

## API Endpoints

- `POST /webhooks/kommo` — Kommo events
- `POST /webhooks/stripe` — Stripe events
- `GET /health` — Health check
- `GET /conversations` — Active conversations

## Environment Variables

```
GITHUB_TOKEN=ghp_xxx
GITHUB_ORG=clickflowbotbot
VERCEL_TOKEN=vcp_xxx
VERCEL_TEAM_ID=team_xxx
KOMMO_TOKEN=xxx
STRIPE_SECRET_KEY=sk_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx
```
