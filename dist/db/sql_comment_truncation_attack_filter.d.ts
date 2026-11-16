/**
 * Auto-generated Enterprise Security Invariant: Issue #1908
 * Title: feat(db): implement SQL sanitizer stripping -- and multiline comment injection payloads
 */
export declare class SqlCommentTruncationAttackFilter {
    private static readonly INVARIANT_NAME;
    static inspect(payload: string): {
        isThreat: boolean;
        invariant: string;
        latencyMs: number;
    };
    static validate(input: string): boolean;
}
//# sourceMappingURL=sql_comment_truncation_attack_filter.d.ts.map