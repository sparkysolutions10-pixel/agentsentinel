import { describe, it, expect } from 'vitest';
import { createSorobanRpcIntegrityVerifierRule } from '../src/web3/soroban_rpc_integrity.js';
import { Verdict } from '../src/types.js';

describe('SorobanRpcIntegrityVerifierRule', () => {
  it('allows verified RPC responses with matching state hashes', () => {
    const rule = createSorobanRpcIntegrityVerifierRule();
    const violation = rule.evaluate({
      toolName: 'soroban_rpc_response_verify',
      params: { expectedStateHash: 'abc123hash', responseStateHash: 'abc123hash', signatureValid: true }
    });
    expect(violation).toBeNull();
  });

  it('blocks RPC responses with mismatched state hashes', () => {
    const rule = createSorobanRpcIntegrityVerifierRule();
    const violation = rule.evaluate({
      toolName: 'soroban_rpc_response_verify',
      params: { expectedStateHash: 'abc123hash', responseStateHash: 'forged456hash' }
    });
    expect(violation).not.toBeNull();
    expect(violation?.verdict).toBe(Verdict.BLOCK);
    expect(violation?.severity).toBe('critical');
    expect(violation?.detectedPattern).toContain('RPC_HASH_MISMATCH');
  });

  it('blocks RPC responses with invalid signature', () => {
    const rule = createSorobanRpcIntegrityVerifierRule();
    const violation = rule.evaluate({
      toolName: 'soroban_rpc_response_verify',
      params: { signatureValid: false }
    });
    expect(violation).not.toBeNull();
    expect(violation?.verdict).toBe(Verdict.BLOCK);
    expect(violation?.detectedPattern).toContain('RPC_SIGNATURE_INVALID');
  });
});
