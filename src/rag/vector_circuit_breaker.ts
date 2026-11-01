import { SentinelRule, ToolCallContext, RuleViolation, Verdict } from '../types.js';

export function createVectorCircuitBreakerRule(maxConsecutiveFailures: number = 5): SentinelRule {
  let consecutiveFailures = 0;

  return {
    id: 'rag-vector-circuit-breaker',
    name: 'Vector Database Pool Resiliency Circuit Breaker',
    category: 'custom',
    priority: 970,
    enabled: true,
    evaluate: (ctx: ToolCallContext): RuleViolation | null => {
      if (ctx.params?.simulatedDownstreamError === true) {
        consecutiveFailures++;
      } else if (ctx.params?.resetCircuitBreaker === true) {
        consecutiveFailures = 0;
      }

      if (consecutiveFailures >= maxConsecutiveFailures) {
        return {
          ruleId: 'rag-vector-circuit-breaker',
          ruleName: 'Vector Database Pool Resiliency Circuit Breaker',
          severity: 'high',
          verdict: Verdict.BLOCK,
          reason: `Vector circuit breaker tripped: ${consecutiveFailures} consecutive downstream failures reached limit of ${maxConsecutiveFailures}.`,
          detectedPattern: 'vector-pool-circuit-breaker-open',
        };
      }
      return null;
    }
  };
}
