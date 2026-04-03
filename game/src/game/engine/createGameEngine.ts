import type { GameConfig, GameState } from '../types/gameTypes';
import { createInitialGameState } from '../state/createInitialGameState';
import { updateGameState } from '../state/updateGameState';
import { renderGame } from '../rendering/renderGame';
import { createFixedStepLoop } from './createFixedStepLoop';

interface CreateGameEngineOptions {
  canvas: HTMLCanvasElement;
  config: GameConfig;
}

export function createGameEngine({ canvas, config }: CreateGameEngineOptions) {
  const context = canvas.getContext('2d');

  if (!context) {
    throw new Error('Canvas 2D context is required for the game engine scaffold.');
  }

  let gameState: GameState = createInitialGameState(config.viewport.width, config.viewport.height);

  const loop = createFixedStepLoop({
    fixedTimeStepMs: config.fixedTimeStepMs,
    maxFrameDeltaMs: config.maxFrameDeltaMs,
    onFixedUpdate: (fixedDeltaMs) => {
      gameState = updateGameState(gameState, fixedDeltaMs);
    },
    onRender: (alpha) => {
      renderGame(context, gameState, alpha);
    }
  });

  return {
    start: () => loop.start(),
    stop: () => loop.stop(),
    getState: () => gameState
  };
}
