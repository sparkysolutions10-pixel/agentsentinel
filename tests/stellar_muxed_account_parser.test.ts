import { describe, it, expect } from 'vitest';
import { StellarMuxedAccountParser } from '../src/utils/stellar_muxed_account_parser.js';

describe('StellarMuxedAccountParser', () => {
  it('identifies muxed accounts', () => {
    expect(StellarMuxedAccountParser.isMuxed('M' + 'A'.repeat(68))).toBe(true);
    expect(StellarMuxedAccountParser.isMuxed('G' + 'A'.repeat(55))).toBe(false);
  });
});
