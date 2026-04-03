import type { FrameInput } from '../types/gameTypes';

interface InputController {
  readFrameInput(): FrameInput;
  dispose(): void;
}

const INITIAL_FRAME_INPUT: FrameInput = {
  turnLeft: false,
  turnRight: false,
  fire: false,
  stabilize: false
};

export function createInputController(windowRef: Window): InputController {
  const frameInput: FrameInput = { ...INITIAL_FRAME_INPUT };

  const onKeyDown = (event: KeyboardEvent) => {
    applyKey(event.code, true);
  };

  const onKeyUp = (event: KeyboardEvent) => {
    applyKey(event.code, false);
  };

  function applyKey(code: string, isDown: boolean) {
    switch (code) {
      case 'ArrowLeft':
      case 'KeyA':
        frameInput.turnLeft = isDown;
        break;
      case 'ArrowRight':
      case 'KeyD':
        frameInput.turnRight = isDown;
        break;
      case 'Space':
        frameInput.fire = isDown;
        break;
      case 'ShiftLeft':
      case 'ShiftRight':
        frameInput.stabilize = isDown;
        break;
      default:
        break;
    }
  }

  windowRef.addEventListener('keydown', onKeyDown);
  windowRef.addEventListener('keyup', onKeyUp);

  return {
    readFrameInput() {
      return { ...frameInput };
    },
    dispose() {
      windowRef.removeEventListener('keydown', onKeyDown);
      windowRef.removeEventListener('keyup', onKeyUp);
    }
  };
}
