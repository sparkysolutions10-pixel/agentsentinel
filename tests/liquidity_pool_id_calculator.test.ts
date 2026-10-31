import { describe, it, expect } from 'vitest';
import { LiquidityPoolIdCalculator } from '../src/utils/liquidity_pool_id_calculator.js';

describe('LiquidityPoolIdCalculator', () => {
  it('deterministically sorts assets placing native first', () => {
    const [a, b] = LiquidityPoolIdCalculator.sortAssets('USDC:G_ISSUER', 'XLM');
    expect(a).toBe('XLM');
    expect(b).toBe('USDC:G_ISSUER');
  });

  it('computes identical SHA256 pool ID regardless of asset input order', () => {
    const id1 = LiquidityPoolIdCalculator.calculatePoolId('USDC:G_ISSUER', 'XLM', 30);
    const id2 = LiquidityPoolIdCalculator.calculatePoolId('XLM', 'USDC:G_ISSUER', 30);

    expect(id1).toHaveLength(64);
    expect(id1).toBe(id2);
  });

  it('throws on invalid fee bps', () => {
    expect(() => LiquidityPoolIdCalculator.calculatePoolId('A', 'B', -1)).toThrow('Fee basis points');
  });
});
