import type { FrameInput, GameConfig, GameState } from '../types/gameTypes';
import { facingVector, scaleVector } from '../utils/math';

export function updateWeapons(
  state: GameState,
  input: FrameInput,
  fixedDeltaMs: number,
  config: GameConfig
): GameState {
  const cooldownMs = Math.max(0, state.player.fireCooldownMs - fixedDeltaMs);

  if (!input.fire || cooldownMs > 0) {
    return {
      ...state,
      player: {
        ...state.player,
        fireCooldownMs: cooldownMs
      }
    };
  }

  const velocity = scaleVector(facingVector(state.player.angleRadians), config.bullet.speedPerSec);

  return {
    ...state,
    nextBulletId: state.nextBulletId + 1,
    player: {
      ...state.player,
      fireCooldownMs: config.player.fireCooldownMs
    },
    bullets: [
      ...state.bullets,
      {
        id: state.nextBulletId,
        position: { ...state.player.position },
        velocity,
        ttlMs: config.bullet.ttlMs
      }
    ]
  };
}
