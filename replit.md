# Workspace

## Overview

pnpm workspace monorepo using TypeScript. **Movia Immo** — a property management dashboard for Moroccan real estate (Tanger area). Ported from Vercel/v0 to the Replit pnpm_workspace stack.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **Frontend**: React + Vite (`artifacts/movia-immo/`) at path `/`
- **API framework**: Express 5 (`artifacts/api-server/`) at path `/api`
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod, `drizzle-zod`
- **API codegen**: Orval (from `lib/api-spec/openapi.yaml`)
- **UI**: shadcn/ui + Tailwind CSS v4, dark navy + gold theme
- **Build**: esbuild (server bundle)

## App Features

- **Dashboard**: KPIs (revenue, occupancy, unpaid rents), revenue chart, occupancy by zone, alerts, activity feed
- **Properties**: CRUD for real estate properties with zones (Malabata, Cap Spartel, Medina, etc.)
- **Tenants**: Tenant management with payment history and status tracking
- **Payments**: Rent payment tracking with status (payé, en_retard, en_attente)
- **Contracts**: Lease contract management with expiry alerts
- **Maintenance**: Ticket system with priority/status tracking
- **Analytics**: Financial analytics, occupancy trends, profitability per property
- **Notifications**: System notification center
- **Le Radar** (AI-First): Module de validation des biens reçus via OpenClaw (WhatsApp/Facebook). Biens `isVerified=false` en attente, boutons "Appeler" et "Valider & Publier". Badge amber dans la sidebar avec le nombre en attente.
- **Catalogue public** (`/catalogue`): Vitrine publique sans AppLayout — biens vérifiés + disponibles, filtres zone/type, carousel Vimeo/photos, CTA WhatsApp.
- **Media carousel**: Les cartes Biens (admin) supportent un carousel photo + iframe Vimeo/YouTube avec navigation flèches et dots.
- **API externe sécurisée**: `POST /api/external/ingest` et `GET /api/external/check` avec middleware `X-API-KEY`. Table `api_keys` en DB.
- **Seed étendu**: 5 biens Facebook (EXT-0001..0005) non vérifiés + 2 clés API (OpenClaw prod + test).

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- `pnpm --filter @workspace/scripts run seed-movia` — seed database with Moroccan demo data

## Key Files

- `lib/api-spec/openapi.yaml` — OpenAPI spec (source of truth for all API contracts)
- `lib/db/src/schema/` — Drizzle table definitions
- `artifacts/api-server/src/routes/` — Express route handlers
- `artifacts/movia-immo/src/App.tsx` — Frontend router
- `artifacts/movia-immo/src/index.css` — Theme (dark navy #0D1B2A + gold #C9A84C)
- `scripts/src/seed-movia.ts` — Demo seed data (10 properties, 7 tenants, 84 payments)

See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details.
