/**
 * AgentSentinel - Cyclic Tool Dependency & Recursive Call Loop Guard
 * Detects cyclic graphs in agent tool invocation call chains to break
 * infinite recursion loops and runaway agent execution costs.
 */

import { SentinelRule, ToolCallContext, RuleViolation, Verdict, ToolCategory } from '../types.js';

export interface CyclicToolGuardConfig {
  maxCallChainDepth?: number; // default: 8
}

export function createCyclicToolGuardRule(config: CyclicToolGuardConfig = {}): SentinelRule {
  const maxDepth = config.maxCallChainDepth ?? 8;

  return {
    id: 'cyclic-tool-guard',
    name: 'Cyclic Tool Dependency Guard',
    category: 'custom' as ToolCategory,
    priority: 95,
    enabled: true,

    evaluate(context: ToolCallContext): RuleViolation | null {
      const params = context.params || {};
      const callStack = params._callStack || params.parentCalls || params.callPath;

      if (!callStack || !Array.isArray(callStack)) {
        return null;
      }

      const currentTool = context.toolName.toLowerCase();
      const normalizedStack = callStack.map(s => String(s).toLowerCase());

      if (normalizedStack.length >= maxDepth) {
        return {
          ruleId: 'cyclic-tool-guard',
          ruleName: 'Cyclic Tool Dependency Guard',
          severity: 'critical',
          verdict: Verdict.BLOCK,
          reason: `Tool call depth limit reached (${normalizedStack.length}/${maxDepth}). Halting potential runaway call chain.`,
          detectedPattern: `MAX_DEPTH_EXCEEDED:${normalizedStack.length}>=${maxDepth}`
        };
      }

      // Check for direct cyclic repetition (e.g. A -> B -> A)
      if (normalizedStack.includes(currentTool)) {
        const cycle = [...normalizedStack, currentTool].join(' -> ');
        return {
          ruleId: 'cyclic-tool-guard',
          ruleName: 'Cyclic Tool Dependency Guard',
          severity: 'critical',
          verdict: Verdict.BLOCK,
          reason: `Infinite recursive tool call cycle detected: ${cycle}. Halting loop.`,
          detectedPattern: `CYCLIC_CALL_DETECTED:${cycle}`
        };
      }

      return null;
    }
  };
}
