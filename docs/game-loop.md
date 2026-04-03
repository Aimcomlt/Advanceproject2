# Game loop pipeline

Every fixed tick runs this ordered pipeline:

1. Collect frame input from `createInputController`.
2. Update player aim/control state.
3. Update world-roll intent and offset.
4. Update weapon cooldown and bullet spawning.
5. Update bullets (movement + TTL).
6. Update enemies.
7. Resolve bullet/enemy collisions.
8. Resolve pickup/reward hooks (placeholder seam).
9. Update progression timers and tick counters.
10. Render current state snapshot.

## Why this order
The order preserves combat readability and avoids hidden cross-step side effects. Aiming and world intent happen before fire resolution, then entities move, then collisions resolve, then progression counters advance.
