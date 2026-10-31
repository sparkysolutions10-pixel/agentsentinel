import { describe, it, expect } from 'vitest';
import { createSorobanWasmMemoryGuardRule } from '../src/web3/soroban_wasm_memory_guard.js';
import { Verdict } from '../src/types.js';

describe('SorobanWasmMemoryGuardRule', () => {
  it('allows memory page allocations within quota', () => {
    const rule = createSorobanWasmMemoryGuardRule({ maxMemoryPages: 64 });
    const violation = rule.evaluate({
      toolName: 'soroban_validate_wasm_memory',
      params: { initialMemoryPages: 16 }
    });
    expect(violation).toBeNull();
  });

  it('blocks memory allocations exceeding page ceiling', () => {
    const rule = createSorobanWasmMemoryGuardRule({ maxMemoryPages: 64 });
    const violation = rule.evaluate({
      toolName: 'soroban_validate_wasm_memory',
      params: { initialMemoryPages: 128 }
    });
    expect(violation).not.toBeNull();
    expect(violation?.verdict).toBe(Verdict.BLOCK);
    expect(violation?.severity).toBe('high');
    expect(violation?.detectedPattern).toContain('MEMORY_PAGES_EXCEEDED');
  });
});
