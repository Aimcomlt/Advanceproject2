import type { GameState } from '../types/gameTypes';

export function createInitialGameState(width: number, height: number): GameState {
  return {
    tick: 0,
    elapsedMs: 0,
    nextBulletId: 1,
    nextEnemyId: 1,
    worldOffset: { x: 0, y: 0 },
    player: {
      position: {
        x: width / 2,
        y: height / 2
      },
      angleRadians: -Math.PI / 2,
      fireCooldownMs: 0
    },
    bullets: [],
    enemies: [],
    score: 0,
    waveTimerMs: 0,
    enemySpawnTimerMs: 0
  };
}
