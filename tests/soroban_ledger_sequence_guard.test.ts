import { describe, it, expect } from 'vitest';
import { SorobanLedgerSequenceGuard } from '../src/utils/soroban_ledger_sequence_guard.js';

describe('SorobanLedgerSequenceGuard', () => {
  it('validates ledger bounds', () => {
    expect(SorobanLedgerSequenceGuard.isWithinBounds(100, 50, 150)).toBe(true);
    expect(SorobanLedgerSequenceGuard.isWithinBounds(40, 50, 150)).toBe(false);
    expect(SorobanLedgerSequenceGuard.isWithinBounds(160, 50, 150)).toBe(false);
  });
});
