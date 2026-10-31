import { describe, it, expect } from 'vitest';
import { ReDoSAttackDetector } from '../src/web3/redos_attack_detector.js';

describe('ReDoSAttackDetector', () => {
  it('identifies safe regex patterns without false alarms', () => {
    expect(ReDoSAttackDetector.isSuspiciousRegex('^[a-zA-Z0-9_-]{1,64}$')).toBe(false);
    expect(ReDoSAttackDetector.isSuspiciousRegex('GBBD[A-Z0-9]{52}')).toBe(false);
  });

  it('detects nested quantifier patterns that induce catastrophic backtracking', () => {
    expect(ReDoSAttackDetector.isSuspiciousRegex('(a+)+')).toBe(true);
    expect(ReDoSAttackDetector.isSuspiciousRegex('(x*)*')).toBe(true);
  });

  it('safely matches standard strings within timeout budget', () => {
    const regex = /^[0-9]+$/;
    const result = ReDoSAttackDetector.safeMatch(regex, '1234567890');
    expect(result).toBe(true);
  });
});
