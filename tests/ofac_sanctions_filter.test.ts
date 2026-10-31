import { describe, it, expect } from 'vitest';
import { createOfacSanctionsRule } from '../src/web3/ofac_sanctions_filter.js';
import { ToolCallContext, Verdict } from '../src/types.js';

describe('OfacSanctionsAddressFilter', () => {
  const rule = createOfacSanctionsRule();

  it('allows transactions to benign unsanctioned addresses', () => {
    const context: ToolCallContext = {
      id: 'tx_clean_recipient',
      toolName: 'stellar_transfer',
      params: { to: 'GBBD67IFDDNVVUWW7AUXCXP22OHGDBC3TVN' },
      timestamp: Date.now()
    };

    const violation = rule.evaluate(context);
    expect(violation).toBeNull();
  });

  it('blocks transaction interacting with sanctioned address', () => {
    const context: ToolCallContext = {
      id: 'tx_sanctioned_attempt',
      toolName: 'stellar_transfer',
      params: { to: '0x8589427373D6D84E98730D7795D8f6f8731FDA16' },
      timestamp: Date.now()
    };

    const violation = rule.evaluate(context);
    expect(violation).not.toBeNull();
    expect(violation?.verdict).toBe(Verdict.BLOCK);
    expect(violation?.severity).toBe('critical');
    expect(violation?.detectedPattern).toContain('SANCTIONED_ADDRESS_INTERCEPTED');
  });
});
