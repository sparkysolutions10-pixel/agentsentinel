import { describe, it, expect } from 'vitest';
import {
  createSorobanFeeSurgeGuardRule,
  parseStroops,
  formatStroopsToXlm,
  UINT32_MAX,
  STROOPS_PER_XLM,
} from '../src/web3/soroban_fee_guard.js';
import { SentinelEngine } from '../src/index.js';
import { ToolCallContext, Verdict } from '../src/types.js';

describe('Soroban State Rent & Fee Surge Defense Guard (#885)', () => {
  const rule = createSorobanFeeSurgeGuardRule({
    maxFeeXlm: 10, // 10 XLM max fee ceiling
    maxRentPerKbStroops: 50_000n, // 50,000 stroops/KB rent ceiling
    maxGrowthFactor: 1_000,
  });

  describe('Stroop and XLM Utility Functions', () => {
    it('correctly converts numeric and string values into stroop BigInts', () => {
      expect(parseStroops(100)).toBe(100n);
      expect(parseStroops('10000')).toBe(10000n);
      expect(parseStroops(10_000_000)).toBe(10_000_000n);
      expect(parseStroops('10 XLM')).toBe(100_000_000n);
      expect(parseStroops('2400XLM')).toBe(24_000_000_000n);
      expect(parseStroops('0.5 xlm')).toBe(5_000_000n);
      expect(parseStroops(null)).toBe(0n);
      expect(parseStroops(undefined)).toBe(0n);
    });

    it('formats stroops into clean XLM display strings', () => {
      expect(formatStroopsToXlm(100_000_000n)).toBe('10 XLM');
      expect(formatStroopsToXlm(24_000_000_000n)).toBe('2400 XLM');
      expect(formatStroopsToXlm(15_500_000n)).toBe('1.55 XLM');
    });
  });

  describe('Scenario 1: Fee Surge Defense (> 10 XLM Safety Ceiling)', () => {
    it('blocks transaction attempting 25 XLM fee (> 10 XLM ceiling)', () => {
      const ctx: ToolCallContext = {
        id: 'soroban-surge-1',
        toolName: 'soroban_invoke',
        params: {
          contractId: 'CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC',
          function: 'swap_tokens',
          fee: '25 XLM',
        },
        timestamp: Date.now(),
      };

      const violation = rule.evaluate(ctx);
      expect(violation).not.toBeNull();
      expect(violation?.verdict).toBe(Verdict.BLOCK);
      expect(violation?.severity).toBe('high');
      expect(violation?.reason).toContain('Soroban fee surge detected');
      expect(violation?.reason).toContain('25 XLM');
      expect(violation?.reason).toContain('safety ceiling of 10 XLM');
    });

    it('blocks transaction where baseFee and resourceFee combined exceed 10 XLM', () => {
      const ctx: ToolCallContext = {
        id: 'soroban-surge-2',
        toolName: 'invokeHostFunction',
        params: {
          baseFee: '100000',
          resourceFee: 150_000_000n, // 15 XLM
        },
        timestamp: Date.now(),
      };

      const violation = rule.evaluate(ctx);
      expect(violation).not.toBeNull();
      expect(violation?.verdict).toBe(Verdict.BLOCK);
      expect(violation?.reason).toContain('fee surge detected');
    });
  });

  describe('Scenario 2: The Exact 2,400 XLM / Uint32 Integer Overflow Tripwire', () => {
    it('halts the 2,400 XLM Testnet surge transaction for exceeding uint32 boundary', () => {
      const ctx: ToolCallContext = {
        id: 'soroban-2400xlm',
        toolName: 'soroban_invoke',
        params: {
          fee: '2400 XLM',
        },
        timestamp: Date.now(),
      };

      const violation = rule.evaluate(ctx);
      expect(violation).not.toBeNull();
      expect(violation?.verdict).toBe(Verdict.BLOCK);
      expect(violation?.severity).toBe('critical');
      expect(violation?.reason).toContain('Soroban uint32 fee overflow prevented');
      expect(violation?.reason).toContain('2400 XLM');
      expect(violation?.reason).toContain('4,294,967,295');
    });

    it('halts exact simulation overflow value (20,329,513,224) reported by orbitlens', () => {
      const overflowFee = 20_329_513_224n; // Exact Testnet overflow value
      const ctx: ToolCallContext = {
        id: 'soroban-overflow-exact',
        toolName: 'soroban_simulateTransaction',
        params: {
          contractId: 'CA...123',
          resourceFee: overflowFee,
        },
        timestamp: Date.now(),
      };

      const violation = rule.evaluate(ctx);
      expect(violation).not.toBeNull();
      expect(violation?.verdict).toBe(Verdict.BLOCK);
      expect(violation?.severity).toBe('critical');
      expect(violation?.reason).toContain('Soroban uint32 fee overflow prevented');
      expect(violation?.reason).toContain('4,294,967,295');
      expect(violation?.reason).toContain(overflowFee.toString());
    });
  });

  describe('Scenario 3: State Rent Surge Circuit Breaker', () => {
    it('trips circuit breaker when storage rent surges to 2,000,000 stroops/KB', () => {
      const ctx: ToolCallContext = {
        id: 'soroban-rent-surge',
        toolName: 'soroban_invoke',
        params: {
          contractId: 'CA...456',
          function: 'store_data',
          rentPerKb: 2_000_000, // 2M stroops/KB (Testnet surge)
          fee: '1 XLM',
        },
        timestamp: Date.now(),
      };

      const violation = rule.evaluate(ctx);
      expect(violation).not.toBeNull();
      expect(violation?.verdict).toBe(Verdict.BLOCK);
      expect(violation?.severity).toBe('critical');
      expect(violation?.reason).toContain('state rent circuit breaker tripped');
      expect(violation?.reason).toContain('2000000 stroops/KB');
      expect(violation?.reason).toContain('safety threshold of 50000 stroops/KB');
    });

    it('trips circuit breaker when growth factor exceeds 1,000', () => {
      const ctx: ToolCallContext = {
        id: 'soroban-growth-surge',
        toolName: 'soroban_invoke',
        params: {
          growthFactor: 5000, // Testnet growth factor of 5000
          fee: '0.1 XLM',
        },
        timestamp: Date.now(),
      };

      const violation = rule.evaluate(ctx);
      expect(violation).not.toBeNull();
      expect(violation?.verdict).toBe(Verdict.BLOCK);
      expect(violation?.reason).toContain('exponential growth factor 5000 exceeds safety threshold 1000');
    });
  });

  describe('Scenario 4: Compliant Standard Transactions', () => {
    it('allows normal low-fee Soroban invocation cleanly', () => {
      const ctx: ToolCallContext = {
        id: 'soroban-normal-1',
        toolName: 'soroban_invoke',
        params: {
          contractId: 'CA...clean',
          function: 'balance',
          baseFee: 100, // 100 stroops (0.00001 XLM)
          resourceFee: 50_000, // 0.005 XLM
          rentPerKb: 10_000, // Normal baseline 10k stroops/KB
          growthFactor: 1,
        },
        timestamp: Date.now(),
      };

      const violation = rule.evaluate(ctx);
      expect(violation).toBeNull();
    });

    it('ignores non-Stellar tools', () => {
      const ctx: ToolCallContext = {
        id: 'unrelated-tool',
        toolName: 'read_file',
        params: {
          path: '/app/data.txt',
        },
        timestamp: Date.now(),
      };

      const violation = rule.evaluate(ctx);
      expect(violation).toBeNull();
    });
  });

  describe('Scenario 5: Fee Bump Transactions', () => {
    it('blocks fee bump exceeding 10 XLM ceiling', () => {
      const ctx: ToolCallContext = {
        id: 'soroban-bump-1',
        toolName: 'stellar_feeBump',
        params: {
          feeBump: '50 XLM',
        },
        timestamp: Date.now(),
      };

      const violation = rule.evaluate(ctx);
      expect(violation).not.toBeNull();
      expect(violation?.verdict).toBe(Verdict.BLOCK);
      expect(violation?.reason).toContain('fee surge detected');
      expect(violation?.reason).toContain('50 XLM');
    });

    it('allows safe 0.1 XLM fee bump transaction', () => {
      const ctx: ToolCallContext = {
        id: 'soroban-bump-safe',
        toolName: 'stellar_feeBump',
        params: {
          feeBump: '0.1 XLM',
        },
        timestamp: Date.now(),
      };

      const violation = rule.evaluate(ctx);
      expect(violation).toBeNull();
    });
  });

  describe('Scenario 6: SentinelEngine Integration', () => {
    it('registers into SentinelEngine and evaluates Soroban context with full audit telemetry', async () => {
      const engine = new SentinelEngine();
      engine.registerRule(createSorobanFeeSurgeGuardRule());

      const badCtx: ToolCallContext = {
        id: 'engine-surge-test',
        toolName: 'soroban_invoke',
        params: {
          fee: '2400 XLM',
        },
        timestamp: Date.now(),
      };

      const badResult = await engine.evaluate(badCtx);
      expect(badResult.allowed).toBe(false);
      expect(badResult.verdict).toBe(Verdict.BLOCK);
      expect(badResult.violations.length).toBeGreaterThan(0);
      expect(badResult.violations[0].reason).toContain('Soroban uint32 fee overflow prevented');

      const goodCtx: ToolCallContext = {
        id: 'engine-clean-test',
        toolName: 'soroban_invoke',
        params: {
          fee: '0.05 XLM',
        },
        timestamp: Date.now(),
      };

      const goodResult = await engine.evaluate(goodCtx);
      expect(goodResult.allowed).toBe(true);
      expect(goodResult.verdict).toBe(Verdict.ALLOW);
      expect(goodResult.violations.length).toBe(0);
    });
  });
});
