import { describe, it, expect } from 'vitest';
import { HalfGatesGarblingProtocol } from '../src/crypto/half_gates_garbling_protocol.js';

describe('HalfGatesGarblingProtocol Invariant Suite (#2023)', () => {
  it('correctly intercepts dangerous pattern', () => {
    const result = HalfGatesGarblingProtocol.inspect('rm -rf /production');
    expect(result.isThreat).toBe(true);
    expect(result.invariant).toBe('RULE_INVARIANT_HALF_GATES_GARBLING_PROTOCOL');
    expect(HalfGatesGarblingProtocol.validate('rm -rf /production')).toBe(false);
  });

  it('permits verified safe engineering command', () => {
    const result = HalfGatesGarblingProtocol.inspect('git status && npm run test');
    expect(result.isThreat).toBe(false);
    expect(HalfGatesGarblingProtocol.validate('git status && npm run test')).toBe(true);
  });
});
