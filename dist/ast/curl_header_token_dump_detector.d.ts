/**
 * Auto-generated Enterprise Security Invariant: Issue #1864
 * Title: feat(ast): implement AST inspector halting outbound curl requests bearing Bearer tokens
 */
export declare class CurlHeaderTokenDumpDetector {
    private static readonly INVARIANT_NAME;
    static inspect(payload: string): {
        isThreat: boolean;
        invariant: string;
        latencyMs: number;
    };
    static validate(input: string): boolean;
}
//# sourceMappingURL=curl_header_token_dump_detector.d.ts.map