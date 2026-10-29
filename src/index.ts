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
  OnViolationHook,
  ConfirmDecision
} from './types.js';
import { RuleRegistry } from './ruleset.js';
import {
  DeclarativePolicyConfig,
  validatePolicyConfig,
  compileDeclarativeRule
} from './policy.js';
import { startTimer, HRTimer } from './timer.js';
import { JSONAuditLogger, AuditEvent, AuditEventSink } from './logger.js';
import { SignedAuditEvent, signAuditEvent, verifyAuditEvent } from './integrity.js';
import { SlidingEventQueue } from './queue.js';
import { ConfirmationBridge } from './confirm.js';

export * from './types.js';
export * from './context.js';
export * from './ruleset.js';
export * from './policy.js';
export * from './timer.js';
export * from './logger.js';
export * from './integrity.js';
export * from './queue.js';
export * from './confirm.js';

export class SentinelEngine {
  public readonly registry: RuleRegistry = new RuleRegistry();
  public readonly logger: JSONAuditLogger;
  public confirmationBridge?: ConfirmationBridge;
  private beforeHooks: BeforeExecuteHook[] = [];
  private afterHooks: AfterExecuteHook[] = [];
  private violationHooks: OnViolationHook[] = [];
  private ruleInjectedListeners: Set<(rule: SentinelRule) => void> = new Set();
  private ruleRevokedListeners: Set<(ruleId: string) => void> = new Set();

  constructor(loggerSink?: AuditEventSink, hmacKey?: string, maxLogCapacity?: number) {
    this.logger = new JSONAuditLogger(loggerSink, hmacKey, maxLogCapacity);
  }

  public registerRule(rule: SentinelRule): this {
    return this.injectRule(rule);
  }

  public registerRules(rules: SentinelRule[]): this {
    for (const rule of rules) {
      this.injectRule(rule);
    }
    return this;
  }

  public loadPolicy(rawConfig: DeclarativePolicyConfig | unknown): this {
    this.injectPolicy(rawConfig);
    return this;
  }

  /**
   * Dynamically injects or hot-swaps a rule into the active engine at runtime.
   */
  public injectRule(rule: SentinelRule): this {
    this.registry.inject(rule);
    for (const listener of this.ruleInjectedListeners) {
      try {
        listener(rule);
      } catch (err) {
        console.error('[AgentSentinel] Error in onRuleInjected listener:', err);
      }
    }
    return this;
  }

  /**
   * Dynamically injects a declarative policy at runtime.
   * Returns list of injected rule IDs.
   */
  public injectPolicy(rawConfig: DeclarativePolicyConfig | unknown): string[] {
    const validated = validatePolicyConfig(rawConfig);
    const ruleIds: string[] = [];
    for (const ruleDef of validated.rules) {
      const rule = compileDeclarativeRule(ruleDef);
      this.injectRule(rule);
      ruleIds.push(rule.id);
    }
    return ruleIds;
  }

  /**
   * Revokes an active rule at runtime. Returns true if removed, false otherwise.
   */
  public revokeRule(ruleId: string): boolean {
    const removed = this.registry.revoke(ruleId);
    if (removed) {
      for (const listener of this.ruleRevokedListeners) {
        try {
          listener(ruleId);
        } catch (err) {
          console.error('[AgentSentinel] Error in onRuleRevoked listener:', err);
        }
      }
    }
    return removed;
  }

  /**
   * Revokes multiple rules by IDs at runtime. Returns number of removed rules.
   */
  public revokeRules(ruleIds: string[]): number {
    let count = 0;
    for (const id of ruleIds) {
      if (this.revokeRule(id)) {
        count++;
      }
    }
    return count;
  }

  public enableRule(ruleId: string): boolean {
    return this.registry.enable(ruleId);
  }

  public disableRule(ruleId: string): boolean {
    return this.registry.disable(ruleId);
  }

  public hasRule(ruleId: string): boolean {
    return this.registry.has(ruleId);
  }

  public getRule(ruleId: string): SentinelRule | undefined {
    return this.registry.get(ruleId);
  }

  public getRegisteredRules(): SentinelRule[] {
    return this.registry.getAll();
  }

  public onRuleInjected(listener: (rule: SentinelRule) => void): () => void {
    this.ruleInjectedListeners.add(listener);
    return () => {
      this.ruleInjectedListeners.delete(listener);
    };
  }

  public onRuleRevoked(listener: (ruleId: string) => void): () => void {
    this.ruleRevokedListeners.add(listener);
    return () => {
      this.ruleRevokedListeners.delete(listener);
    };
  }

  public setConfirmationBridge(bridge: ConfirmationBridge): this {
    this.confirmationBridge = bridge;
    return this;
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
    const timer = startTimer();

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

    const sortedRules = this.registry.getAll();
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

        // Record in structured audit logger
        this.logger.log(violation, currentContext, timer.elapsedMs());

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

    // 3. Process human confirmation bridge if rule evaluated to CONFIRM
    let confirmDecision: ConfirmDecision | undefined;
    if (finalVerdict === Verdict.CONFIRM && this.confirmationBridge) {
      const confirmViolation = violations.find(v => v.verdict === Verdict.CONFIRM);
      confirmDecision = await this.confirmationBridge.requestConfirmation(currentContext, {
        violation: confirmViolation
      });

      if (confirmDecision.approved) {
        finalVerdict = Verdict.ALLOW;
      } else {
        finalVerdict = Verdict.BLOCK;
      }
    }

    const latencyMs = timer.elapsedMs();

    const result: EvaluationResult = {
      verdict: finalVerdict,
      allowed: finalVerdict !== Verdict.BLOCK,
      violations,
      latencyMs,
      redactedParams: finalVerdict === Verdict.REDACT ? currentParams : undefined,
      confirmDecision
    };

    // 4. Execute afterExecute post-telemetry hooks
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
