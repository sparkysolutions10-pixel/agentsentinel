import { describe, it, expect } from 'vitest';
import { createWriteBytesCeilingRule } from '../src/web3/write_bytes_ceiling.js';
import { ToolCallContext, Verdict } from '../src/types.js';

describe('WriteBytesMemoryCeiling', () => {
  const rule = createWriteBytesCeilingRule({ maxWriteBytes: 32768 });

  it('allows writes within the safe byte budget', () => {
    const context: ToolCallContext = {
      id: 'tx_write_safe',
      toolName: 'soroban_invoke',
      params: { writeBytes: 8192 },
      timestamp: Date.now()
    };

    const violation = rule.evaluate(context);
    expect(violation).toBeNull();
  });

  it('blocks writes exceeding the safe byte budget', () => {
    const context: ToolCallContext = {
      id: 'tx_write_bloated',
      toolName: 'soroban_invoke',
      params: { writeBytes: 50000 },
      timestamp: Date.now()
    };

    const violation = rule.evaluate(context);
    expect(violation).not.toBeNull();
    expect(violation?.verdict).toBe(Verdict.BLOCK);
    expect(violation?.detectedPattern).toContain('WRITE_BYTES_CEILING_EXCEEDED');
  });
});
