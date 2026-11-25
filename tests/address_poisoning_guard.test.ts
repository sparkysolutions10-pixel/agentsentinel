import { describe, it, expect } from 'vitest';
import { createAddressPoisoningGuardRule } from '../src/web3/address_poisoning_guard.js';
import { Verdict } from '../src/types.js';

describe('Web3 Address Poisoning Guard Rule', () => {
  const TREASURY = 'GDDJH64X5VEXI7UWZMJA3YUG7ANYHKRRRFHLD2SF5OWEETNFBVYMRXZT';
  const LOBSTR = 'GBHRSZLBD3DFH7YUXZ2K3F67K2N5W5Q2DDFG567HJ89LMNOPQCWVF';
  
  const rule = createAddressPoisoningGuardRule({
    knownSafeWallets: [TREASURY, LOBSTR],
    prefixMatchLength: 4,
    suffixMatchLength: 4,
  });

  it('allows exact safe treasury address', () => {
    const violation = rule.evaluate({
      toolName: 'stellar_payment',
      params: { destination: TREASURY, amount: '10' },
      metadata: {}
    });
    expect(violation).toBeNull();
  });

  it('blocks poisoned treasury lookalike vanity address', () => {
    const POISON_TREASURY = 'GDDJF332X5VEXI7UWZMJA3YUG7ANYHKRRRFHLD2SF5OWEETNFBVYMRXZT';
    const violation = rule.evaluate({
      toolName: 'stellar_payment',
      params: { destination: POISON_TREASURY, amount: '10' },
      metadata: {}
    });
    expect(violation).not.toBeNull();
    expect(violation?.verdict).toBe(Verdict.BLOCK);
    expect(violation?.reason).toContain('Potential Address Poisoning detected');
  });

  it('blocks poisoned LOBSTR lookalike address', () => {
    const POISON_LOBSTR = 'GBHROIDYVD3DFH7YUXZ2K3F67K2N5W5Q2DDFG567HJ89LMNOPQCWVF';
    const violation = rule.evaluate({
      toolName: 'stellar_spend',
      params: { to: POISON_LOBSTR, amount: '5' },
      metadata: {}
    });
    expect(violation).not.toBeNull();
    expect(violation?.verdict).toBe(Verdict.BLOCK);
  });

  it('allows completely different legitimate third-party addresses', () => {
    const THIRD_PARTY = 'GAAK5678901234567890123456789012345678901234567890123456';
    const violation = rule.evaluate({
      toolName: 'stellar_payment',
      params: { destination: THIRD_PARTY, amount: '1' },
      metadata: {}
    });
    expect(violation).toBeNull();
  });
});
