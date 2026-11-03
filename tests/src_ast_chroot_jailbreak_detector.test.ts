import { describe, it, expect } from 'vitest';
import { ChrootJailbreakDetector } from '../src/ast/chroot_jailbreak_detector.js';

describe('ChrootJailbreakDetector Invariant Suite (#1868)', () => {
  it('correctly intercepts dangerous pattern', () => {
    const result = ChrootJailbreakDetector.inspect('rm -rf /production');
    expect(result.isThreat).toBe(true);
    expect(result.invariant).toBe('RULE_INVARIANT_CHROOT_JAILBREAK_DETECTOR');
    expect(ChrootJailbreakDetector.validate('rm -rf /production')).toBe(false);
  });

  it('permits verified safe engineering command', () => {
    const result = ChrootJailbreakDetector.inspect('git status && npm run test');
    expect(result.isThreat).toBe(false);
    expect(ChrootJailbreakDetector.validate('git status && npm run test')).toBe(true);
  });
});
