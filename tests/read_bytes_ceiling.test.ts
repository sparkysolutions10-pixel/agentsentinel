import { describe, it, expect } from 'vitest';
import { createReadBytesCeilingRule } from '../src/web3/read_bytes_ceiling.js';
import { ToolCallContext, Verdict } from '../src/types.js';

describe('ReadBytesMemoryCeiling', () => {
  const rule = createReadBytesCeilingRule({ maxReadBytes: 65536 });

  it('allows operations reading bytes below the ceiling', () => {
    const context: ToolCallContext = {
      id: 'tx_read_safe',
      toolName: 'soroban_invoke',
      params: { readBytes: 12000 },
      timestamp: Date.now()
    };

    const violation = rule.evaluate(context);
    expect(violation).toBeNull();
  });

  it('blocks operations reading bytes exceeding the ceiling', () => {
    const context: ToolCallContext = {
      id: 'tx_read_bloated',
      toolName: 'soroban_invoke',
      params: { readBytes: 95000 },
      timestamp: Date.now()
    };

    const violation = rule.evaluate(context);
    expect(violation).not.toBeNull();
    expect(violation?.verdict).toBe(Verdict.BLOCK);
    expect(violation?.detectedPattern).toContain('READ_BYTES_CEILING_EXCEEDED');
  });
});
