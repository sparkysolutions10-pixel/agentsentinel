import { describe, it, expect } from 'vitest';
import { createSorobanTtlMonitorRule } from '../src/web3/soroban_ttl_monitor.js';
import { ToolCallContext, Verdict } from '../src/types.js';

describe('Soroban State Archival TTL Monitor (#889, #890)', () => {
  const rule = createSorobanTtlMonitorRule({
    minTtlLedgers: 1000,
  });

  it('allows contract execution when TTL is safely above threshold', () => {
    const ctx: ToolCallContext = {
      id: 'ttl-safe-1',
      toolName: 'soroban_invoke',
      params: {
        contractId: 'CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC',
        ttlLedgers: 50000,
      },
      timestamp: Date.now(),
    };

    const violation = rule.evaluate(ctx);
    expect(violation).toBeNull();
  });

  it('blocks invocation when TTL is below safety threshold (< 1000 ledgers) (#890)', () => {
    const ctx: ToolCallContext = {
      id: 'ttl-deficit-1',
      toolName: 'soroban_invoke',
      params: {
        contractId: 'CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC',
        ttlLedgers: 450,
      },
      timestamp: Date.now(),
    };

    const violation = rule.evaluate(ctx);
    expect(violation).not.toBeNull();
    expect(violation?.verdict).toBe(Verdict.BLOCK);
    expect(violation?.reason).toContain('below safety minimum');
  });

  it('blocks invocation when contract state is already archived (TTL <= 0)', () => {
    const ctx: ToolCallContext = {
      id: 'ttl-archived-1',
      toolName: 'soroban_invoke',
      params: {
        contractId: 'CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC',
        liveUntilLedgerSeq: 500,
        currentLedgerSeq: 600, // expired by 100 ledgers
      },
      timestamp: Date.now(),
    };

    const violation = rule.evaluate(ctx);
    expect(violation).not.toBeNull();
    expect(violation?.verdict).toBe(Verdict.BLOCK);
    expect(violation?.reason).toContain('already archived');
  });

  it('allows explicit extendFootprintTtl operations even with low TTL', () => {
    const ctx: ToolCallContext = {
      id: 'ttl-extend-op-1',
      toolName: 'soroban_extend_ttl',
      params: {
        contractId: 'CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC',
        extendLedgers: 100000,
        ttlLedgers: 200,
      },
      timestamp: Date.now(),
    };

    const violation = rule.evaluate(ctx);
    expect(violation).toBeNull();
  });
});
