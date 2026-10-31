import { describe, it, expect } from 'vitest';
import { TrustlineLimitValidator } from '../src/utils/trustline_limit_validator.js';

describe('TrustlineLimitValidator', () => {
  it('validates typical trustline limits', () => {
    expect(TrustlineLimitValidator.isValidLimit('1000')).toBe(true);
    expect(TrustlineLimitValidator.isValidLimit('500.50')).toBe(true);
    expect(TrustlineLimitValidator.isValidLimit('922337203685.4775807')).toBe(true);
  });

  it('rejects limits exceeding int64 boundary or invalid format', () => {
    expect(TrustlineLimitValidator.isValidLimit('922337203685.4775808')).toBe(false);
    expect(TrustlineLimitValidator.isValidLimit('-10')).toBe(false);
    expect(TrustlineLimitValidator.isValidLimit('abc')).toBe(false);
  });

  it('detects 0 limit as trustline closure', () => {
    expect(TrustlineLimitValidator.isClosingTrustline('0')).toBe(true);
    expect(TrustlineLimitValidator.isClosingTrustline('0.00')).toBe(true);
    expect(TrustlineLimitValidator.isClosingTrustline('100')).toBe(false);
  });
});
