import { describe, it, expect } from 'vitest';
import { createSorobanTokenTransferCeilingRule } from '../src/web3/soroban_token_ceiling.js';
import { Verdict } from '../src/types.js';

describe('SorobanTokenTransferCeilingRule', () => {
  it('allows token transfers below the maximum ceiling', () => {
    const rule = createSorobanTokenTransferCeilingRule({ maxTransferAmount: 5000 });
    const violation = rule.evaluate({
      toolName: 'soroban_token_transfer',
      params: { to: 'GBBD67IFDDNVVUWW7AUXCXP22OHGDBC3TVN', amount: 2500 }
    });
    expect(violation).toBeNull();
  });

  it('blocks token transfers that exceed the configured ceiling', () => {
    const rule = createSorobanTokenTransferCeilingRule({ maxTransferAmount: 10000 });
    const violation = rule.evaluate({
      toolName: 'soroban_token_transfer',
      params: { to: 'GBBD67IFDDNVVUWW7AUXCXP22OHGDBC3TVN', amount: 25000 }
    });
    expect(violation).not.toBeNull();
    expect(violation?.verdict).toBe(Verdict.BLOCK);
    expect(violation?.severity).toBe('critical');
    expect(violation?.detectedPattern).toContain('TRANSFER_CEILING_EXCEEDED');
  });

  it('allows transfers exceeding the ceiling if recipient is whitelisted', () => {
    const rule = createSorobanTokenTransferCeilingRule({
      maxTransferAmount: 10000,
      whitelistedRecipients: ['GBBD67IFDDNVVUWW7AUXCXP22OHGDBC3TVN']
    });
    const violation = rule.evaluate({
      toolName: 'soroban_token_transfer',
      params: { to: 'GBBD67IFDDNVVUWW7AUXCXP22OHGDBC3TVN', amount: 50000 }
    });
    expect(violation).toBeNull();
  });

  it('ignores unrelated tools', () => {
    const rule = createSorobanTokenTransferCeilingRule();
    const violation = rule.evaluate({
      toolName: 'unrelated_agent_search',
      params: { query: 'crypto prices' }
    });
    expect(violation).toBeNull();
  });
});
