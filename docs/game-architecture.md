# Game architecture

## Core principle
The player ship is center-pinned. Simulation truth keeps the ship anchored while combat pressure is created by aiming, firing cadence, and world-roll translation.

## Ownership boundaries
- **React shell (`src/app`, `src/ui`)**: mounts canvas and non-frame UI.
- **Engine (`src/game/engine`)**: fixed-step timing + orchestration.
- **Input (`src/game/input`)**: browser key events translated into `FrameInput`.
- **Simulation (`src/game/loop`, `src/game/systems`, `src/game/entities`, `src/game/weapons`, `src/game/collisions`, `src/game/progression`)**: deterministic state transitions.
- **Rendering (`src/game/rendering`)**: projects state to Canvas 2D; does not own truth.
- **Config (`src/game/config`)**: tuning constants for player, world-roll, bullets, and enemies.

## Determinism
Simulation runs through pure step functions fed by a fixed delta. This keeps behavior testable and stable.

## Extending content safely
- New enemy behavior: add an entity shape in `types`, update enemy step function, keep render-specific visuals in `rendering`.
- New pickup logic: implement transition in `progression/resolvePickups.ts`.
- New weapon behavior: add weapon step logic in `weapons/updateWeapons.ts` while preserving cooldown determinism.
