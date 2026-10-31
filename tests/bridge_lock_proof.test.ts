import { describe, it, expect } from 'vitest';
import { createBridgeLockProofRule } from '../src/web3/bridge_lock_proof.js';
import { ToolCallContext, Verdict } from '../src/types.js';

describe('BridgeLockProofValidator', () => {
  const rule = createBridgeLockProofRule({
    allowedChains: ['ethereum', 'stellar', 'polygon']
  });

  it('allows valid Merkle proof with 32-byte hashes', () => {
    const context: ToolCallContext = {
      id: 'tx_proof_valid',
      toolName: 'bridge_mint_wrapped_token',
      params: {
        sourceChain: 'ethereum',
        proof: [
          '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
          '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890'
        ],
        amount: 500
      },
      timestamp: Date.now()
    };

    const violation = rule.evaluate(context);
    expect(violation).toBeNull();
  });

  it('blocks tool execution when proof is completely missing', () => {
    const context: ToolCallContext = {
      id: 'tx_proof_missing',
      toolName: 'bridge_release_assets',
      params: { sourceChain: 'ethereum', amount: 500 },
      timestamp: Date.now()
    };

    const violation = rule.evaluate(context);
    expect(violation).not.toBeNull();
    expect(violation?.verdict).toBe(Verdict.BLOCK);
    expect(violation?.severity).toBe('critical');
    expect(violation?.detectedPattern).toBe('MISSING_MERKLE_PROOF');
  });

  it('blocks tool execution when proof contains invalid hex hash node', () => {
    const context: ToolCallContext = {
      id: 'tx_proof_malformed',
      toolName: 'bridge_mint_wrapped_token',
      params: {
        sourceChain: 'polygon',
        proof: ['0xinvalid_short_hash'],
        amount: 500
      },
      timestamp: Date.now()
    };

    const violation = rule.evaluate(context);
    expect(violation).not.toBeNull();
    expect(violation?.verdict).toBe(Verdict.BLOCK);
    expect(violation?.detectedPattern).toContain('MALFORMED_PROOF_HASH');
  });

  it('blocks when source chain is not in allowed list', () => {
    const context: ToolCallContext = {
      id: 'tx_untrusted_chain',
      toolName: 'bridge_release_assets',
      params: {
        sourceChain: 'untrusted_private_chain',
        proof: ['0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef']
      },
      timestamp: Date.now()
    };

    const violation = rule.evaluate(context);
    expect(violation).not.toBeNull();
    expect(violation?.verdict).toBe(Verdict.BLOCK);
    expect(violation?.detectedPattern).toContain('UNTRUSTED_SOURCE_CHAIN');
  });
});
