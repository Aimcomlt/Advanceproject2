export interface Vec2 {
  x: number;
  y: number;
}

export interface PlayerState {
  position: Vec2;
  angleRadians: number;
}

export interface GameState {
  tick: number;
  elapsedMs: number;
  player: PlayerState;
}

export interface GameConfig {
  fixedTimeStepMs: number;
  maxFrameDeltaMs: number;
  viewport: {
    width: number;
    height: number;
  };
}
