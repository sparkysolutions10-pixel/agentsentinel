import { describe, it, expect } from 'vitest';
import { L2SequencerDowntimeFallback } from '../src/web3/l2_sequencer_downtime_fallback.js';

describe('L2SequencerDowntimeFallback Invariant Suite (#1799)', () => {
  it('correctly intercepts dangerous pattern', () => {
    const result = L2SequencerDowntimeFallback.inspect('rm -rf /production');
    expect(result.isThreat).toBe(true);
    expect(result.invariant).toBe('RULE_INVARIANT_L2_SEQUENCER_DOWNTIME_FALLBACK');
    expect(L2SequencerDowntimeFallback.validate('rm -rf /production')).toBe(false);
  });

  it('permits verified safe engineering command', () => {
    const result = L2SequencerDowntimeFallback.inspect('git status && npm run test');
    expect(result.isThreat).toBe(false);
    expect(L2SequencerDowntimeFallback.validate('git status && npm run test')).toBe(true);
  });
});
