import { describe, it, expect } from 'vitest';
import { createTlsPinningRule } from '../src/web3/tls_pinning_validator.js';
import { ToolCallContext, Verdict } from '../src/types.js';

describe('TlsPinningValidator', () => {
  const rule = createTlsPinningRule({
    pinnedFingerprints: ['sha256/pinned_valid_spki_fingerprint_hash_abc123']
  });

  it('allows HTTPS endpoint with matching pinned fingerprint', () => {
    const context: ToolCallContext = {
      id: 'tx_tls_valid',
      toolName: 'soroban_rpc_call',
      params: {
        rpcUrl: 'https://rpc.enterprise-stellar.com',
        tlsSpkiFingerprint: 'sha256/pinned_valid_spki_fingerprint_hash_abc123'
      },
      timestamp: Date.now()
    };

    const violation = rule.evaluate(context);
    expect(violation).toBeNull();
  });

  it('blocks insecure plaintext http:// connections', () => {
    const context: ToolCallContext = {
      id: 'tx_tls_http',
      toolName: 'soroban_rpc_call',
      params: { rpcUrl: 'http://rpc.stellar.org' },
      timestamp: Date.now()
    };

    const violation = rule.evaluate(context);
    expect(violation).not.toBeNull();
    expect(violation?.verdict).toBe(Verdict.BLOCK);
    expect(violation?.detectedPattern).toBe('INSECURE_PLAINTEXT_HTTP');
  });

  it('blocks unpinned / mismatched TLS fingerprint', () => {
    const context: ToolCallContext = {
      id: 'tx_tls_mitm',
      toolName: 'soroban_rpc_call',
      params: {
        rpcUrl: 'https://rpc.enterprise-stellar.com',
        tlsSpkiFingerprint: 'sha256/malicious_mitm_proxy_fingerprint'
      },
      timestamp: Date.now()
    };

    const violation = rule.evaluate(context);
    expect(violation).not.toBeNull();
    expect(violation?.verdict).toBe(Verdict.BLOCK);
    expect(violation?.detectedPattern).toContain('UNTRUSTED_TLS_FINGERPRINT');
  });
});
