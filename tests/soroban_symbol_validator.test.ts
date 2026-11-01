import { describe, it, expect } from 'vitest';
import { SorobanSymbolValidator } from '../src/utils/soroban_symbol_validator.js';

describe('SorobanSymbolValidator', () => {
  it('validates Soroban symbols within 32 chars', () => {
    expect(SorobanSymbolValidator.isValid('init')).toBe(true);
    expect(SorobanSymbolValidator.isValid('transfer_token_2026')).toBe(true);
    expect(SorobanSymbolValidator.isValid('a'.repeat(33))).toBe(false);
    expect(SorobanSymbolValidator.isValid('has spaces')).toBe(false);
  });
});
