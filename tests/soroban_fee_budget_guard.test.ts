import { describe, it, expect } from 'vitest';
import { SorobanFeeBudgetGuard } from '../src/utils/soroban_fee_budget_guard.js';

describe('SorobanFeeBudgetGuard', () => {
  it('validates transaction budget limits', () => {
    expect(SorobanFeeBudgetGuard.isWithinBudget(500000, 10000, 1000000, 20000)).toBe(true);
    expect(SorobanFeeBudgetGuard.isWithinBudget(1500000, 10000, 1000000, 20000)).toBe(false);
    expect(SorobanFeeBudgetGuard.isWithinBudget(500000, 30000, 1000000, 20000)).toBe(false);
  });
});
