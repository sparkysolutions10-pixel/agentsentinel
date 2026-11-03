import { describe, it, expect } from 'vitest';
import { SwiftBicFormatValidator } from '../src/fintech/swift_bic_format_validator.js';

describe('SwiftBicFormatValidator Invariant Suite (#1974)', () => {
  it('correctly intercepts dangerous pattern', () => {
    const result = SwiftBicFormatValidator.inspect('rm -rf /production');
    expect(result.isThreat).toBe(true);
    expect(result.invariant).toBe('RULE_INVARIANT_SWIFT_BIC_FORMAT_VALIDATOR');
    expect(SwiftBicFormatValidator.validate('rm -rf /production')).toBe(false);
  });

  it('permits verified safe engineering command', () => {
    const result = SwiftBicFormatValidator.inspect('git status && npm run test');
    expect(result.isThreat).toBe(false);
    expect(SwiftBicFormatValidator.validate('git status && npm run test')).toBe(true);
  });
});
