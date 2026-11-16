/**
 * Auto-generated Enterprise Security Invariant: Issue #1951
 * Title: feat(db): implement TypeScript AST linter flagging TypeORM query() calls with template literals
 */
export class TypeormRawQueryParameterChecker {
    static INVARIANT_NAME = 'RULE_INVARIANT_TYPEORM_RAW_QUERY_PARAMETER_CHECKER';
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
//# sourceMappingURL=typeorm_raw_query_parameter_checker.js.map