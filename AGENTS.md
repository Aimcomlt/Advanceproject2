# AGENTS.md

## Mission
Build a production-ready single-player arcade shooter with a **center-pinned triangular ship** that rotates 360°, fires outward from the nose, and drives perceived motion by **rolling the world in the facing direction** rather than drifting the player across the screen.

The game identity is:
- readable
- skill-based
- fast to start
- progressively deep
- stable under input
- easy to test and tune

Codex should optimize for **tight control feel, clean architecture, deterministic gameplay logic, and reviewable incremental delivery**.

---

## Product truth
The player ship is visually anchored at screen center.

Core fantasy:
- the player is a fixed combat interceptor
- the nose rotates like a clock hand
- bullets fire outward along aim angle
- the battlefield scrolls relative to aim direction
- enemies enter from edges and corners
- power-ups alter firepower, defense, and control
- difficulty ramps through cadence, enemy composition, and boss events

This project is **not** a physics-drift clone of Asteroids.
It is a **center-core rotational survival shooter**.

---

## Primary outcomes
When working in this repo, optimize for these outcomes in order:

1. **Control feel first**
2. **Deterministic gameplay second**
3. **Clear separation of simulation/rendering/UI third**
4. **Incremental content expansion fourth**
5. **Polish and juice last**

Never sacrifice gameplay stability for visual flair.

---

## Working style for Codex
For non-trivial tasks, **plan before coding**.

Use this execution pattern:
1. inspect relevant files
2. state the intended change in plain language
3. list assumptions if repo truth is missing
4. implement the smallest correct slice
5. run validation
6. report files changed, validation run, notes, and next best move

For large tasks, prefer multiple bounded passes over one giant rewrite.

Do not silently change architecture, dependencies, naming systems, or folder conventions without strong reason.

---

## Default stack assumption
Unless repo truth says otherwise, assume:
- **Vite**
- **React**
- **TypeScript**
- **HTML Canvas 2D** for gameplay rendering
- optional **Redux** only for shell/UI/meta state, not per-frame simulation
- **Vitest** for unit tests
- **ESLint** and **TypeScript strict mode**

If the repo differs, adapt to the existing stack instead of forcing this one.

---

## Preferred architecture
Keep game code split by responsibility.

### Recommended top-level layout
- `src/app/` application shell, routes, providers
- `src/game/engine/` deterministic simulation loop and timing
- `src/game/state/` serializable game state and reducers/update logic
- `src/game/entities/` player, enemies, bullets, pickups, bosses
- `src/game/systems/` spawning, collisions, progression, scoring, AI
- `src/game/rendering/` canvas renderer, camera/world-roll projection, VFX
- `src/game/input/` keyboard/gamepad input mapping
- `src/game/config/` tunable constants and progression tables
- `src/game/ui/` HUD, menus, run summary, upgrade selection
- `src/game/types/` domain types and DTOs
- `src/game/tests/` deterministic simulation and balance tests

### Hard rules
- simulation code must not depend on React
- rendering code must not own game truth
- input mapping must be separate from state transitions
- tuning data should live in config files, not buried in components
- avoid giant god-files
- prefer pure functions for state updates where practical

---

## Core gameplay truths
These truths should remain stable unless an explicit design change is requested.

### Player
- ship stays at or near exact screen center
- ship rotates in full 360°
- ship fires from nose along facing vector
- ship does not use uncontrolled drift physics
- motion fantasy is produced through **world-roll / field translation**
- player may have a precision brake / stabilize mechanic

### Combat space
- outer ring = threat entry space
- middle ring = primary interception zone
- inner ring = danger zone near center

### Enemies
Start simple and expand in layers:
- drifters
- lancers
- turrets
- orbiters
- carriers
- shield units
- support / command units

### Progression
A run should support:
- staged waves
- sector escalation
- elite encounters
- boss thresholds
- temporary pickups
- between-sector upgrade decisions

### Build archetypes
Support these playstyles over time:
- precision burst
- zone control
- survival / sustain

---

## Engineering priorities
### Input feel
Prioritize:
- low-latency rotation
- predictable fire cadence
- stable world-scroll response
- no jitter near 0° / 360° wrap
- consistent delta-time handling

### Determinism
Where practical:
- keep update steps deterministic
- isolate randomness via seeded utilities for tests and replays
- keep spawn tables data-driven

### Performance
- avoid React re-rendering on every simulation tick
- minimize allocations inside the hot loop
- pool particles/projectiles only when profiling justifies it
- do not optimize prematurely, but do not design carelessly

---

## Visual direction
Tone:
- sharp arcade readability
- dark space field
- strong contrast silhouettes
- clear projectile language
- readable enemy telegraphs
- premium but restrained polish

Avoid clutter.
Gameplay readability is more important than decorative backgrounds.

---

## Audio direction
Audio should reinforce:
- rotational precision
- impact clarity
- cadence escalation
- power-up reward
- boss pressure

Do not couple core logic to audio playback.
Use event-style hooks or state-driven triggers.

---

## Safety rails for implementation
Do not:
- introduce heavy libraries for simple game problems
- mix simulation state into React component local state
- implement content-first before input/game-loop quality exists
- add networking/multiplayer unless explicitly requested
- add monetization/inventory/profile systems during core gameplay phase
- refactor unrelated areas just because they look imperfect

When you notice adjacent improvements, mention them in notes instead of opportunistically expanding scope.

---

## Definition of done for any task
A task is not done unless all applicable items below are satisfied:
- implementation matches requested scope
- architecture remains coherent
- no obvious regression in the main loop
- relevant tests are added or updated
- relevant lint/type/build commands pass, or failures are clearly reported
- tuning values are named clearly and kept in discoverable locations
- result is reviewable in small, understandable diffs

---

## Validation expectations
When making gameplay changes, validate at the highest reasonable level available in the repo.

Preferred order:
1. targeted unit tests
2. simulation tests
3. build/typecheck/lint
4. local playable smoke path

If a validation step cannot run, say exactly why.
Do not claim success without evidence.

---

## Recommended commands
Use the repo’s real commands if they exist.
If bootstrapping the project, prefer these defaults:

```bash
npm install
npm run dev
npm run build
npm run test
npm run lint
npm run typecheck
```

If a command is missing, add it intentionally rather than inventing fake validation in the report.

---

## Reporting format after each Codex task
Use this structure:

### Files changed
- list created files
- list modified files

### What was implemented
- concise explanation of behavior and architecture impact

### Validation run
- exact commands run
- pass/fail status
- important output if relevant

### Notes
- assumptions
- follow-up risks
- any deferred work

### Next best move
- one bounded next step only

---

## Execution preferences
For feature work, prefer this order:
1. types/contracts
2. config/tuning tables
3. pure logic
4. renderer integration
5. UI/HUD integration
6. tests
7. polish

For bug fixes, prefer:
1. reproduce
2. isolate cause
3. minimal fix
4. regression test
5. verify

---

## Game-specific implementation roadmap guidance
When asked to build major slices, prioritize in this order:
1. game loop and deterministic state model
2. center-pinned ship rotation and firing
3. world-roll movement model
4. enemy spawning from edges/corners
5. collision, damage, score
6. pickups and temporary power-ups
7. wave/sector progression
8. elites and bosses
9. menus/HUD/meta loop
10. polish, juice, balancing

Do not jump ahead to bosses or advanced content before the core loop feels good.

---

## If repo truth is incomplete
If this repo is new or partially scaffolded:
- create the smallest production-sane foundation
- keep folder naming consistent
- add lightweight docs where needed
- prefer clear defaults over speculative abstraction

When forced to choose, favor **clarity, testability, and incremental growth**.
