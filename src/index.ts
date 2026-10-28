/**
 * AgentSentinel
 * The Universal Zero-Trust Security Firewall & Runtime Guard for AI Agents & MCP.
 */

import {
  Verdict,
  SentinelRule,
  ToolCallContext,
  RuleViolation,
  EvaluationResult,
  ToolCategory
} from './types.js';

export * from './types.js';

export class SentinelEngine {
  private rules: Map<string, SentinelRule> = new Map();

  public registerRule(rule: SentinelRule): void {
    this.rules.set(rule.id, rule);
  }

  public getRegisteredRules(): SentinelRule[] {
    return Array.from(this.rules.values()).sort((a, b) => b.priority - a.priority);
  }

  public async evaluate(context: ToolCallContext): Promise<EvaluationResult> {
    const start = performance.now();
    const sortedRules = this.getRegisteredRules();
    const violations: RuleViolation[] = [];
    let finalVerdict: Verdict = Verdict.ALLOW;
    let currentParams = { ...context.params };

    for (const rule of sortedRules) {
      if (!rule.enabled) continue;

      const violation = await rule.evaluate({
        ...context,
        params: currentParams
      });

      if (violation) {
        violations.push(violation);

        if (violation.verdict === Verdict.BLOCK) {
          finalVerdict = Verdict.BLOCK;
          break; // Short-circuit on critical block
        } else if (violation.verdict === Verdict.CONFIRM) {
          finalVerdict = Verdict.CONFIRM;
        } else if (violation.verdict === Verdict.REDACT) {
          if (violation.redactedParams) {
            currentParams = { ...violation.redactedParams };
          }
          if (finalVerdict === Verdict.ALLOW) {
            finalVerdict = Verdict.REDACT;
          }
        }
      }
    }

    const latencyMs = Number((performance.now() - start).toFixed(3));

    return {
      verdict: finalVerdict,
      allowed: finalVerdict !== Verdict.BLOCK,
      violations,
      latencyMs,
      redactedParams: finalVerdict === Verdict.REDACT ? currentParams : undefined
    };
  }
}
