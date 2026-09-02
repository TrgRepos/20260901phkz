# routewise-ops

Never add fake or sample production data to any file, including tests.
Always run the relevant package's test suite after a change
(`packages/api` → `npm test`, `packages/web` → `npm test`).

## Current Initiative: Route History View
The backend already exposes `GET /api/routes/:id/history` (see
`packages/api/src/controllers/route.controller.ts`). The frontend
work is to build a view that consumes this endpoint using TanStack
Query (not the older fetch+useEffect pattern in `useRoutes.ts`).
Do not modify any backend files for this initiative, the contract is
already final.
