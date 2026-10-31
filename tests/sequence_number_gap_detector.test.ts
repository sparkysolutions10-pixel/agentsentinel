import { describe, it, expect } from 'vitest';
import { createSequenceNumberGapRule } from '../src/web3/sequence_number_gap_detector.js';
import { ToolCallContext, Verdict } from '../src/types.js';

describe('SequenceNumberGapDetector', () => {
  const rule = createSequenceNumberGapRule();

  it('allows valid monotonic sequence advancement (N+1)', () => {
    const context: ToolCallContext = {
      id: 'tx_seq_valid',
      toolName: 'stellar_submit_tx',
      params: { sequenceNumber: '100000000000001', currentAccountSequence: '100000000000000' },
      timestamp: Date.now()
    };

    const violation = rule.evaluate(context);
    expect(violation).toBeNull();
  });

  it('blocks stale or duplicate sequence numbers (N <= current)', () => {
    const context: ToolCallContext = {
      id: 'tx_seq_stale',
      toolName: 'stellar_submit_tx',
      params: { sequenceNumber: '100000000000000', currentAccountSequence: '100000000000000' },
      timestamp: Date.now()
    };

    const violation = rule.evaluate(context);
    expect(violation).not.toBeNull();
    expect(violation?.verdict).toBe(Verdict.BLOCK);
    expect(violation?.detectedPattern).toContain('STALE_SEQUENCE_NONCE');
  });

  it('blocks sequence gap with delta > 1', () => {
    const context: ToolCallContext = {
      id: 'tx_seq_gap',
      toolName: 'stellar_submit_tx',
      params: { sequenceNumber: '100000000000005', currentAccountSequence: '100000000000000' },
      timestamp: Date.now()
    };

    const violation = rule.evaluate(context);
    expect(violation).not.toBeNull();
    expect(violation?.verdict).toBe(Verdict.BLOCK);
    expect(violation?.detectedPattern).toContain('SEQUENCE_GAP_DETECTED:5>1');
  });
});
