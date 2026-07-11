# DACARPOOL

AI-powered carpool matching app for De Anza College students.

## Problem

De Anza is a 100% commuter campus (no student housing). There's an existing
manual carpool permit program (reserved spots in lots A/C/D/E) but no
digital matching system. Students also get free VTA SmartPass access, so
transit is a viable fallback when no carpool match exists.

## MVP feature set

1. **Commute submission** — students submit origin, destination, and
   schedule via a simple form or natural-language input (parsed by the AI
   model into structured fields).
2. **Group matching** — AI-assisted matching groups multiple riders with
   overlapping routes/times into shared rides, not just 1:1 nearest-match.
   This is a lightweight vehicle routing/grouping optimization problem, not
   a simple query.
3. **Multimodal fallback** — if no good carpool match exists, suggest the
   best VTA bus/light rail route instead.
4. **Carbon savings** — each completed match shows a personalized
   carbon-savings estimate vs. driving solo.

## Stack

- **Frontend**: Next.js + Tailwind CSS
- **Backend**: Node/Express
- **Database**: DigitalOcean Managed Postgres
- **AI/inference**: DigitalOcean Gradient serverless inference (Claude
  model) — used for natural-language commute parsing and matching/grouping
  logic
- **Maps**: Leaflet + OpenStreetMap
- **Deployment**: DigitalOcean App Platform

## Project structure

```
/frontend                Next.js app (App Router)
  /app                    routes/pages
  /components             functional React components
  /lib                    client-side helpers, API client, types
  /styles                 Tailwind config/globals
/backend
  /src
    /routes               Express route handlers
    /services              matching engine, transit lookup, carbon calc
    /models                Postgres data access (queries, no ORM magic)
    /ai                    Gradient/Claude inference calls (parsing, matching)
    /types                 shared TypeScript types
  /migrations              SQL migration files
/shared                    types/constants shared between frontend & backend
```

Keep frontend and backend as separate TypeScript projects with their own
`package.json` and `tsconfig.json`; share types via the `/shared` directory
or a local workspace package — do not duplicate type definitions.

## Key data models

### User
- `id`, `email` (must be `@deanza.edu` or `@fhda.edu`)
- `name`
- `role`: `student` (only role for MVP)
- `home_location` (lat/lng + address string)
- `created_at`

### CommuteRequest
- `id`, `user_id`
- `origin` (lat/lng + address)
- `destination` (lat/lng + address — typically a De Anza lot or campus building)
- `schedule`: recurring days of week + arrival/departure time windows
- `raw_input` (original NL text, if submitted that way, for auditing/reparsing)
- `status`: `pending` | `matched` | `expired`
- `created_at`

### Match
- `id`
- `rider_ids` (array of `user_id`, 2+ riders per shared ride)
- `route_id` (FK to Route, nullable if unmatched/transit-only)
- `matched_window` (overlapping time window the group agreed on)
- `carbon_savings_kg` (estimated, vs. solo driving baseline)
- `status`: `proposed` | `confirmed` | `completed` | `cancelled`
- `created_at`

### Route
- `id`
- `type`: `carpool` | `transit`
- `polyline` (encoded route geometry for map display)
- `stops` (ordered waypoints — rider pickup points for carpool, or
  VTA stop IDs for transit)
- `transit_details` (nullable: VTA line/route number, agency trip ID)
- `estimated_duration_min`

## Coding conventions

- **TypeScript everywhere**, `strict` mode on in both frontend and backend
  `tsconfig.json`.
- **React**: functional components with hooks only — no class components.
  Co-locate a component's styles (Tailwind classes inline) and keep
  components small and single-purpose.
- Prefer named exports over default exports for components and utilities.
- No `any` — use `unknown` and narrow, or define a proper type.
- Backend routes stay thin; business logic (matching, carbon calc, transit
  lookup) lives in `/backend/src/services`, not in route handlers.
- AI calls (Gradient/Claude) are isolated in `/backend/src/ai` behind typed
  functions (e.g. `parseCommuteText()`, `groupRiders()`) — routes and
  services never call the inference API directly.
- Validate all external input (form submissions, NL text before parsing) at
  the API boundary; trust internal service/model calls.
- SQL: parameterized queries only, no string-concatenated SQL. Migrations
  are plain `.sql` files, applied in order.
