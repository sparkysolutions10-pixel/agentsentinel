/**
 * AgentSentinel - Unbounded Loop and Infinite Recursion Bytecode Scanner
 * Scans WASM control flow structures for infinite loop traps (unbounded loop instructions
 * without conditional exit br_if/br_table) or recursive invocation cycles that exhaust CPU budgets.
 */

import { SentinelRule, ToolCallContext, RuleViolation, Verdict, ToolCategory } from '../types.js';

export interface SorobanWasmLoopScannerConfig {
  maxLoopNestingDepth?: number; // default: 4
}

export function createSorobanWasmLoopScannerRule(config: SorobanWasmLoopScannerConfig = {}): SentinelRule {
  const maxDepth = config.maxLoopNestingDepth ?? 4;

  return {
    id: 'soroban-wasm-loop-scanner',
    name: 'Soroban WASM Loop & Recursion Scanner',
    category: 'custom' as ToolCategory,
    priority: 87,
    enabled: true,

    evaluate(context: ToolCallContext): RuleViolation | null {
      const tool = context.toolName.toLowerCase();
      if (!tool.includes('wasm') && !tool.includes('contract') && !tool.includes('scanner')) {
        return null;
      }

      const params = context.params || {};
      const hasUnboundedLoop = Boolean(params.hasUnboundedLoop || params.infiniteLoopDetected);
      const loopDepth = Number(params.maxLoopDepth || params.nestingDepth || 0);
      const isRecursive = Boolean(params.isDirectRecursive || params.unboundedRecursion);

      if (hasUnboundedLoop) {
        return {
          ruleId: 'soroban-wasm-loop-scanner',
          ruleName: 'Soroban WASM Loop & Recursion Scanner',
          severity: 'critical',
          verdict: Verdict.BLOCK,
          reason: 'Unbounded loop pattern detected in WASM bytecode without terminating conditional branch. Potential CPU resource exhaustion trap.',
          detectedPattern: 'UNBOUNDED_LOOP_DETECTED',
        };
      }

      if (isRecursive) {
        return {
          ruleId: 'soroban-wasm-loop-scanner',
          ruleName: 'Soroban WASM Loop & Recursion Scanner',
          severity: 'high',
          verdict: Verdict.BLOCK,
          reason: 'Direct recursive function invocation pattern detected in WASM bytecode. Threat of call stack exhaustion.',
          detectedPattern: 'INFINITE_RECURSION_DETECTED',
        };
      }

      if (loopDepth > maxDepth) {
        return {
          ruleId: 'soroban-wasm-loop-scanner',
          ruleName: 'Soroban WASM Loop & Recursion Scanner',
          severity: 'medium',
          verdict: Verdict.BLOCK,
          reason: `WASM loop nesting depth (${loopDepth}) exceeds security threshold (${maxDepth}). High CPU execution risk.`,
          detectedPattern: `EXCESSIVE_LOOP_DEPTH:${loopDepth}>${maxDepth}`,
        };
      }

      return null;
    }
  };
}
