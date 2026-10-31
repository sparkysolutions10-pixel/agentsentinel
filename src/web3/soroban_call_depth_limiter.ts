/**
 * AgentSentinel - Cross-Contract Invocation Call Depth Limiter
 * Restricts nested contract-to-contract invocation call depth (< 8 default)
 * to prevent call-stack exhaustion, recursive loops, and unbounded host gas consumption.
 */

import { SentinelRule, ToolCallContext, RuleViolation, Verdict, ToolCategory } from '../types.js';

export interface SorobanCallDepthConfig {
  maxCallDepth?: number; // default: 8 hops
}

export function createSorobanCallDepthLimiterRule(config: SorobanCallDepthConfig = {}): SentinelRule {
  const maxDepth = config.maxCallDepth ?? 8;

  function computeDepth(invocation: any): number {
    if (!invocation || typeof invocation !== 'object') return 0;
    const subInvocations: any[] = Array.isArray(invocation.subInvocations)
      ? invocation.subInvocations
      : (Array.isArray(invocation.calls) ? invocation.calls : []);

    if (subInvocations.length === 0) return 1;
    let maxChildDepth = 0;
    for (const sub of subInvocations) {
      const d = computeDepth(sub);
      if (d > maxChildDepth) maxChildDepth = d;
    }
    return 1 + maxChildDepth;
  }

  return {
    id: 'soroban-call-depth-limiter',
    name: 'Soroban Invocation Call Depth Limiter',
    category: 'custom' as ToolCategory,
    priority: 75,
    enabled: true,

    evaluate(context: ToolCallContext): RuleViolation | null {
      const tool = context.toolName.toLowerCase();
      if (!tool.includes('soroban') && !tool.includes('stellar') && !tool.includes('contract')) {
        return null;
      }

      const params = context.params || {};
      let depth = Number(params.callDepth || params.depth || 0);

      // Check explicit invocation structure if provided
      if (depth === 0 && params.invocation) {
        depth = computeDepth(params.invocation);
      } else if (depth === 0 && Array.isArray(params.invocations)) {
        depth = Math.max(0, ...params.invocations.map(computeDepth));
      }

      if (depth > maxDepth) {
        return {
          ruleId: 'soroban-call-depth-limiter',
          ruleName: 'Soroban Invocation Call Depth Limiter',
          severity: 'high',
          verdict: Verdict.BLOCK,
          reason: `Cross-contract invocation depth (${depth} hops) exceeds maximum allowed limit (${maxDepth} hops). Potential recursive stack overflow risk.`,
          detectedPattern: `CALL_DEPTH_OVERFLOW:${depth}>${maxDepth}`,
        };
      }

      return null;
    }
  };
}
