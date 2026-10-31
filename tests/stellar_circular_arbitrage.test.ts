import { describe, it, expect } from 'vitest';
import { createStellarCircularArbitrageDetectorRule } from '../src/web3/stellar_circular_arbitrage.js';
import { Verdict } from '../src/types.js';

describe('StellarCircularArbitrageDetectorRule', () => {
  it('allows profitable circular arbitrage loops', () => {
    const rule = createStellarCircularArbitrageDetectorRule({ minNetProfitPercent: 0.2 });
    const violation = rule.evaluate({
      toolName: 'stellar_circular_arbitrage_trade',
      params: { sendAsset: 'XLM', destAsset: 'XLM', sendAmount: 1000, expectedDestAmount: 1010 } // +1.0% profit
    });
    expect(violation).toBeNull();
  });

  it('blocks negative-yield loss-making circular arbitrage', () => {
    const rule = createStellarCircularArbitrageDetectorRule();
    const violation = rule.evaluate({
      toolName: 'stellar_circular_arbitrage_trade',
      params: { sendAsset: 'USDC', destAsset: 'USDC', sendAmount: 1000, expectedDestAmount: 980 } // -2% loss
    });
    expect(violation).not.toBeNull();
    expect(violation?.verdict).toBe(Verdict.BLOCK);
    expect(violation?.severity).toBe('high');
    expect(violation?.detectedPattern).toContain('NEGATIVE_YIELD_ARBITRAGE');
  });

  it('ignores non-circular path payments', () => {
    const rule = createStellarCircularArbitrageDetectorRule();
    const violation = rule.evaluate({
      toolName: 'stellar_path_trade',
      params: { sendAsset: 'XLM', destAsset: 'USDC', sendAmount: 100, expectedDestAmount: 12 }
    });
    expect(violation).toBeNull();
  });
});
