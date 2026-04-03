# Center Core Shooter

Center Core Shooter is a game-first repository for a single-player arcade shooter where the ship stays pinned at screen center, rotates 360°, fires from the nose, and drives motion through battlefield world-roll instead of Asteroids-style drift.

## Active product

- **Primary app:** `game/` (Vite + React + TypeScript + Canvas 2D)
- **Simulation model:** deterministic fixed-step updates
- **Current focus:** core combat loop architecture and progressive content expansion

## Quick start

```bash
npm install
npm run dev
```

Then open the local Vite URL shown in the terminal.

> Install dependencies from the repository root. Do not run a separate install inside `game/`.

## Repository commands

Root commands are the canonical validation path. Runtime commands delegate into the `game` workspace:

- `npm run dev`
- `npm run build`
- `npm run test`
- `npm run lint`
- `npm run typecheck`

## Repository layout

- `game/` — active game application
- `docs/` — active game architecture and loop docs
- `legacy/` — archived blockchain/literary surfaces retained for reference

## Legacy archive

Historical monorepo assets were moved into `legacy/` to keep the active developer path game-first. Those files are not part of the current runtime workflow.
