# Game loop pipeline

Every fixed tick runs this ordered pipeline:

1. Collect frame input from `createInputController`.
2. Update player aim/control state.
3. Update world-roll intent and offset.
4. Spawn enemies from deterministic edge/corner lanes.
5. Update weapon cooldown and bullet spawning.
6. Update bullets (movement + TTL).
7. Update enemies.
8. Resolve bullet/enemy collisions.
9. Resolve pickup/reward hooks (placeholder seam).
10. Update progression timers and tick counters.
11. Render current state snapshot.

## Why this order
The order preserves combat readability and avoids hidden cross-step side effects. Aiming and world intent happen before spawn/fire resolution, then entities move, then collisions resolve, then progression counters advance.
