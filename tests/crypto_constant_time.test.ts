import { describe, it, expect } from 'vitest';
import { ConstantTimeComparator } from '../src/crypto/constant_time_rule.js';

describe('Constant Time String Comparison (#855 & #856)', () => {
  it('correctly matches identical secrets and rejects mismatched secrets', () => {
    expect(ConstantTimeComparator.compare('secret_token_123', 'secret_token_123')).toBe(true);
    expect(ConstantTimeComparator.compare('secret_token_123', 'secret_token_456')).toBe(false);
    expect(ConstantTimeComparator.compare('short', 'longer_string')).toBe(false);
  });
});
