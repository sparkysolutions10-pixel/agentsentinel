/**
 * AgentSentinel - Atomic Batch Invocation Rollback Monitor
 * Ensures batch contract executions enforce strict atomicity, verifying
 * that failures in any sub-operation immediately trigger full transaction revert
 * without leaving residual partial state mutations.
 */
import { Verdict } from '../types.js';
export function createSorobanRollbackMonitorRule(config = {}) {
    const enforceAtomicity = config.disallowNonAtomicBatches ?? true;
    return {
        id: 'soroban-rollback-monitor',
        name: 'Soroban Atomic Batch Rollback Monitor',
        category: 'custom',
        priority: 71,
        enabled: true,
        evaluate(context) {
            const tool = context.toolName.toLowerCase();
            if (!tool.includes('soroban') && !tool.includes('stellar') && !tool.includes('batch')) {
                return null;
            }
            const params = context.params || {};
            const operations = Array.isArray(params.operations)
                ? params.operations
                : (Array.isArray(params.batch) ? params.batch : []);
            // If batch specifies continueOnError=true or atomic=false, reject it
            if (enforceAtomicity && operations.length > 1) {
                if (params.continueOnError === true || params.atomic === false || params.partialExecutionAllowed === true) {
                    return {
                        ruleId: 'soroban-rollback-monitor',
                        ruleName: 'Soroban Atomic Batch Rollback Monitor',
                        severity: 'high',
                        verdict: Verdict.BLOCK,
                        reason: 'Non-atomic multi-operation contract batch detected. Soroban batch operations must enforce strict atomicity to prevent partial state corruption on revert.',
                        detectedPattern: 'NON_ATOMIC_BATCH_EXECUTION',
                    };
                }
            }
            return null;
        }
    };
}
//# sourceMappingURL=soroban_rollback_monitor.js.map