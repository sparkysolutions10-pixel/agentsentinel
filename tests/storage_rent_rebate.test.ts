import { describe, it, expect } from 'vitest';
import { StorageRentRebateCalculator } from '../src/web3/storage_rent_rebate.js';

describe('StorageRentRebateCalculator', () => {
  it('computes accurate rebate on key deletion', () => {
    const calc = new StorageRentRebateCalculator({ feePerByteLedgerStroops: 0.001 });
    const rebate = calc.calculateRebateStroops(1000, 5000);
    expect(rebate).toBe(5000);
  });

  it('returns 0 when remaining ledgers is non-positive', () => {
    const calc = new StorageRentRebateCalculator();
    expect(calc.calculateRebateStroops(100, 0)).toBe(0);
  });
});
