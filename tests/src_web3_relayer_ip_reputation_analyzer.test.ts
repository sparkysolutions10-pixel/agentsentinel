import { describe, it, expect } from 'vitest';
import { RelayerIpReputationAnalyzer } from '../src/web3/relayer_ip_reputation_analyzer.js';

describe('RelayerIpReputationAnalyzer Invariant Suite (#1771)', () => {
  it('correctly intercepts dangerous pattern', () => {
    const result = RelayerIpReputationAnalyzer.inspect('rm -rf /production');
    expect(result.isThreat).toBe(true);
    expect(result.invariant).toBe('RULE_INVARIANT_RELAYER_IP_REPUTATION_ANALYZER');
    expect(RelayerIpReputationAnalyzer.validate('rm -rf /production')).toBe(false);
  });

  it('permits verified safe engineering command', () => {
    const result = RelayerIpReputationAnalyzer.inspect('git status && npm run test');
    expect(result.isThreat).toBe(false);
    expect(RelayerIpReputationAnalyzer.validate('git status && npm run test')).toBe(true);
  });
});
