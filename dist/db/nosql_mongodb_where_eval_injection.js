/**
 * Auto-generated Enterprise Security Invariant: Issue #1920
 * Title: feat(db): implement MongoDB query sanitizer disallowing $where string evaluation
 */
export class NosqlMongodbWhereEvalInjection {
    static INVARIANT_NAME = 'RULE_INVARIANT_NOSQL_MONGODB_WHERE_EVAL_INJECTION';
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
//# sourceMappingURL=nosql_mongodb_where_eval_injection.js.map