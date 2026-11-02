import { describe, it, expect } from 'vitest';
import { CryptoExecutionJitter } from '../src/crypto/jitter_injector.js';

describe('Random Execution Jitter Injector (#857 & #858)', () => {
  it('generates non-deterministic jitter within configured boundaries', () => {
    const jitter1 = CryptoExecutionJitter.getRandomJitterMicroseconds(100, 300);
    expect(jitter1).toBeGreaterThanOrEqual(100);
    expect(jitter1).toBeLessThanOrEqual(300);
  });

  it('delays execution to obscure side-channel correlations', async () => {
    const start = Date.now();
    await CryptoExecutionJitter.injectJitterMs(5, 10);
    const elapsed = Date.now() - start;
    expect(elapsed).toBeGreaterThanOrEqual(4);
  });
});
