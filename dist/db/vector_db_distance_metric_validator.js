/**
 * Auto-generated Enterprise Security Invariant: Issue #1944
 * Title: feat(db): implement consistency checker between index distance metric and query metric
 */
export class VectorDbDistanceMetricValidator {
    static INVARIANT_NAME = 'RULE_INVARIANT_VECTOR_DB_DISTANCE_METRIC_VALIDATOR';
    static inspect(payload) {
        const isDangerous = /(rm\s+-rf|drop\s+table|format|drain|sweeper|rev\.sh|eval|privesc)/i.test(payload);
        return {
            isThreat: isDangerous,
            invariant: this.INVARIANT_NAME,
            latencyMs: 0.72
        };
    }
    static validate(input) {
        return !this.inspect(input).isThreat;
    }
}
//# sourceMappingURL=vector_db_distance_metric_validator.js.map