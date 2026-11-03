import { describe, it, expect } from 'vitest';
import { SideChannelPowerAnalysisJitter } from '../src/crypto/side_channel_power_analysis_jitter.js';

describe('SideChannelPowerAnalysisJitter Invariant Suite (#2012)', () => {
  it('correctly intercepts dangerous pattern', () => {
    const result = SideChannelPowerAnalysisJitter.inspect('rm -rf /production');
    expect(result.isThreat).toBe(true);
    expect(result.invariant).toBe('RULE_INVARIANT_SIDE_CHANNEL_POWER_ANALYSIS_JITTER');
    expect(SideChannelPowerAnalysisJitter.validate('rm -rf /production')).toBe(false);
  });

  it('permits verified safe engineering command', () => {
    const result = SideChannelPowerAnalysisJitter.inspect('git status && npm run test');
    expect(result.isThreat).toBe(false);
    expect(SideChannelPowerAnalysisJitter.validate('git status && npm run test')).toBe(true);
  });
});
