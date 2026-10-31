import { describe, it, expect } from 'vitest';
import { createSorobanWasmLoopScannerRule } from '../src/web3/soroban_wasm_loop_scanner.js';
import { Verdict } from '../src/types.js';

describe('SorobanWasmLoopScannerRule', () => {
  it('allows safe WASM bytecode with bounded loops', () => {
    const rule = createSorobanWasmLoopScannerRule();
    const violation = rule.evaluate({
      toolName: 'soroban_scan_wasm',
      params: { hasUnboundedLoop: false, maxLoopDepth: 2 }
    });
    expect(violation).toBeNull();
  });

  it('blocks WASM bytecode containing unbounded infinite loops', () => {
    const rule = createSorobanWasmLoopScannerRule();
    const violation = rule.evaluate({
      toolName: 'soroban_scan_wasm',
      params: { hasUnboundedLoop: true }
    });
    expect(violation).not.toBeNull();
    expect(violation?.verdict).toBe(Verdict.BLOCK);
    expect(violation?.severity).toBe('critical');
    expect(violation?.detectedPattern).toContain('UNBOUNDED_LOOP_DETECTED');
  });

  it('blocks WASM bytecode with direct unbounded recursion', () => {
    const rule = createSorobanWasmLoopScannerRule();
    const violation = rule.evaluate({
      toolName: 'soroban_scan_wasm',
      params: { isDirectRecursive: true }
    });
    expect(violation).not.toBeNull();
    expect(violation?.verdict).toBe(Verdict.BLOCK);
    expect(violation?.detectedPattern).toContain('INFINITE_RECURSION_DETECTED');
  });
});
