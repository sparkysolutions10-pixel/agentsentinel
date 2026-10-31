import { describe, it, expect } from 'vitest';
import { createEd25519MalleabilityRule } from '../src/web3/ed25519_malleability_scrubber.js';
import { ToolCallContext, Verdict } from '../src/types.js';

describe('Ed25519MalleabilityScrubber', () => {
  const rule = createEd25519MalleabilityRule();

  it('allows canonical Ed25519 signatures with scalar S < L', () => {
    // 32-byte R + 32-byte S (little endian S = 1000)
    const rHex = '11'.repeat(32);
    const sHex = 'e8030000' + '00'.repeat(28);
    const signature = rHex + sHex;

    const context: ToolCallContext = {
      id: 'tx_canonical_sig',
      toolName: 'stellar_submit_transaction',
      params: { signature },
      timestamp: Date.now()
    };

    const violation = rule.evaluate(context);
    expect(violation).toBeNull();
  });

  it('blocks non-canonical Ed25519 signature where scalar S >= L', () => {
    // 32-byte R + 32-byte S with highest bits set (exceeding L)
    const rHex = '11'.repeat(32);
    const sHex = 'ff'.repeat(32);
    const signature = rHex + sHex;

    const context: ToolCallContext = {
      id: 'tx_malleable_sig',
      toolName: 'stellar_submit_transaction',
      params: { signature },
      timestamp: Date.now()
    };

    const violation = rule.evaluate(context);
    expect(violation).not.toBeNull();
    expect(violation?.verdict).toBe(Verdict.BLOCK);
    expect(violation?.severity).toBe('critical');
    expect(violation?.detectedPattern).toContain('MALLEABLE_ED25519_SCALAR');
  });
});
