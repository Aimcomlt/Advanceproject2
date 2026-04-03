import type { FrameInput, GameConfig, GameState } from '../types/gameTypes';
import { updatePlayerAim } from '../systems/updatePlayerAim';
import { updateWorldRoll } from '../systems/updateWorldRoll';
import { updateWeapons } from '../weapons/updateWeapons';
import { updateBullets } from '../entities/updateBullets';
import { updateEnemies } from '../entities/updateEnemies';
import { resolveCollisions } from '../collisions/resolveCollisions';
import { resolvePickups } from '../progression/resolvePickups';
import { updateProgression } from '../progression/updateProgression';

export function simulateFrame(
  state: GameState,
  input: FrameInput,
  fixedDeltaMs: number,
  config: GameConfig
): GameState {
  let nextState = state;

  nextState = updatePlayerAim(nextState, input, fixedDeltaMs, config);
  nextState = updateWorldRoll(nextState, input, fixedDeltaMs, config);
  nextState = updateWeapons(nextState, input, fixedDeltaMs, config);
  nextState = updateBullets(nextState, fixedDeltaMs);
  nextState = updateEnemies(nextState, fixedDeltaMs);
  nextState = resolveCollisions(nextState, config);
  nextState = resolvePickups(nextState);
  nextState = updateProgression(nextState, fixedDeltaMs);

  return nextState;
}
