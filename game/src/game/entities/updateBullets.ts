import type { BulletState, GameState } from '../types/gameTypes';

export function updateBullets(state: GameState, fixedDeltaMs: number): GameState {
  const deltaSeconds = fixedDeltaMs / 1000;

  const nextBullets = state.bullets
    .map((bullet): BulletState => ({
      ...bullet,
      ttlMs: bullet.ttlMs - fixedDeltaMs,
      position: {
        x: bullet.position.x + bullet.velocity.x * deltaSeconds,
        y: bullet.position.y + bullet.velocity.y * deltaSeconds
      }
    }))
    .filter((bullet) => bullet.ttlMs > 0);

  return {
    ...state,
    bullets: nextBullets
  };
}
