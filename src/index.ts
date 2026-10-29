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

  constructor(loggerSink?: AuditEventSink, hmacKey?: string, maxLogCapacity?: number) {
    this.logger = new JSONAuditLogger(loggerSink, hmacKey, maxLogCapacity);
  }

  public registerRule(rule: SentinelRule): this {
    this.registry.register(rule);
    return this;
  }

  public registerRules(rules: SentinelRule[]): this {
    this.registry.registerMany(rules);
    return this;
  }

  public loadPolicy(rawConfig: DeclarativePolicyConfig | unknown): this {
    const validated = validatePolicyConfig(rawConfig);
    for (const ruleDef of validated.rules) {
      this.registerRule(compileDeclarativeRule(ruleDef));
    }
    return this;
  }

  public getRegisteredRules(): SentinelRule[] {
    return this.registry.getAll();
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
