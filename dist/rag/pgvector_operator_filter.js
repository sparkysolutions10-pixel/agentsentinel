import { Verdict } from '../types.js';
export function createPgvectorOperatorFilterRule() {
    return {
        id: 'rag-pgvector-operator-filter',
        name: 'Sanitize pgvector Distance Operator Query Coordinates',
        category: 'custom',
        priority: 890,
        enabled: true,
        evaluate: (ctx) => {
            const sql = String(ctx.params?.query || ctx.params?.sql || '');
            const hasDistanceOp = sql.includes('<->') || sql.includes('<#>') || sql.includes('<=>');
            if (!hasDistanceOp)
                return null;
            const lower = sql.toLowerCase();
            if (lower.includes('nan') || lower.includes('infinity') || lower.includes('-infinity')) {
                return {
                    ruleId: 'rag-pgvector-operator-filter',
                    ruleName: 'Sanitize pgvector Distance Operator Query Coordinates',
                    severity: 'high',
                    verdict: Verdict.BLOCK,
                    reason: 'pgvector distance query contains degenerate or infinite coordinates (NaN/Infinity).',
                    detectedPattern: 'invalid-floating-point-coordinate',
                };
            }
            return null;
        }
    };
}
//# sourceMappingURL=pgvector_operator_filter.js.map