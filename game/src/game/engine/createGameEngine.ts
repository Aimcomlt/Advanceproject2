import type { GameConfig, GameState } from '../types/gameTypes';
import { createInitialGameState } from '../state/createInitialGameState';
import { renderGame } from '../rendering/renderGame';
import { createFixedStepLoop } from './createFixedStepLoop';
import { createInputController } from '../input/createInputController';
import { simulateFrame } from '../loop/simulateFrame';

interface CreateGameEngineOptions {
  canvas: HTMLCanvasElement;
  config: GameConfig;
}

export function createGameEngine({ canvas, config }: CreateGameEngineOptions) {
  const context = canvas.getContext('2d');

  if (!context) {
    throw new Error('Canvas 2D context is required for the game engine.');
  }

  const inputController = createInputController(window);
  let gameState: GameState = createInitialGameState(config.viewport.width, config.viewport.height);

  const loop = createFixedStepLoop({
    fixedTimeStepMs: config.fixedTimeStepMs,
    maxFrameDeltaMs: config.maxFrameDeltaMs,
    onFixedUpdate: (fixedDeltaMs) => {
      const input = inputController.readFrameInput();
      gameState = simulateFrame(gameState, input, fixedDeltaMs, config);
    },
    onRender: (alpha) => {
      renderGame(context, gameState, alpha);
    }
  });

  return {
    start: () => loop.start(),
    stop: () => {
      loop.stop();
      inputController.dispose();
    },
    getState: () => gameState
  };
}
