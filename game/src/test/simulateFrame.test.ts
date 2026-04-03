import { describe, expect, it } from 'vitest';
import { GAME_CONFIG } from '../game/config/gameConfig';
import { createInitialGameState } from '../game/state/createInitialGameState';
import { simulateFrame } from '../game/loop/simulateFrame';

describe('simulateFrame pipeline', () => {
  it('advances deterministic progression counters', () => {
    const initial = createInitialGameState(960, 540);
    const next = simulateFrame(
      initial,
      { turnLeft: false, turnRight: false, fire: false, stabilize: false },
      GAME_CONFIG.fixedTimeStepMs,
      GAME_CONFIG
    );

    expect(next.tick).toBe(1);
    expect(next.elapsedMs).toBeCloseTo(GAME_CONFIG.fixedTimeStepMs);
    expect(next.waveTimerMs).toBeCloseTo(GAME_CONFIG.fixedTimeStepMs);
  });

  it('spawns bullets when fire is pressed and cooldown allows', () => {
    const initial = createInitialGameState(960, 540);
    const withBullet = simulateFrame(
      initial,
      { turnLeft: false, turnRight: false, fire: true, stabilize: false },
      GAME_CONFIG.fixedTimeStepMs,
      GAME_CONFIG
    );

    expect(withBullet.bullets.length).toBe(1);
    expect(withBullet.player.fireCooldownMs).toBe(GAME_CONFIG.player.fireCooldownMs);
  });
});
