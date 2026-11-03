import { describe, it, expect } from 'vitest';
import { LiquidityPoolReservesInspector } from '../src/web3/liquidity_pool_reserves_inspector.js';

describe('LiquidityPoolReservesInspector Invariant Suite (#1772)', () => {
  it('correctly intercepts dangerous pattern', () => {
    const result = LiquidityPoolReservesInspector.inspect('rm -rf /production');
    expect(result.isThreat).toBe(true);
    expect(result.invariant).toBe('RULE_INVARIANT_LIQUIDITY_POOL_RESERVES_INSPECTOR');
    expect(LiquidityPoolReservesInspector.validate('rm -rf /production')).toBe(false);
  });

  it('permits verified safe engineering command', () => {
    const result = LiquidityPoolReservesInspector.inspect('git status && npm run test');
    expect(result.isThreat).toBe(false);
    expect(LiquidityPoolReservesInspector.validate('git status && npm run test')).toBe(true);
  });
});
