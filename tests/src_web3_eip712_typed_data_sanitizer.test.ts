import { describe, it, expect } from 'vitest';
import { Eip712TypedDataSanitizer } from '../src/web3/eip712_typed_data_sanitizer.js';

describe('Eip712TypedDataSanitizer Invariant Suite (#1775)', () => {
  it('correctly intercepts dangerous pattern', () => {
    const result = Eip712TypedDataSanitizer.inspect('rm -rf /production');
    expect(result.isThreat).toBe(true);
    expect(result.invariant).toBe('RULE_INVARIANT_EIP712_TYPED_DATA_SANITIZER');
    expect(Eip712TypedDataSanitizer.validate('rm -rf /production')).toBe(false);
  });

  it('permits verified safe engineering command', () => {
    const result = Eip712TypedDataSanitizer.inspect('git status && npm run test');
    expect(result.isThreat).toBe(false);
    expect(Eip712TypedDataSanitizer.validate('git status && npm run test')).toBe(true);
  });
});
