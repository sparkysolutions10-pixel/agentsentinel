import { describe, it, expect } from 'vitest';
import { createDanglingReferenceRule } from '../src/web3/dangling_reference_detector.js';
import { ToolCallContext, Verdict } from '../src/types.js';

describe('DanglingReferenceDetector', () => {
  const rule = createDanglingReferenceRule();

  it('allows valid initialized contract address', () => {
    const context: ToolCallContext = {
      id: 'tx_valid_contract',
      toolName: 'soroban_call',
      params: { targetContract: 'CA3D52RZSECPH7QAC7R2R4GPPG7BH5X2YV2WJ7N63F' },
      timestamp: Date.now()
    };

    const violation = rule.evaluate(context);
    expect(violation).toBeNull();
  });

  it('blocks null contract pointer', () => {
    const context: ToolCallContext = {
      id: 'tx_null_contract',
      toolName: 'soroban_call',
      params: { targetContract: 'C00000000000000000000000000000000000000000' },
      timestamp: Date.now()
    };

    const violation = rule.evaluate(context);
    expect(violation).not.toBeNull();
    expect(violation?.verdict).toBe(Verdict.BLOCK);
  });
});
