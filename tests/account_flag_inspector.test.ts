import { describe, it, expect } from 'vitest';
import { AccountFlagInspector } from '../src/utils/account_flag_inspector.js';

describe('AccountFlagInspector', () => {
  it('decodes bitmask into individual boolean flags', () => {
    // 0x1 (required) + 0x2 (revocable) = 3
    const decoded = AccountFlagInspector.decode(3);
    expect(decoded.authRequired).toBe(true);
    expect(decoded.authRevocable).toBe(true);
    expect(decoded.authImmutable).toBe(false);
    expect(decoded.authClawbackEnabled).toBe(false);
  });

  it('encodes flags back to bitmask', () => {
    const bitmask = AccountFlagInspector.encode({
      authRequired: true,
      authClawbackEnabled: true
    });
    expect(bitmask).toBe(9); // 1 + 8
  });
});
