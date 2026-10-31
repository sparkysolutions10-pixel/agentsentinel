import { describe, it, expect } from 'vitest';
import { MemoTypeValidator } from '../src/utils/memo_type_validator.js';

describe('MemoTypeValidator', () => {
  it('validates text memo within 28 UTF-8 bytes', () => {
    const res = MemoTypeValidator.validateTextMemo('Payment ref: 12345');
    expect(res.valid).toBe(true);
  });

  it('rejects text memo exceeding 28 bytes', () => {
    const res = MemoTypeValidator.validateTextMemo('This memo text is definitely way too long to fit in 28 bytes');
    expect(res.valid).toBe(false);
    expect(res.error).toContain('exceeds 28 bytes');
  });

  it('validates uint64 ID memo', () => {
    expect(MemoTypeValidator.validateIdMemo('123456789').valid).toBe(true);
    expect(MemoTypeValidator.validateIdMemo('18446744073709551615').valid).toBe(true);
    expect(MemoTypeValidator.validateIdMemo('-1').valid).toBe(false);
    expect(MemoTypeValidator.validateIdMemo('18446744073709551616').valid).toBe(false);
    expect(MemoTypeValidator.validateIdMemo('not_a_number').valid).toBe(false);
  });

  it('validates 32-byte hex hash/return memo', () => {
    const validHex = 'a'.repeat(64);
    expect(MemoTypeValidator.validateHashMemo(validHex, 'hash').valid).toBe(true);
    expect(MemoTypeValidator.validateHashMemo(validHex, 'return').valid).toBe(true);
    expect(MemoTypeValidator.validateHashMemo('short', 'hash').valid).toBe(false);
  });
});
