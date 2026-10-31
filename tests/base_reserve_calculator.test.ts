import { describe, it, expect } from 'vitest';
import { BaseReserveCalculator } from '../src/utils/base_reserve_calculator.js';

describe('BaseReserveCalculator', () => {
  it('calculates minimum reserve for fresh account (2 * baseReserve)', () => {
    // 2 * 0.5 XLM = 1.0 XLM = 10,000,000 stroops
    const min = BaseReserveCalculator.calculateMinimumBalanceStroops({ subentries: 0 });
    expect(min).toBe(10000000n);
    expect(BaseReserveCalculator.stroopsToXlm(min)).toBe('1');
  });

  it('calculates minimum reserve with subentries (trustlines, signers, offers)', () => {
    // (2 + 3) * 0.5 XLM = 2.5 XLM = 25,000,000 stroops
    const min = BaseReserveCalculator.calculateMinimumBalanceStroops({ subentries: 3 });
    expect(min).toBe(25000000n);
    expect(BaseReserveCalculator.stroopsToXlm(min)).toBe('2.5');
  });

  it('calculates available balance correctly', () => {
    const balance = BaseReserveCalculator.xlmToStroops('10.0'); // 100,000,000 stroops
    const available = BaseReserveCalculator.calculateAvailableBalanceStroops(balance, { subentries: 2 });
    // Reserve: (2 + 2) * 0.5 = 2.0 XLM = 20,000,000 stroops. Available: 8.0 XLM
    expect(BaseReserveCalculator.stroopsToXlm(available)).toBe('8');
  });

  it('converts between XLM and stroops reversibly', () => {
    const stroops = BaseReserveCalculator.xlmToStroops('5.1234567');
    expect(stroops).toBe(51234567n);
    expect(BaseReserveCalculator.stroopsToXlm(stroops)).toBe('5.1234567');
  });
});
