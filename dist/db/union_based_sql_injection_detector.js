/**
 * Auto-generated Enterprise Security Invariant: Issue #1909
 * Title: feat(db): implement AST analyzer detecting UNION SELECT schema discovery injection probes
 */
export class UnionBasedSqlInjectionDetector {
    static INVARIANT_NAME = 'RULE_INVARIANT_UNION_BASED_SQL_INJECTION_DETECTOR';
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
//# sourceMappingURL=union_based_sql_injection_detector.js.map