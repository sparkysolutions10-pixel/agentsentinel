import { describe, it, expect } from 'vitest';
import { SessionAutoExpirationClamp } from '../src/crypto/session_clamp.js';

describe('Crypto Session Clamp (#873 & #874)', () => {
  it('triggers rekeying after hitting max message threshold', () => {
    const clamp = new SessionAutoExpirationClamp({ maxMessages: 5 });
    for (let i = 0; i < 4; i++) {
      expect(clamp.step()).toBe(false);
    }
    expect(clamp.step()).toBe(true);
    expect(clamp.shouldRekey()).toBe(true);

    clamp.reset();
    expect(clamp.shouldRekey()).toBe(false);
  });
});
