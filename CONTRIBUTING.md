# Contributing to Center Core Shooter

## Scope
This repository is currently focused on the `game/` workspace and game-first architecture.

## Workflow
1. Create a focused branch.
2. Keep diffs small and reviewable.
3. Add or update tests for gameplay/system changes.
4. Run:
   - `npm run typecheck`
   - `npm run test`
   - `npm run build`
   - `npm run lint`

## Architecture guardrails
- Keep simulation deterministic and separate from React.
- Keep rendering projection-only.
- Keep tuning in config files.
