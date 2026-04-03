# execplan.md

## Project
Center-pinned 360° arcade shooter with directional world-roll, invading edge/corner enemies, escalating wave cadence, power-ups, elite encounters, and boss thresholds.

---

## 1. Executive intent
Build a playable, production-sane MVP that proves the core identity of the game:
- stable center-pinned ship
- excellent rotational control
- outward shooting
- world-scroll movement fantasy
- readable edge pressure
- escalating but fair enemy cadence

The first shipped milestone is **not** content-complete.
It is a **tight-feel MVP** with enough structure to scale safely.

---

## 2. Product pillars
### Pillar A — Stability over drift
The player should feel anchored, readable, and in control.

### Pillar B — Rotational mastery
The challenge comes from angle choice, target priority, and firing rhythm.

### Pillar C — Pressure from directions
Threats should feel spatially organized by side/corner entry lanes.

### Pillar D — Escalating cadence
Difficulty should increase through composition and timing, not random chaos.

### Pillar E — Reviewable production growth
The codebase should expand through small, testable, bounded slices.

---

## 3. Non-goals for initial delivery
Do not include these in the MVP unless explicitly requested:
- multiplayer
- online leaderboards
- account/profile systems
- cosmetic unlock economy
- story campaign
- procedural universe map beyond run/sector structure
- 3D rendering
- heavy engine/framework migration

---

## 4. Recommended technical baseline
Preferred default stack:
- Vite
- React
- TypeScript
- Canvas 2D gameplay renderer
- Vitest
- ESLint

Architectural rule:
- React owns shell/UI
- game engine owns simulation truth
- renderer projects state to screen
- config owns tuning

---

## 5. Core gameplay contract
### Player contract
- ship remains at screen center
- player rotates 360°
- nose indicates fire vector
- bullets originate from nose
- movement is represented by field/world-roll rather than free drift
- optional stabilize/brake input may reduce perceived motion for precision

### Battlefield contract
- enemies spawn from edges or corners
- screen rings communicate interception urgency
- inner radius defines danger near center
- score, health, cooldown, and active power-up state remain readable at all times

### Progression contract
- game is structured into waves or sectors
- sectors escalate enemy composition and pace
- periodic elite encounters and bosses punctuate runs
- pickups occur inside runs
- upgrade selections occur between sectors or thresholds

---

## 6. Milestone map

## Milestone 0 — Repo foundation
### Goal
Create a clean, production-sane project skeleton.

### Deliverables
- app shell
- game route/screen
- canvas mount
- engine loop scaffold
- type/lint/test/build scripts
- config constants scaffold
- AGENTS.md and execplan.md committed

### Acceptance criteria
- app boots locally
- blank or placeholder gameplay surface renders
- build passes
- lint/typecheck/test commands exist

---

## Milestone 1 — Core feel prototype
### Goal
Prove the game is fun at the control level before adding content breadth.

### Deliverables
- fixed center player ship
- 360° rotation
- primary fire
- bullet lifetime and collision stubs
- directional world-roll prototype
- minimal HUD with health/score/fire cadence
- pause/restart controls

### Acceptance criteria
- player rotation feels responsive and stable
- no visible angle-wrap glitch at 359°→0°
- world-roll direction matches ship aim intuitively
- firing is reliable and consistent under held input and tap input
- playable smoke test passes

### Validation
- unit tests for angle normalization and facing vector math
- build/lint/typecheck

---

## Milestone 2 — Combat fundamentals
### Goal
Establish the smallest complete combat loop.

### Deliverables
- enemy base type
- edge spawn system
- corner spawn support
- movement profiles for drifters and lancers
- bullet/enemy collisions
- player damage model
- despawn rules
- scoring and kill feedback

### Acceptance criteria
- at least two enemy families behave distinctly
- score increments correctly
- player can lose and restart cleanly
- no soft-lock when enemy counts reach zero

### Validation
- simulation tests for spawn cadence and collision outcomes
- playable smoke path

---

## Milestone 3 — Readability and pressure shaping
### Goal
Make the battlefield understandable and strategically interesting.

### Deliverables
- combat ring / danger ring visual language
- spawn telegraphs
- enemy entry indicators from edges/corners
- hit flashes / death cues
- danger feedback near center
- first ranged enemy behavior (turret or shooter)

### Acceptance criteria
- threat direction is readable before impact
- player can identify urgent targets quickly
- combat clarity improves without cluttering the screen

### Validation
- manual playtest checklist
- render smoke test if available

---

## Milestone 4 — Power-up system
### Goal
Add run texture and tactical decision-making.

### Deliverables
- pickup spawn/drop rules
- pickup magnet or collection radius
- at least 3 temporary power-ups
- at least 1 defensive utility
- HUD indicators for active effects

### Recommended first set
- rapid fire
- spread shot
- temporary shield
- pulse burst

### Acceptance criteria
- pickups spawn intentionally, not randomly everywhere
- temporary effects start/end cleanly
- stacking rules are explicit and tested

