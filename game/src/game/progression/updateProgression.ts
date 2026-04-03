import type { GameState } from '../types/gameTypes';

export function updateProgression(state: GameState, fixedDeltaMs: number): GameState {
  return {
    ...state,
    tick: state.tick + 1,
    elapsedMs: state.elapsedMs + fixedDeltaMs,
    waveTimerMs: state.waveTimerMs + fixedDeltaMs
  };
}
