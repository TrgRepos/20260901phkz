# routewise-ops (Session 2.1 completed state)

This is `routewise-ops` after all of Session 2.1's exercises (Exercise 1, Labs 1
through 6) have been completed. Use it as an answer key or a reference to compare
against your own repo, not as a fresh starting point, since the starter repo has a
different, earlier state (a flat `.cursorrules`, no `AGENTS.md`, no
`.cursor/rules/`, and no Route History View feature).

## What's Different From the Starter Repo

| Area | Starter state | This (completed) state |
|---|---|---|
| `.cursorrules` | Present, flat, mixes concerns | Deleted (Lab 1) |
| `.cursor/rules/backend.mdc` | Does not exist | Full content: validation, error handling, logging, testing, data (Lab 2) |
| `.cursor/rules/frontend.mdc` | Does not exist | Full content: component structure, accessibility, API usage, state management (Lab 3) |
| `AGENTS.md` | Does not exist | Repo-wide instructions plus the Route History View initiative context (Labs 1 and 4) |
| `packages/web` Route History feature | Does not exist | Fully built and wired into the running app (Lab 5) |
| `packages/web` dependencies | No TanStack Query | `@tanstack/react-query` installed and in use |

## The Route History View Feature (Lab 5)

Each route on the dashboard now has a **View history** button. Clicking it fetches
and displays that route's status-change history via `GET /api/routes/:id/history`,
using TanStack Query (`useRouteHistory`), not the older `fetch` + `useEffect`
pattern still used by `useRoutes.ts`.

Files added or changed for this feature, exactly matching Lab 5's scoped plan:

- `packages/web/package.json`, added `@tanstack/react-query`
- `packages/web/src/types/route.types.ts`, added `RouteHistoryEntry`
- `packages/web/src/api/routesApi.ts`, added `fetchRouteHistory`
- `packages/web/src/hooks/useRouteHistory.ts`, new file
- `packages/web/src/components/RouteHistoryView.tsx`, new file

Two additional, necessary pieces of plumbing were added beyond the lab's scoped
file list, since TanStack Query requires them to function at all:

- `packages/web/src/main.tsx`, wraps the app in a `QueryClientProvider`
- `packages/web/src/components/RouteCard.tsx` and `RouteDashboard.tsx`, wired with
  a "View history" toggle so the new component is actually reachable in the app,
  not just present in the codebase

No backend file changed. The contract (`GET /api/routes/:id/history`) was already
final before Lab 4 began, per `AGENTS.md`.

## Getting Started

```bash
npm install
npm test        # 13 backend tests, 8 frontend tests, all passing
npm run dev:api  # http://localhost:4000
npm run dev:web  # Vite dev server
```

## Level 2, Session 2.2

`services/rate-engine/` now contains the legacy Python rate calculator
this session's labs work against. See `services/rate-engine/README.md`
for setup. Everything under `packages/` from Session 2.1 carries forward
unchanged.

## No Real Data

Every sample row in this repo (`Route 12 – Riverside Loop`, `Route 4 – Harbor
District`, etc.) is obviously synthetic. Never paste real customer, driver, or
production data into any exercise using this repo.
