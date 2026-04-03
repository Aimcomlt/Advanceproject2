interface FixedStepLoopOptions {
  fixedTimeStepMs: number;
  maxFrameDeltaMs: number;
  onFixedUpdate: (fixedDeltaMs: number) => void;
  onRender: (alpha: number) => void;
}

export interface FixedStepLoop {
  start: () => void;
  stop: () => void;
}

export function createFixedStepLoop(options: FixedStepLoopOptions): FixedStepLoop {
  let rafId: number | null = null;
  let lastFrameTimeMs = 0;
  let accumulatorMs = 0;

  const frame = (timestampMs: number) => {
    if (lastFrameTimeMs === 0) {
      lastFrameTimeMs = timestampMs;
    }

    const rawDeltaMs = timestampMs - lastFrameTimeMs;
    const clampedDeltaMs = Math.min(rawDeltaMs, options.maxFrameDeltaMs);
    lastFrameTimeMs = timestampMs;
    accumulatorMs += clampedDeltaMs;

    while (accumulatorMs >= options.fixedTimeStepMs) {
      options.onFixedUpdate(options.fixedTimeStepMs);
      accumulatorMs -= options.fixedTimeStepMs;
    }

    const alpha = accumulatorMs / options.fixedTimeStepMs;
    options.onRender(alpha);

    rafId = window.requestAnimationFrame(frame);
  };

  return {
    start() {
      if (rafId !== null) {
        return;
      }

      lastFrameTimeMs = 0;
      accumulatorMs = 0;
      rafId = window.requestAnimationFrame(frame);
    },
    stop() {
      if (rafId === null) {
        return;
      }

      window.cancelAnimationFrame(rafId);
      rafId = null;
      lastFrameTimeMs = 0;
      accumulatorMs = 0;
    }
  };
}
