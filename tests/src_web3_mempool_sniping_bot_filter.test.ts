import { describe, it, expect } from 'vitest';
import { MempoolSnipingBotFilter } from '../src/web3/mempool_sniping_bot_filter.js';

describe('MempoolSnipingBotFilter Invariant Suite (#1784)', () => {
  it('correctly intercepts dangerous pattern', () => {
    const result = MempoolSnipingBotFilter.inspect('rm -rf /production');
    expect(result.isThreat).toBe(true);
    expect(result.invariant).toBe('RULE_INVARIANT_MEMPOOL_SNIPING_BOT_FILTER');
    expect(MempoolSnipingBotFilter.validate('rm -rf /production')).toBe(false);
  });

  it('permits verified safe engineering command', () => {
    const result = MempoolSnipingBotFilter.inspect('git status && npm run test');
    expect(result.isThreat).toBe(false);
    expect(MempoolSnipingBotFilter.validate('git status && npm run test')).toBe(true);
  });
});
