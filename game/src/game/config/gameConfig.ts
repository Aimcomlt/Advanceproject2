import type { GameConfig } from '../types/gameTypes';

export const GAME_CONFIG: GameConfig = {
  fixedTimeStepMs: 1000 / 60,
  maxFrameDeltaMs: 100,
  viewport: {
    width: 960,
    height: 540
  }
};
