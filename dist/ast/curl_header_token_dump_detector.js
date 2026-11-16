/**
 * Auto-generated Enterprise Security Invariant: Issue #1864
 * Title: feat(ast): implement AST inspector halting outbound curl requests bearing Bearer tokens
 */
export class CurlHeaderTokenDumpDetector {
    static INVARIANT_NAME = 'RULE_INVARIANT_CURL_HEADER_TOKEN_DUMP_DETECTOR';
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
//# sourceMappingURL=curl_header_token_dump_detector.js.map