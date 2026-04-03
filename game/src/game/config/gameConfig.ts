import type { GameConfig } from '../types/gameTypes';

export const GAME_CONFIG: GameConfig = {
  fixedTimeStepMs: 1000 / 60,
  maxFrameDeltaMs: 100,
  viewport: {
    width: 960,
    height: 540
  },
  player: {
    turnSpeedRadPerSec: Math.PI * 2,
    fireCooldownMs: 150
  },
  world: {
    scrollSpeedPerSec: 130
  },
  bullet: {
    speedPerSec: 480,
    ttlMs: 1300,
    radius: 3
  },
  enemy: {
    speedPerSec: 38,
    radius: 12,
    collisionDamage: 0
  }
};
