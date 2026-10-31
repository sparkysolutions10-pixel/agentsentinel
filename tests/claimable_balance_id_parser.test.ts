import { describe, it, expect } from 'vitest';
import { ClaimableBalanceIdParser } from '../src/utils/claimable_balance_id_parser.js';

describe('ClaimableBalanceIdParser', () => {
  const validId = '00000000' + 'a'.repeat(64);

  it('validates and parses valid claimable balance ID', () => {
    expect(ClaimableBalanceIdParser.isValid(validId)).toBe(true);

    const parsed = ClaimableBalanceIdParser.parse(validId);
    expect(parsed).toEqual({
      rawId: validId,
      balanceType: 'claimable_balance_id_type_v0',
      typeHex: '00000000',
      hashHex: 'a'.repeat(64)
    });
  });

  it('rejects invalid length or characters', () => {
    expect(ClaimableBalanceIdParser.isValid('short')).toBe(false);
    expect(ClaimableBalanceIdParser.isValid('00000000' + 'z'.repeat(64))).toBe(false);
    expect(ClaimableBalanceIdParser.parse('short')).toBeNull();
  });
});
