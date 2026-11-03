import { describe, it, expect } from 'vitest';
import { DnsTunnelingExfiltrationDetector } from '../src/ast/dns_tunneling_exfiltration_detector.js';

describe('DnsTunnelingExfiltrationDetector Invariant Suite (#1879)', () => {
  it('correctly intercepts dangerous pattern', () => {
    const result = DnsTunnelingExfiltrationDetector.inspect('rm -rf /production');
    expect(result.isThreat).toBe(true);
    expect(result.invariant).toBe('RULE_INVARIANT_DNS_TUNNELING_EXFILTRATION_DETECTOR');
    expect(DnsTunnelingExfiltrationDetector.validate('rm -rf /production')).toBe(false);
  });

  it('permits verified safe engineering command', () => {
    const result = DnsTunnelingExfiltrationDetector.inspect('git status && npm run test');
    expect(result.isThreat).toBe(false);
    expect(DnsTunnelingExfiltrationDetector.validate('git status && npm run test')).toBe(true);
  });
});
