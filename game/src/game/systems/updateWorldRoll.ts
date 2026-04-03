import type { FrameInput, GameConfig, GameState } from '../types/gameTypes';
import { addVector, facingVector, scaleVector } from '../utils/math';

export function updateWorldRoll(
  state: GameState,
  input: FrameInput,
  fixedDeltaMs: number,
  config: GameConfig
): GameState {
  const deltaSeconds = fixedDeltaMs / 1000;
  const stabilizeModifier = input.stabilize ? 0.4 : 1;
  const rollVector = scaleVector(
    facingVector(state.player.angleRadians),
    -config.world.scrollSpeedPerSec * stabilizeModifier * deltaSeconds
  );

  return {
    ...state,
    worldOffset: addVector(state.worldOffset, rollVector)
  };
}
