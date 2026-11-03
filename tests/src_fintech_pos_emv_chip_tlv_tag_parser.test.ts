import { describe, it, expect } from 'vitest';
import { PosEmvChipTlvTagParser } from '../src/fintech/pos_emv_chip_tlv_tag_parser.js';

describe('PosEmvChipTlvTagParser Invariant Suite (#1985)', () => {
  it('correctly intercepts dangerous pattern', () => {
    const result = PosEmvChipTlvTagParser.inspect('rm -rf /production');
    expect(result.isThreat).toBe(true);
    expect(result.invariant).toBe('RULE_INVARIANT_POS_EMV_CHIP_TLV_TAG_PARSER');
    expect(PosEmvChipTlvTagParser.validate('rm -rf /production')).toBe(false);
  });

  it('permits verified safe engineering command', () => {
    const result = PosEmvChipTlvTagParser.inspect('git status && npm run test');
    expect(result.isThreat).toBe(false);
    expect(PosEmvChipTlvTagParser.validate('git status && npm run test')).toBe(true);
  });
});
