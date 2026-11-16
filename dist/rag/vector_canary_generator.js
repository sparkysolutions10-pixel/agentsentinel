import { Verdict } from '../types.js';
export function createVectorCanaryRule() {
    return {
        id: 'rag-vector-canary-honeypot',
        name: 'Honeypot Canary Key Access Monitor',
        category: 'custom',
        priority: 920,
        enabled: true,
        evaluate: (ctx) => {
            const id = String(ctx.params?.id || ctx.params?.key || ctx.params?.vectorId || '');
            const filter = JSON.stringify(ctx.params || '');
            if (id.includes('__canary_rag_') || filter.includes('__canary_rag_')) {
                return {
                    ruleId: 'rag-vector-canary-honeypot',
                    ruleName: 'Honeypot Canary Key Access Monitor',
                    severity: 'critical',
                    verdict: Verdict.BLOCK,
                    reason: 'Unauthorized access to vector security honeypot canary detected.',
                    detectedPattern: '__canary_rag_key_access',
                };
            }
            return null;
        }
    };
}
//# sourceMappingURL=vector_canary_generator.js.map