# Workspace

## Overview

pnpm workspace monorepo using TypeScript. Each package manages its own dependencies.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)
- **Frontend**: React + Vite + Tailwind CSS + shadcn/ui + Recharts

## Application: Movia Immo

SaaS real estate rental management platform for a Moroccan agency in Tangier.

### Features
- Dashboard with KPIs (biens, locataires, revenus MAD, impayés, taux d'occupation)
- Interactive charts (revenus, occupation par zone)
- Gestion des propriétés (Malabata, Cap Spartel, Médina, Asilah, Tétouan, Martil, Fnideq, Centre Ville, Iberia)
- Gestion des locataires avec scores de paiement
- Suivi des paiements avec statuts (payé, en retard, partiel, en attente)
- Gestion des contrats (bail habitation, commercial, saisonnier)
- Tickets de maintenance avec priorités et techniciens
- Analytique financière et rentabilité par propriété
- Notifications en-app

### Locale
- All amounts in MAD (Dirhams marocains)
- French interface throughout
- Moroccan demo data with real Tangier zones

### Routes (Frontend)
- `/` — Tableau de Bord
- `/biens` — Propriétés
- `/locataires` — Locataires
- `/paiements` — Paiements
- `/contrats` — Contrats
- `/maintenance` — Maintenance
- `/analytique` — Analytique
- `/notifications` — Notifications

### API Routes (Backend)
- `GET /api/dashboard/kpis` — KPI summary
- `GET /api/dashboard/activity` — Activity feed
- `GET /api/dashboard/alerts` — Active alerts
- `GET /api/dashboard/revenue-chart` — Monthly revenue chart
- `GET /api/dashboard/occupancy-chart` — Occupancy by zone
- `CRUD /api/properties` + `/stats/by-zone`
- `CRUD /api/tenants` + `/:id/payments`
- `CRUD /api/payments` + `/stats/summary`
- `CRUD /api/contracts` + `/expiring-soon`
- `CRUD /api/maintenance` + `/stats/by-status`
- `GET/PUT /api/notifications` (mark read, mark all read)
- `GET /api/analytics/financial|occupancy|profitability`

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- `pnpm --filter @workspace/scripts run seed-movia` — reseed Moroccan demo data

See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details.