### Validation
- timer/state transition tests
- pickup collision tests

---

## Milestone 5 — Wave and sector progression
### Goal
Turn the sandbox into a structured run.

### Deliverables
- wave definitions
- difficulty cadence table
- sector progression model
- between-sector summary
- upgrade selection screen or choice prompt
- run-over summary

### Acceptance criteria
- player can complete a multi-wave sequence
- difficulty ramps through timing and composition
- sector transition state is stable and readable

### Validation
- progression state-machine tests
- config coverage checks where practical

---

## Milestone 6 — Enemy expansion
### Goal
Broaden the tactical space without destabilizing the base loop.

### Deliverables
- orbiters
- shield units
- carrier/support unit
- command behavior or buff aura
- composition tables by sector

### Acceptance criteria
- each new enemy adds a distinct decision burden
- no enemy duplicates another role without reason
- mixed-wave readability remains acceptable

### Validation
- focused behavior tests
- balance notes captured in config comments or docs

---

## Milestone 7 — Elite and boss encounters
### Goal
Create memorable pacing peaks.

### Deliverables
- elite encounter framework
- first mini-boss
- first full boss
- boss telegraphs and phase logic
- reward payout after clear

### Recommended first boss
**Corner Warden**
- attacks from diagonal quadrants
- lane denial bursts
- summon windows from alternating corners

### Acceptance criteria
- boss feels fair and learnable
- attack phases are telegraphed
- victory and defeat states are stable

### Validation
- phase transition tests
- manual scripted playtest checklist

---

## Milestone 8 — Polish and production hardening
### Goal
Raise the game from prototype to production-grade MVP.

### Deliverables
- input buffering or refinements if needed
- screen shake / recoil / impact polish kept subtle
- audio event wiring
- settings for volume and controls
- balancing pass
- performance pass
- final QA checklist

### Acceptance criteria
- stable frame pacing on target hardware
- no major memory churn in hot loop
- controls feel intentional and finished
- MVP can be demoed confidently

### Validation
- full local validation suite
- repeated manual smoke sessions

---

## 7. Suggested repo structure
```text
src/
  app/
  game/
    config/
    engine/
    entities/
    input/
    rendering/
    state/
    systems/
    types/
    ui/
    tests/
```

Optional later:
```text
docs/
  design/
  balancing/
  playtest/
```

---

## 8. Initial domain model
Create and stabilize these early:
- `Vec2`
- `AngleRadians` or normalized angle helpers
- `PlayerState`
- `EnemyState`
- `BulletState`
- `PickupState`
- `WaveDefinition`
- `SectorDefinition`
- `RunState`
- `GameMode`
- `CollisionResult`

Prefer explicit, serializable state over class-heavy hidden mutation.

---

## 9. High-risk areas
These areas deserve tighter review and tests:
- 0° / 360° angle normalization
- world-roll sign/direction correctness
- collision consistency under variable frame time
- spawning off-screen and entry timing
- temporary effect expiry
- sector transition cleanup
- restart/reset correctness

---

## 10. Testing strategy
### Unit tests
Cover:
- angle math
- vector math
- cooldown timers
- pickup duration handling
- wave selection rules

### Simulation tests
Cover:
- deterministic spawn sequences
- collision outcomes
- score updates
- defeat/victory transitions

### Manual smoke checklist
Verify:
- start run
- rotate left/right continuously
- fire continuously
- survive first waves
- collect pickup
- clear wave
- die and restart
- no stuck HUD or frozen loop

---

## 11. Tuning strategy
All values likely to change should live in config.
Examples:
- fire rate
- turn speed
- world-roll speed
- enemy health
- spawn interval
- score awards
- pickup duration
- boss phase thresholds

Do not bury live balance constants in rendering or React components.

---

## 12. Production-quality rules for Codex execution
For every substantial task:
1. plan first
2. implement a bounded slice
3. keep diffs reviewable
4. run validation
5. report clearly

Required task report shape:
- files created
- files modified
- concise explanation
- validation run
- notes
- next best move

If the repository is incomplete, Codex should create the minimum viable scaffolding needed to keep progress clean and testable.

---

## 13. First bounded implementation sequence
This is the recommended order for the first real build pass.

### Pass 1
Bootstrap repo and canvas game shell.

### Pass 2
Implement deterministic engine loop and central player rotation.

### Pass 3
Implement bullets and basic firing cadence.

### Pass 4
Implement world-roll projection.

### Pass 5
Implement first enemy spawner and collision loop.

### Pass 6
Implement score/health/game-over loop.

### Pass 7
Add first pickup and first ranged enemy.

### Pass 8
Add wave progression and sector UI.

Each pass should remain independently reviewable and runnable.

---

## 14. Definition of MVP success
The MVP is successful when a player can:
- start the game immediately
- understand the center-pinned control fantasy within seconds
- survive multiple escalating waves
- collect useful power-ups
- face at least one elite or boss-style encounter
- lose, restart, and immediately want another run

That is the threshold before expanding scope.
