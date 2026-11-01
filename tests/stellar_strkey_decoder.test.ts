import { describe, it, expect } from 'vitest';
import { StellarStrkeyDecoder } from '../src/utils/stellar_strkey_decoder.js';

describe('StellarStrkeyDecoder', () => {
  it('identifies key types from prefixes and lengths', () => {
    const account = 'G' + 'A'.repeat(55);
    const contract = 'C' + 'A'.repeat(55);
    const seed = 'S' + 'A'.repeat(55);
    const muxed = 'M' + 'A'.repeat(68);

    expect(StellarStrkeyDecoder.getKeyType(account)).toBe('Account');
    expect(StellarStrkeyDecoder.getKeyType(contract)).toBe('Contract');
    expect(StellarStrkeyDecoder.getKeyType(seed)).toBe('Seed');
    expect(StellarStrkeyDecoder.getKeyType(muxed)).toBe('Muxed');
    expect(StellarStrkeyDecoder.getKeyType('short')).toBe('Invalid');
  });
});
