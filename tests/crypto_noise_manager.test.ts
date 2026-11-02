import { describe, it, expect } from 'vitest';
import { FheNoiseManager } from '../src/crypto/noise_manager.js';

describe('FHE Bootstrapping Noise Manager (#839 & #840)', () => {
  it('tracks noise growth across multi-level operations and bootstraps budget', () => {
    const manager = new FheNoiseManager(100);
    expect(manager.getState().bootstrapsPerformed).toBe(0);

    // Consume budget past threshold
    for (let i = 0; i < 6; i++) {
      manager.consumeNoise(15);
    }

    const state = manager.getState();
    expect(state.bootstrapsPerformed).toBeGreaterThan(0);
    expect(state.currentNoiseBudgetBits).toBeGreaterThan(20);
  });
});
