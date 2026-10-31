import { describe, it, expect } from 'vitest';
import { createSorobanWasmHeaderValidatorRule } from '../src/web3/soroban_wasm_header.js';
import { Verdict } from '../src/types.js';

describe('SorobanWasmHeaderValidatorRule', () => {
  it('allows valid WASM binaries starting with standard \0asm and v1 header', () => {
    const rule = createSorobanWasmHeaderValidatorRule();
    const violation = rule.evaluate({
      toolName: 'soroban_install_contract',
      params: { bytecodeHex: '0061736d01000000010401600000' }
    });
    expect(violation).toBeNull();
  });

  it('blocks binaries with corrupted or invalid magic numbers', () => {
    const rule = createSorobanWasmHeaderValidatorRule();
    const violation = rule.evaluate({
      toolName: 'soroban_install_contract',
      params: { bytecodeHex: 'deadbeef01000000' }
    });
    expect(violation).not.toBeNull();
    expect(violation?.verdict).toBe(Verdict.BLOCK);
    expect(violation?.severity).toBe('critical');
    expect(violation?.detectedPattern).toContain('INVALID_WASM_MAGIC');
  });

  it('blocks binaries with unsupported version numbers', () => {
    const rule = createSorobanWasmHeaderValidatorRule();
    const violation = rule.evaluate({
      toolName: 'soroban_install_contract',
      params: { bytecodeHex: '0061736d02000000' }
    });
    expect(violation).not.toBeNull();
    expect(violation?.verdict).toBe(Verdict.BLOCK);
    expect(violation?.detectedPattern).toContain('UNSUPPORTED_WASM_VERSION');
  });
});
