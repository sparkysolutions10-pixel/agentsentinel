import { describe, it, expect } from 'vitest';
import { createStellarSequenceCheckerRule } from '../src/web3/stellar_sequence_checker.js';
import { ToolCallContext, Verdict } from '../src/types.js';

describe('Stellar Source Account Sequence Checker (#903, #904)', () => {
  const rule = createStellarSequenceCheckerRule({ maxAllowedSequenceGap: 5 });
  const account = 'GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5';

  it('allows initial sequence number submission', () => {
    const ctx: ToolCallContext = {
      id: 'seq-init-1',
      toolName: 'stellar_tx_build',
      params: { sourceAccount: account, sequenceNumber: '1000' },
      timestamp: Date.now(),
    };
    expect(rule.evaluate(ctx)).toBeNull();
  });

  it('allows sequential increment (1001)', () => {
    const ctx: ToolCallContext = {
      id: 'seq-inc-1',
      toolName: 'stellar_tx_build',
      params: { sourceAccount: account, sequenceNumber: '1001' },
      timestamp: Date.now(),
    };
    expect(rule.evaluate(ctx)).toBeNull();
  });

  it('blocks duplicate or stale sequence numbers (txBAD_SEQ) (#904)', () => {
    const ctx: ToolCallContext = {
      id: 'seq-stale-1',
      toolName: 'stellar_tx_build',
      params: { sourceAccount: account, sequenceNumber: '1001' }, // duplicate
      timestamp: Date.now(),
    };
    const violation = rule.evaluate(ctx);
    expect(violation).not.toBeNull();
    expect(violation?.verdict).toBe(Verdict.BLOCK);
    expect(violation?.reason).toContain('Stale or duplicate sequence number');
  });

  it('blocks out-of-order sequence gaps exceeding max gap threshold', () => {
    const ctx: ToolCallContext = {
      id: 'seq-gap-1',
      toolName: 'stellar_tx_build',
      params: { sourceAccount: account, sequenceNumber: '1020' }, // gap of 19 > 5
      timestamp: Date.now(),
    };
    const violation = rule.evaluate(ctx);
    expect(violation).not.toBeNull();
    expect(violation?.verdict).toBe(Verdict.BLOCK);
    expect(violation?.reason).toContain('Sequence number gap too large');
  });
});
