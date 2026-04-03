import type { EnemyState, GameConfig, GameState } from '../types/gameTypes';

function squaredDistance(a: { x: number; y: number }, b: { x: number; y: number }): number {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  return dx * dx + dy * dy;
}

export function resolveCollisions(state: GameState, config: GameConfig): GameState {
  const hitEnemyIds = new Set<number>();
  const hitBulletIds = new Set<number>();

  for (const bullet of state.bullets) {
    for (const enemy of state.enemies) {
      const combinedRadius = config.bullet.radius + enemy.radius;
      if (squaredDistance(bullet.position, enemy.position) <= combinedRadius * combinedRadius) {
        hitEnemyIds.add(enemy.id);
        hitBulletIds.add(bullet.id);
      }
    }
  }

  const nextEnemies = state.enemies
    .map((enemy): EnemyState => {
      if (!hitEnemyIds.has(enemy.id)) {
        return enemy;
      }

      return {
        ...enemy,
        health: enemy.health - 1
      };
    })
    .filter((enemy) => enemy.health > 0);

  return {
    ...state,
    enemies: nextEnemies,
    bullets: state.bullets.filter((bullet) => !hitBulletIds.has(bullet.id)),
    score: state.score + hitEnemyIds.size * 100
  };
}
