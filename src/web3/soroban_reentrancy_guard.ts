/**
 * AgentSentinel - Read-Only Reentrancy Guard for View Function Calls
 * Detects and blocks read-only reentrancy attacks where a view function
 * is queried during an intermediate, uncommitted contract state transition.
 */

import { SentinelRule, ToolCallContext, RuleViolation, Verdict, ToolCategory } from '../types.js';

export interface SorobanReentrancyConfig {
  pendingMutations?: Set<string> | string[];
}

export function createSorobanReentrancyGuardRule(config: SorobanReentrancyConfig = {}): SentinelRule {
  const mutatingContracts = new Set<string>(
    Array.isArray(config.pendingMutations)
      ? config.pendingMutations
      : (config.pendingMutations ? Array.from(config.pendingMutations) : [])
  );

  return {
    id: 'soroban-reentrancy-guard',
    name: 'Soroban Read-Only Reentrancy Guard',
    category: 'custom' as ToolCategory,
    priority: 74,
    enabled: true,

    evaluate(context: ToolCallContext): RuleViolation | null {
      const tool = context.toolName.toLowerCase();
      if (!tool.includes('soroban') && !tool.includes('stellar') && !tool.includes('contract')) {
        return null;
      }

      const params = context.params || {};
      const contractId = String(params.contractId || params.contract || '').trim();
      const fn = String(params.function || params.method || '').toLowerCase();

      const isViewCall = fn.startsWith('get_') || fn.startsWith('view_') || fn.includes('balance') || fn.includes('price') || fn.includes('reserve');

      if (contractId && isViewCall && mutatingContracts.has(contractId)) {
        return {
          ruleId: 'soroban-reentrancy-guard',
          ruleName: 'Soroban Read-Only Reentrancy Guard',
          severity: 'critical',
          verdict: Verdict.BLOCK,
          reason: `Read-only reentrancy vulnerability detected: contract "${contractId}" is currently in a dirty uncommitted state mutation. Querying view function "${fn}" is blocked.`,
          detectedPattern: `READ_ONLY_REENTRANCY:${contractId}:${fn}`,
        };
      }

      return null;
    }
  };
}
