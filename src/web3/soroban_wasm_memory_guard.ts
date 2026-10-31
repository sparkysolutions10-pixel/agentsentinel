/**
 * AgentSentinel - Linear Memory Page Allocation Ceiling Guard
 * Enforces maximum WASM linear memory limits (default: 64 pages / 4MB, 1 page = 64 KiB)
 * on Soroban smart contract execution to protect against memory exhaustion OOM attacks.
 */

import { SentinelRule, ToolCallContext, RuleViolation, Verdict, ToolCategory } from '../types.js';

export interface SorobanWasmMemoryConfig {
  maxMemoryPages?: number; // default: 64 pages (4 MiB)
}

export function createSorobanWasmMemoryGuardRule(config: SorobanWasmMemoryConfig = {}): SentinelRule {
  const maxPages = config.maxMemoryPages ?? 64;

  return {
    id: 'soroban-wasm-memory-guard',
    name: 'Soroban WASM Linear Memory Guard',
    category: 'custom' as ToolCategory,
    priority: 85,
    enabled: true,

    evaluate(context: ToolCallContext): RuleViolation | null {
      const tool = context.toolName.toLowerCase();
      if (!tool.includes('wasm') && !tool.includes('memory') && !tool.includes('contract')) {
        return null;
      }

      const params = context.params || {};
      const requestedPages = Number(params.initialMemoryPages ?? params.memoryPages ?? params.memoryGrowPages ?? 0);

      if (requestedPages > maxPages) {
        const memKb = requestedPages * 64;
        const maxKb = maxPages * 64;
        return {
          ruleId: 'soroban-wasm-memory-guard',
          ruleName: 'Soroban WASM Linear Memory Guard',
          severity: 'high',
          verdict: Verdict.BLOCK,
          reason: `WASM contract memory allocation (${requestedPages} pages / ${memKb} KiB) exceeds security ceiling (${maxPages} pages / ${maxKb} KiB). Memory exhaustion intercepted.`,
          detectedPattern: `MEMORY_PAGES_EXCEEDED:${requestedPages}>${maxPages}`,
        };
      }

      return null;
    }
  };
}
