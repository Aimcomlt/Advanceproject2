export interface Vec2 {
  x: number;
  y: number;
}

export interface PlayerState {
  position: Vec2;
  angleRadians: number;
  fireCooldownMs: number;
}

export interface BulletState {
  id: number;
  position: Vec2;
  velocity: Vec2;
  ttlMs: number;
}

export interface EnemyState {
  id: number;
  position: Vec2;
  velocity: Vec2;
  radius: number;
  health: number;
}

export interface GameState {
  tick: number;
  elapsedMs: number;
  nextBulletId: number;
  nextEnemyId: number;
  worldOffset: Vec2;
  player: PlayerState;
  bullets: BulletState[];
  enemies: EnemyState[];
  score: number;
  waveTimerMs: number;
  enemySpawnTimerMs: number;
}

export interface FrameInput {
  turnLeft: boolean;
  turnRight: boolean;
  fire: boolean;
  stabilize: boolean;
}

export interface GameConfig {
  fixedTimeStepMs: number;
  maxFrameDeltaMs: number;
  viewport: {
    width: number;
    height: number;
  };
  player: {
    turnSpeedRadPerSec: number;
    fireCooldownMs: number;
  };
  world: {
    scrollSpeedPerSec: number;
  };
  bullet: {
    speedPerSec: number;
    ttlMs: number;
    radius: number;
  };
  enemy: {
    speedPerSec: number;
    radius: number;
    collisionDamage: number;
    health: number;
    spawnIntervalMs: number;
    maxActive: number;
  };
}
