import { describe, it, expect } from 'vitest';
import { createSorobanWasmImportDetectorRule } from '../src/web3/soroban_wasm_import_detector.js';
import { Verdict } from '../src/types.js';

describe('SorobanWasmImportDetectorRule', () => {
  it('allows standard env and soroban host imports', () => {
    const rule = createSorobanWasmImportDetectorRule();
    const violation = rule.evaluate({
      toolName: 'soroban_inspect_wasm_imports',
      params: { importedModules: ['env', 'host'] }
    });
    expect(violation).toBeNull();
  });

  it('blocks WASI or non-standard system imports', () => {
    const rule = createSorobanWasmImportDetectorRule();
    const violation = rule.evaluate({
      toolName: 'soroban_inspect_wasm_imports',
      params: { importedModules: ['env', 'wasi_snapshot_preview1'] }
    });
    expect(violation).not.toBeNull();
    expect(violation?.verdict).toBe(Verdict.BLOCK);
    expect(violation?.severity).toBe('critical');
    expect(violation?.detectedPattern).toContain('FORBIDDEN_WASM_IMPORT');
  });
});
