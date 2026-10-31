import { describe, it, expect } from 'vitest';
import { createSorobanFootprintGuardRule } from '../src/web3/soroban_footprint_guard.js';
import { ToolCallContext, Verdict } from '../src/types.js';

describe('Soroban Footprint Memory Conflict Guard (#887, #888)', () => {
  const activeLockKey = 'LEDGER_KEY_BALANCE_USDC_ACCOUNT_ABC';
  const rule = createSorobanFootprintGuardRule({
    maxFootprintKeys: 10,
    activeLocks: [activeLockKey],
  });

  it('allows safe non-conflicting footprint within capacity limit', () => {
    const ctx: ToolCallContext = {
      id: 'footprint-safe-1',
      toolName: 'soroban_invoke',
      params: {
        contractId: 'CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC',
        readOnly: ['KEY_CONFIG', 'KEY_ADMIN'],
        readWrite: ['KEY_USER_DATA_XYZ'],
      },
      timestamp: Date.now(),
    };

    const violation = rule.evaluate(ctx);
    expect(violation).toBeNull();
  });

  it('blocks footprint exceeding maximum key capacity limit (#888)', () => {
    const keys = Array.from({ length: 15 }, (_, i) => `KEY_ROW_${i}`);
    const ctx: ToolCallContext = {
      id: 'footprint-overflow-1',
      toolName: 'soroban_invoke',
      params: {
        contractId: 'CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC',
        readWrite: keys,
      },
      timestamp: Date.now(),
    };

    const violation = rule.evaluate(ctx);
    expect(violation).not.toBeNull();
    expect(violation?.verdict).toBe(Verdict.BLOCK);
    expect(violation?.reason).toContain('exceeds maximum allowed capacity');
  });

  it('blocks invalid self-collision when key is in both readOnly and readWrite', () => {
    const ctx: ToolCallContext = {
      id: 'footprint-self-collision-1',
      toolName: 'stellar_transaction',
      params: {
        footprint: {
          readOnly: ['KEY_COLLISION_TARGET'],
          readWrite: ['KEY_COLLISION_TARGET', 'KEY_OTHER'],
        },
      },
      timestamp: Date.now(),
    };

    const violation = rule.evaluate(ctx);
    expect(violation).not.toBeNull();
    expect(violation?.verdict).toBe(Verdict.BLOCK);
    expect(violation?.reason).toContain('appears in both readOnly and readWrite');
  });

  it('blocks concurrent write lock conflicts with active locks', () => {
    const ctx: ToolCallContext = {
      id: 'footprint-lock-conflict-1',
      toolName: 'soroban_simulate',
      params: {
        readWrite: [activeLockKey],
      },
      timestamp: Date.now(),
    };

    const violation = rule.evaluate(ctx);
    expect(violation).not.toBeNull();
    expect(violation?.verdict).toBe(Verdict.BLOCK);
    expect(violation?.reason).toContain('currently locked by a concurrent transaction');
  });

  it('ignores non-web3 tools safely', () => {
    const ctx: ToolCallContext = {
      id: 'shell-tool-1',
      toolName: 'bash_exec',
      params: {
        command: 'echo test',
      },
      timestamp: Date.now(),
    };

    const violation = rule.evaluate(ctx);
    expect(violation).toBeNull();
  });
});
