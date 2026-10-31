import { describe, it, expect } from 'vitest';
import { createSorobanWasmAllowlistRule } from '../src/web3/soroban_wasm_allowlist.js';
import { Verdict } from '../src/types.js';

describe('SorobanWasmAllowlistRule', () => {
  const auditedHash = 'abcdef0123456789abcdef0123456789abcdef0123456789abcdef0123456789';

  it('allows execution of contracts with approved WASM hash', () => {
    const rule = createSorobanWasmAllowlistRule({ allowedWasmHashes: [auditedHash] });
    const violation = rule.evaluate({
      toolName: 'soroban_invoke_contract',
      params: { wasmHash: auditedHash }
    });
    expect(violation).toBeNull();
  });

  it('blocks execution of unapproved contract WASM hashes', () => {
    const rule = createSorobanWasmAllowlistRule({ allowedWasmHashes: [auditedHash] });
    const violation = rule.evaluate({
      toolName: 'soroban_invoke_contract',
      params: { wasmHash: 'unauthorized_hash_999' }
    });
    expect(violation).not.toBeNull();
    expect(violation?.verdict).toBe(Verdict.BLOCK);
    expect(violation?.severity).toBe('critical');
    expect(violation?.detectedPattern).toContain('UNAPPROVED_WASM_HASH');
  });
});
