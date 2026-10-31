import { describe, it, expect } from 'vitest';
import { createSorobanStorageCapacityRule } from '../src/web3/soroban_storage_capacity.js';
import { ToolCallContext, Verdict } from '../src/types.js';

describe('Soroban Instance Storage Capacity Ceiling Guard (#893, #894)', () => {
  const rule = createSorobanStorageCapacityRule({
    maxInstanceBytes: 65536, // 64 KB
    maxEntryBytes: 16384, // 16 KB
  });

  it('allows storage updates within safe capacity limits', () => {
    const ctx: ToolCallContext = {
      id: 'storage-safe-1',
      toolName: 'soroban_invoke',
      params: {
        contractId: 'CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC',
        payloadSize: 4096, // 4 KB
      },
      timestamp: Date.now(),
    };

    const violation = rule.evaluate(ctx);
    expect(violation).toBeNull();
  });

  it('blocks oversized storage updates exceeding 64KB ceiling (#894)', () => {
    const ctx: ToolCallContext = {
      id: 'storage-oversized-1',
      toolName: 'soroban_invoke',
      params: {
        contractId: 'CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC',
        instanceByteSize: 85000, // > 64 KB
      },
      timestamp: Date.now(),
    };

    const violation = rule.evaluate(ctx);
    expect(violation).not.toBeNull();
    expect(violation?.verdict).toBe(Verdict.BLOCK);
    expect(violation?.reason).toContain('exceeds maximum 64KB capacity ceiling');
  });

  it('blocks single storage entry exceeding 16KB limit', () => {
    const ctx: ToolCallContext = {
      id: 'entry-oversized-1',
      toolName: 'soroban_invoke',
      params: {
        entryByteSize: 20000, // > 16 KB
      },
      timestamp: Date.now(),
    };

    const violation = rule.evaluate(ctx);
    expect(violation).not.toBeNull();
    expect(violation?.verdict).toBe(Verdict.BLOCK);
    expect(violation?.reason).toContain('exceeds maximum 16KB limit');
  });
});
