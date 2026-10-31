import { describe, it, expect } from 'vitest';
import { createBridgeRelayerSignatureRule } from '../src/web3/bridge_relayer_signatures.js';
import { ToolCallContext, Verdict } from '../src/types.js';

describe('BridgeRelayerSignatureGuard', () => {
  const rule = createBridgeRelayerSignatureRule({
    threshold: 3,
    authorizedRelayers: ['relayer1', 'relayer2', 'relayer3', 'relayer4']
  });

  it('allows message with sufficient authorized distinct signatures', () => {
    const context: ToolCallContext = {
      id: 'tx_relay_valid',
      toolName: 'relay_crosschain_message',
      params: {
        signatures: ['relayer1', 'relayer2', 'relayer3']
      },
      timestamp: Date.now()
    };

    const violation = rule.evaluate(context);
    expect(violation).toBeNull();
  });

  it('blocks when signature count is below required threshold', () => {
    const context: ToolCallContext = {
      id: 'tx_relay_insufficient',
      toolName: 'relay_crosschain_message',
      params: {
        signatures: ['relayer1', 'relayer2']
      },
      timestamp: Date.now()
    };

    const violation = rule.evaluate(context);
    expect(violation).not.toBeNull();
    expect(violation?.verdict).toBe(Verdict.BLOCK);
    expect(violation?.detectedPattern).toContain('INSUFFICIENT_RELAYER_QUORUM');
  });

  it('blocks when duplicate signatures are provided to fake quorum', () => {
    const context: ToolCallContext = {
      id: 'tx_relay_duplicate',
      toolName: 'relay_crosschain_message',
      params: {
        signatures: ['relayer1', 'relayer1', 'relayer1']
      },
      timestamp: Date.now()
    };

    const violation = rule.evaluate(context);
    expect(violation).not.toBeNull();
    expect(violation?.verdict).toBe(Verdict.BLOCK);
    expect(violation?.detectedPattern).toContain('INSUFFICIENT_RELAYER_QUORUM:1<3');
  });

  it('blocks when an unauthorized relayer signature is present', () => {
    const context: ToolCallContext = {
      id: 'tx_relay_unauthorized',
      toolName: 'relay_crosschain_message',
      params: {
        signatures: ['relayer1', 'relayer2', 'malicious_relayer']
      },
      timestamp: Date.now()
    };

    const violation = rule.evaluate(context);
    expect(violation).not.toBeNull();
    expect(violation?.verdict).toBe(Verdict.BLOCK);
    expect(violation?.detectedPattern).toContain('UNAUTHORIZED_RELAYER_SIGNER');
  });
});
