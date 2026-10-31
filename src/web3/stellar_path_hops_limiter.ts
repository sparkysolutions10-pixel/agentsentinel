/**
 * AgentSentinel - Maximum Path Hops Count Limiter
 * Restricts Stellar payment conversion paths to at most 5 hops (default standard)
 * to avoid excessive transaction fee accumulation and combinatorial latency.
 */

import { SentinelRule, ToolCallContext, RuleViolation, Verdict, ToolCategory } from '../types.js';

export interface StellarPathHopsConfig {
  maxHops?: number; // default: 5
}

export function createStellarPathHopsLimiterRule(config: StellarPathHopsConfig = {}): SentinelRule {
  const maxHops = config.maxHops ?? 5;

  return {
    id: 'stellar-path-hops-limiter',
    name: 'Stellar Path Hops Limiter',
    category: 'custom' as ToolCategory,
    priority: 80,
    enabled: true,

    evaluate(context: ToolCallContext): RuleViolation | null {
      const tool = context.toolName.toLowerCase();
      if (!tool.includes('path') && !tool.includes('payment') && !tool.includes('stellar')) {
        return null;
      }

      const params = context.params || {};
      const intermediatePath: any[] = Array.isArray(params.path) ? params.path : [];

      if (intermediatePath.length > maxHops) {
        return {
          ruleId: 'stellar-path-hops-limiter',
          ruleName: 'Stellar Path Hops Limiter',
          severity: 'medium',
          verdict: Verdict.BLOCK,
          reason: `Payment routing path contains ${intermediatePath.length} hops, exceeding maximum allowed limit (${maxHops} hops). High fee and latency overhead.`,
          detectedPattern: `PATH_HOPS_EXCEEDED:${intermediatePath.length}>${maxHops}`,
        };
      }

      return null;
    }
  };
}
