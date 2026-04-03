import type { GameState } from '../types/gameTypes';

export function createInitialGameState(width: number, height: number): GameState {
  return {
    tick: 0,
    elapsedMs: 0,
    player: {
      position: {
        x: width / 2,
        y: height / 2
      },
      angleRadians: -Math.PI / 2
    }
  };
}
