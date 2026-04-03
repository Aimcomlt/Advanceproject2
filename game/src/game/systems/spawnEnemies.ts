import type { EnemyState, GameConfig, GameState, Vec2 } from '../types/gameTypes';

type SpawnLane =
  | 'edge-top'
  | 'edge-right'
  | 'edge-bottom'
  | 'edge-left'
  | 'corner-top-left'
  | 'corner-top-right'
  | 'corner-bottom-right'
  | 'corner-bottom-left';

const SPAWN_LANES: SpawnLane[] = [
  'edge-top',
  'edge-right',
  'edge-bottom',
  'edge-left',
  'corner-top-left',
  'corner-top-right',
  'corner-bottom-right',
  'corner-bottom-left'
];

const EDGE_MARGIN = 40;
const CORNER_MARGIN = 28;

function laneForEnemyId(enemyId: number): SpawnLane {
  return SPAWN_LANES[(enemyId - 1) % SPAWN_LANES.length];
}

function createEnemyForLane(enemyId: number, lane: SpawnLane, config: GameConfig): EnemyState {
  const { width, height } = config.viewport;
  const center = { x: width / 2, y: height / 2 };

  let position: Vec2;

  switch (lane) {
    case 'edge-top':
      position = { x: width / 2, y: -EDGE_MARGIN };
      break;
    case 'edge-right':
      position = { x: width + EDGE_MARGIN, y: height / 2 };
      break;
    case 'edge-bottom':
      position = { x: width / 2, y: height + EDGE_MARGIN };
      break;
    case 'edge-left':
      position = { x: -EDGE_MARGIN, y: height / 2 };
      break;
    case 'corner-top-left':
      position = { x: -CORNER_MARGIN, y: -CORNER_MARGIN };
      break;
    case 'corner-top-right':
      position = { x: width + CORNER_MARGIN, y: -CORNER_MARGIN };
      break;
    case 'corner-bottom-right':
      position = { x: width + CORNER_MARGIN, y: height + CORNER_MARGIN };
      break;
    case 'corner-bottom-left':
      position = { x: -CORNER_MARGIN, y: height + CORNER_MARGIN };
      break;
  }

  const toCenterX = center.x - position.x;
  const toCenterY = center.y - position.y;
  const length = Math.hypot(toCenterX, toCenterY) || 1;
  const speed = config.enemy.speedPerSec;

  return {
    id: enemyId,
    position,
    velocity: {
      x: (toCenterX / length) * speed,
      y: (toCenterY / length) * speed
    },
    radius: config.enemy.radius,
    health: config.enemy.health
  };
}

export function spawnEnemies(state: GameState, fixedDeltaMs: number, config: GameConfig): GameState {
  const activeCapacity = config.enemy.maxActive - state.enemies.length;
  const accumulatedTimerMs = state.enemySpawnTimerMs + fixedDeltaMs;

  if (activeCapacity <= 0 || accumulatedTimerMs < config.enemy.spawnIntervalMs) {
    return {
      ...state,
      enemySpawnTimerMs: accumulatedTimerMs
    };
  }

  const spawnCount = Math.min(
    Math.floor(accumulatedTimerMs / config.enemy.spawnIntervalMs),
    activeCapacity
  );

  const spawnedEnemies = Array.from({ length: spawnCount }, (_, index) => {
    const enemyId = state.nextEnemyId + index;
    return createEnemyForLane(enemyId, laneForEnemyId(enemyId), config);
  });

  return {
    ...state,
    enemies: [...state.enemies, ...spawnedEnemies],
    nextEnemyId: state.nextEnemyId + spawnCount,
    enemySpawnTimerMs: accumulatedTimerMs - spawnCount * config.enemy.spawnIntervalMs
  };
}
