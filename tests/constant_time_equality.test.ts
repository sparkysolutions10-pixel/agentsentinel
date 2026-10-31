import { describe, it, expect } from 'vitest';
import { ConstantTimeEquality } from '../src/utils/constant_time_equality.js';

describe('ConstantTimeEquality', () => {
  it('returns true for identical strings and buffers', () => {
    expect(ConstantTimeEquality.areEqual('secret_token_123', 'secret_token_123')).toBe(true);
    expect(ConstantTimeEquality.areEqual(new Uint8Array([1, 2, 3]), new Uint8Array([1, 2, 3]))).toBe(true);
  });

  it('returns false for unequal strings and different lengths', () => {
    expect(ConstantTimeEquality.areEqual('tokenA', 'tokenB')).toBe(false);
    expect(ConstantTimeEquality.areEqual('short', 'longer_string')).toBe(false);
  });
});
