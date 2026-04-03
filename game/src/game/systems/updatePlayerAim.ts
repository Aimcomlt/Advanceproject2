import type { FrameInput, GameConfig, GameState } from '../types/gameTypes';
import { normalizeAngleRadians } from '../utils/math';

export function updatePlayerAim(
  state: GameState,
  input: FrameInput,
  fixedDeltaMs: number,
  config: GameConfig
): GameState {
  const deltaSeconds = fixedDeltaMs / 1000;
  const turnDirection = Number(input.turnRight) - Number(input.turnLeft);
  const nextAngle = normalizeAngleRadians(
    state.player.angleRadians + turnDirection * config.player.turnSpeedRadPerSec * deltaSeconds
  );

  return {
    ...state,
    player: {
      ...state.player,
      angleRadians: nextAngle
    }
  };
}
