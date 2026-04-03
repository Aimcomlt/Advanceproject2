import type { EnemyState, GameState } from '../types/gameTypes';

export function updateEnemies(state: GameState, fixedDeltaMs: number): GameState {
  const deltaSeconds = fixedDeltaMs / 1000;

  const nextEnemies = state.enemies.map((enemy): EnemyState => ({
    ...enemy,
    position: {
      x: enemy.position.x + enemy.velocity.x * deltaSeconds,
      y: enemy.position.y + enemy.velocity.y * deltaSeconds
    }
  }));

  return {
    ...state,
    enemies: nextEnemies
  };
}
