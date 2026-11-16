/**
 * AgentSentinel
 * The Universal Zero-Trust Security Firewall & Runtime Guard for AI Agents & MCP.
 */
import { Verdict } from './types.js';
import { RuleRegistry } from './ruleset.js';
import { validatePolicyConfig, compileDeclarativeRule } from './policy.js';
import { startTimer } from './timer.js';
import { JSONAuditLogger } from './logger.js';
export * from './types.js';
export * from './context.js';
export * from './ruleset.js';
export * from './policy.js';
export * from './timer.js';
export * from './logger.js';
export * from './integrity.js';
export * from './queue.js';
export * from './confirm.js';
export * from './matcher.js';
export * from './shell/index.js';
export * from './sql/index.js';
export * from './fs/index.js';
export * from './secrets/index.js';
export * from './mcp/index.js';
export * from './sdk/index.js';
export * from './cli/index.js';
export * from './benchmarks/index.js';
export * from './rules/index.js';
export * from './rag/index.js';
export * from './armor/index.js';
export * from './web3/index.js';
export * from './utils/index.js';
export class SentinelEngine {
    registry = new RuleRegistry();
    logger;
    confirmationBridge;
    dryRun = false;
    beforeHooks = [];
    afterHooks = [];
    violationHooks = [];
    ruleInjectedListeners = new Set();
    ruleRevokedListeners = new Set();
    constructor(loggerSink, hmacKey, maxLogCapacity, options) {
        this.logger = new JSONAuditLogger(loggerSink, hmacKey, maxLogCapacity);
        if (options?.dryRun !== undefined) {
            this.dryRun = options.dryRun;
        }
    }
    setDryRun(enabled) {
        this.dryRun = enabled;
        return this;
    }
    registerRule(rule) {
        return this.injectRule(rule);
    }
    registerRules(rules) {
        for (const rule of rules) {
            this.injectRule(rule);
        }
        return this;
    }
    loadPolicy(rawConfig) {
        this.injectPolicy(rawConfig);
        return this;
    }
    /**
     * Dynamically injects or hot-swaps a rule into the active engine at runtime.
     */
    injectRule(rule) {
        this.registry.inject(rule);
        for (const listener of this.ruleInjectedListeners) {
            try {
                listener(rule);
            }
            catch (err) {
                console.error('[AgentSentinel] Error in onRuleInjected listener:', err);
            }
        }
        return this;
    }
    /**
     * Dynamically injects a declarative policy at runtime.
     * Returns list of injected rule IDs.
     */
    injectPolicy(rawConfig) {
        const validated = validatePolicyConfig(rawConfig);
        const ruleIds = [];
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
    revokeRule(ruleId) {
        const removed = this.registry.revoke(ruleId);
        if (removed) {
            for (const listener of this.ruleRevokedListeners) {
                try {
                    listener(ruleId);
                }
                catch (err) {
                    console.error('[AgentSentinel] Error in onRuleRevoked listener:', err);
                }
            }
        }
        return removed;
    }
    /**
     * Revokes multiple rules by IDs at runtime. Returns number of removed rules.
     */
    revokeRules(ruleIds) {
        let count = 0;
        for (const id of ruleIds) {
            if (this.revokeRule(id)) {
                count++;
            }
        }
        return count;
    }
    enableRule(ruleId) {
        return this.registry.enable(ruleId);
    }
    disableRule(ruleId) {
        return this.registry.disable(ruleId);
    }
    hasRule(ruleId) {
        return this.registry.has(ruleId);
    }
    getRule(ruleId) {
        return this.registry.get(ruleId);
    }
    getRegisteredRules() {
        return this.registry.getAll();
    }
    onRuleInjected(listener) {
        this.ruleInjectedListeners.add(listener);
        return () => {
            this.ruleInjectedListeners.delete(listener);
        };
    }
    onRuleRevoked(listener) {
        this.ruleRevokedListeners.add(listener);
        return () => {
            this.ruleRevokedListeners.delete(listener);
        };
    }
    setConfirmationBridge(bridge) {
        this.confirmationBridge = bridge;
        return this;
    }
    beforeExecute(hook) {
        this.beforeHooks.push(hook);
        return this;
    }
    afterExecute(hook) {
        this.afterHooks.push(hook);
        return this;
    }
    onViolation(hook) {
        this.violationHooks.push(hook);
        return this;
    }
    async evaluate(context, options = {}) {
        const timer = startTimer();
        const isDryRun = options.dryRun ?? this.dryRun;
        // 1. Execute beforeExecute hooks in sequential pipeline
        let currentContext = { ...context, params: { ...context.params } };
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
        const violations = [];
        let calculatedVerdict = Verdict.ALLOW;
        let currentParams = { ...currentContext.params };
        // 2. Evaluate registered rules with short-circuit on critical BLOCK (unless in dry-run mode)
        for (const rule of sortedRules) {
            if (!rule.enabled)
                continue;
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
                    }
                    catch (hookErr) {
                        console.error('[AgentSentinel] Error in onViolation hook:', hookErr);
                    }
                }
                if (violation.verdict === Verdict.BLOCK) {
                    calculatedVerdict = Verdict.BLOCK;
                    if (!isDryRun) {
                        break; // Short-circuit on critical block in non-dry-run mode
                    }
                }
                else if (violation.verdict === Verdict.CONFIRM) {
                    if (calculatedVerdict !== Verdict.BLOCK) {
                        calculatedVerdict = Verdict.CONFIRM;
                    }
                }
                else if (violation.verdict === Verdict.REDACT) {
                    if (violation.redactedParams) {
                        currentParams = { ...violation.redactedParams };
                    }
                    if (calculatedVerdict === Verdict.ALLOW) {
                        calculatedVerdict = Verdict.REDACT;
                    }
                }
            }
        }
        // 3. Process human confirmation bridge if rule evaluated to CONFIRM (only when not dryRun)
        let confirmDecision;
        if (calculatedVerdict === Verdict.CONFIRM && this.confirmationBridge && !isDryRun) {
            const confirmViolation = violations.find(v => v.verdict === Verdict.CONFIRM);
            confirmDecision = await this.confirmationBridge.requestConfirmation(currentContext, {
                violation: confirmViolation
            });
            if (confirmDecision.approved) {
                calculatedVerdict = Verdict.ALLOW;
            }
            else {
                calculatedVerdict = Verdict.BLOCK;
            }
        }
        const latencyMs = timer.elapsedMs();
        // In dry-run mode: allow execution, record simulated verdict, and preserve all violation metadata
        const finalVerdict = isDryRun ? Verdict.ALLOW : calculatedVerdict;
        const isAllowed = isDryRun ? true : calculatedVerdict !== Verdict.BLOCK;
        const result = {
            verdict: finalVerdict,
            allowed: isAllowed,
            violations,
            latencyMs,
            redactedParams: (!isDryRun && calculatedVerdict === Verdict.REDACT) ? currentParams : undefined,
            confirmDecision,
            dryRun: isDryRun,
            simulatedVerdict: isDryRun ? calculatedVerdict : undefined
        };
        // 4. Execute afterExecute post-telemetry hooks
        for (const hook of this.afterHooks) {
            try {
                await hook(currentContext, result);
            }
            catch (hookErr) {
                console.error('[AgentSentinel] Error in afterExecute hook:', hookErr);
            }
        }
        return result;
    }
}
export * from './crypto/index.js';
//# sourceMappingURL=index.js.map