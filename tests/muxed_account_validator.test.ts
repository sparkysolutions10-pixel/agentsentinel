import { describe, it, expect } from 'vitest';
import { createMuxedAccountValidatorRule } from '../src/web3/muxed_account_validator.js';
import { ToolCallContext, Verdict } from '../src/types.js';

describe('MuxedAccountValidator', () => {
  const rule = createMuxedAccountValidatorRule();

  it('allows valid 69-character SEP-23 M-address', () => {
    const validMAddress = 'MAAAAAAAAAAAAAB7BQ2L7E5NBWMXDUCMZS5AUKGXZ64TC74X3ZQVZV5HAMDYQ6QAAAAAAAAAA';
    const context: ToolCallContext = {
      id: 'tx_muxed_valid',
      toolName: 'stellar_payment',
      params: { to: validMAddress, memoId: '12345' },
      timestamp: Date.now()
    };

    const violation = rule.evaluate(context);
    expect(violation).toBeNull();
  });

  it('blocks malformed M-address with incorrect character length', () => {
    const shortMAddress = 'MAAAAAAAAAAAAAB7BQ2L7E5NBWMXDUCMZS5AUKGXZ64TC74X';
    const context: ToolCallContext = {
      id: 'tx_muxed_short',
      toolName: 'stellar_payment',
      params: { to: shortMAddress },
      timestamp: Date.now()
    };

    const violation = rule.evaluate(context);
    expect(violation).not.toBeNull();
    expect(violation?.verdict).toBe(Verdict.BLOCK);
    expect(violation?.detectedPattern).toContain('MALFORMED_MUXED_ADDRESS');
  });

  it('blocks 64-bit memo ID overflow exceeding uint64 max', () => {
    const validMAddress = 'MAAAAAAAAAAAAAB7BQ2L7E5NBWMXDUCMZS5AUKGXZ64TC74X3ZQVZV5HAMDYQ6QAAAAAAAAAA';
    const context: ToolCallContext = {
      id: 'tx_muxed_overflow',
      toolName: 'stellar_payment',
      params: { to: validMAddress, memoId: '999999999999999999999999999999' },
      timestamp: Date.now()
    };

    const violation = rule.evaluate(context);
    expect(violation).not.toBeNull();
    expect(violation?.verdict).toBe(Verdict.BLOCK);
    expect(violation?.detectedPattern).toContain('MUXED_ID_OVERFLOW');
  });
});
