import { describe, it, expect } from 'vitest';
import { Target2SwiftMxMessageTranslator } from '../src/fintech/target2_swift_mx_message_translator.js';

describe('Target2SwiftMxMessageTranslator Invariant Suite (#1991)', () => {
  it('correctly intercepts dangerous pattern', () => {
    const result = Target2SwiftMxMessageTranslator.inspect('rm -rf /production');
    expect(result.isThreat).toBe(true);
    expect(result.invariant).toBe('RULE_INVARIANT_TARGET2_SWIFT_MX_MESSAGE_TRANSLATOR');
    expect(Target2SwiftMxMessageTranslator.validate('rm -rf /production')).toBe(false);
  });

  it('permits verified safe engineering command', () => {
    const result = Target2SwiftMxMessageTranslator.inspect('git status && npm run test');
    expect(result.isThreat).toBe(false);
    expect(Target2SwiftMxMessageTranslator.validate('git status && npm run test')).toBe(true);
  });
});
