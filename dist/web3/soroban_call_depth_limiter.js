/**
 * AgentSentinel - Cross-Contract Invocation Call Depth Limiter
 * Restricts nested contract-to-contract invocation call depth (< 8 default)
 * to prevent call-stack exhaustion, recursive loops, and unbounded host gas consumption.
 */
import { Verdict } from '../types.js';
export function createSorobanCallDepthLimiterRule(config = {}) {
    const maxDepth = config.maxCallDepth ?? 8;
    function computeDepth(invocation) {
        if (!invocation || typeof invocation !== 'object')
            return 0;
        const subInvocations = Array.isArray(invocation.subInvocations)
            ? invocation.subInvocations
            : (Array.isArray(invocation.calls) ? invocation.calls : []);
        if (subInvocations.length === 0)
            return 1;
        let maxChildDepth = 0;
        for (const sub of subInvocations) {
            const d = computeDepth(sub);
            if (d > maxChildDepth)
                maxChildDepth = d;
        }
        return 1 + maxChildDepth;
    }
    return {
        id: 'soroban-call-depth-limiter',
        name: 'Soroban Invocation Call Depth Limiter',
        category: 'custom',
        priority: 75,
        enabled: true,
        evaluate(context) {
            const tool = context.toolName.toLowerCase();
            if (!tool.includes('soroban') && !tool.includes('stellar') && !tool.includes('contract')) {
                return null;
            }
            const params = context.params || {};
            let depth = Number(params.callDepth || params.depth || 0);
            // Check explicit invocation structure if provided
            if (depth === 0 && params.invocation) {
                depth = computeDepth(params.invocation);
            }
            else if (depth === 0 && Array.isArray(params.invocations)) {
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
//# sourceMappingURL=soroban_call_depth_limiter.js.map