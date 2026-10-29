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
  ToolCategory,
  BeforeExecuteHook,
  AfterExecuteHook,
  OnViolationHook
} from './types.js';

export * from './types.js';
export * from './context.js';

export class SentinelEngine {
  private rules: Map<string, SentinelRule> = new Map();
  private beforeHooks: BeforeExecuteHook[] = [];
  private afterHooks: AfterExecuteHook[] = [];
  private violationHooks: OnViolationHook[] = [];

  public registerRule(rule: SentinelRule): void {
    this.rules.set(rule.id, rule);
  }

  public getRegisteredRules(): SentinelRule[] {
    return Array.from(this.rules.values()).sort((a, b) => b.priority - a.priority);
  }

  public beforeExecute(hook: BeforeExecuteHook): this {
    this.beforeHooks.push(hook);
    return this;
  }

  public afterExecute(hook: AfterExecuteHook): this {
    this.afterHooks.push(hook);
    return this;
  }

  public onViolation(hook: OnViolationHook): this {
    this.violationHooks.push(hook);
    return this;
  }

  public async evaluate(context: ToolCallContext): Promise<EvaluationResult> {
    const start = performance.now();

    // 1. Execute beforeExecute hooks in sequential pipeline
    let currentContext: ToolCallContext = { ...context, params: { ...context.params } };
    for (const hook of this.beforeHooks) {
      const updated = await hook(currentContext);
      if (updated) {
        currentContext = {
          ...updated,
          params: { ...updated.params }
        };
      }
    }

    const sortedRules = this.getRegisteredRules();
    const violations: RuleViolation[] = [];
    let finalVerdict: Verdict = Verdict.ALLOW;
    let currentParams = { ...currentContext.params };

    // 2. Evaluate registered rules with short-circuit on critical BLOCK
    for (const rule of sortedRules) {
      if (!rule.enabled) continue;

      const violation = await rule.evaluate({
        ...currentContext,
        params: currentParams
      });

      if (violation) {
        violations.push(violation);

        // Trigger onViolation hooks asynchronously
        for (const vHook of this.violationHooks) {
          try {
            await vHook(violation, currentContext);
          } catch (hookErr) {
            console.error('[AgentSentinel] Error in onViolation hook:', hookErr);
          }
        }

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

    const result: EvaluationResult = {
      verdict: finalVerdict,
      allowed: finalVerdict !== Verdict.BLOCK,
      violations,
      latencyMs,
      redactedParams: finalVerdict === Verdict.REDACT ? currentParams : undefined
    };

    // 3. Execute afterExecute post-telemetry hooks
    for (const hook of this.afterHooks) {
      try {
        await hook(currentContext, result);
      } catch (hookErr) {
        console.error('[AgentSentinel] Error in afterExecute hook:', hookErr);
      }
    }

    return result;
  }
}
