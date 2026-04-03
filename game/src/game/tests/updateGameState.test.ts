import { describe, expect, it } from 'vitest';
import { createInitialGameState } from '../state/createInitialGameState';
import { updateGameState } from '../state/updateGameState';

describe('updateGameState', () => {
  it('increments deterministic counters each fixed step', () => {
    const initialState = createInitialGameState(960, 540);
    const nextState = updateGameState(initialState, 16.6667);

    expect(nextState.tick).toBe(1);
    expect(nextState.elapsedMs).toBeCloseTo(16.6667, 4);
    expect(nextState.player).toEqual(initialState.player);
  });
});
