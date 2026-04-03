import { describe, expect, it } from 'vitest';
import { GAME_CONFIG } from '../game/config/gameConfig';
import { createInitialGameState } from '../game/state/createInitialGameState';
import { spawnEnemies } from '../game/systems/spawnEnemies';

function createTestConfig(overrides?: Partial<(typeof GAME_CONFIG)['enemy']>) {
  return {
    ...GAME_CONFIG,
    enemy: {
      ...GAME_CONFIG.enemy,
      ...overrides
    }
  };
}

describe('spawnEnemies', () => {
  it('does not spawn before spawn interval is reached', () => {
    const initial = createInitialGameState(960, 540);
    const config = createTestConfig({ spawnIntervalMs: 1000 });

    const next = spawnEnemies(initial, 500, config);

    expect(next.enemies).toHaveLength(0);
    expect(next.enemySpawnTimerMs).toBe(500);
  });

  it('spawns deterministic lanes in a repeating edge/corner sequence', () => {
    const initial = createInitialGameState(960, 540);
    const config = createTestConfig({ spawnIntervalMs: 100, maxActive: 16 });

    const spawned = spawnEnemies(initial, 800, config);

    expect(spawned.enemies).toHaveLength(8);

    const positions = spawned.enemies.map((enemy) => enemy.position);
    expect(positions[0]).toEqual({ x: 480, y: -40 });
    expect(positions[1]).toEqual({ x: 1000, y: 270 });
    expect(positions[2]).toEqual({ x: 480, y: 580 });
    expect(positions[3]).toEqual({ x: -40, y: 270 });
    expect(positions[4]).toEqual({ x: -28, y: -28 });
    expect(positions[5]).toEqual({ x: 988, y: -28 });
    expect(positions[6]).toEqual({ x: 988, y: 568 });
    expect(positions[7]).toEqual({ x: -28, y: 568 });

    expect(spawned.nextEnemyId).toBe(9);
    expect(spawned.enemySpawnTimerMs).toBe(0);
  });

  it('respects max active enemy cap', () => {
    const initial = createInitialGameState(960, 540);
    const config = createTestConfig({ spawnIntervalMs: 100, maxActive: 2 });

    const spawned = spawnEnemies(initial, 400, config);

    expect(spawned.enemies).toHaveLength(2);
    expect(spawned.nextEnemyId).toBe(3);
    expect(spawned.enemySpawnTimerMs).toBe(200);
  });
});
