/**
 * Auto-generated Enterprise Security Invariant: Issue #1857
 * Title: feat(ast): implement AST guard halting rm -rf commands targeting root, home, or wildcards
 */
export declare class DangerousRmRootWildcardBlocker {
    private static readonly INVARIANT_NAME;
    static inspect(payload: string): {
        isThreat: boolean;
        invariant: string;
        latencyMs: number;
    };
    static validate(input: string): boolean;
}
//# sourceMappingURL=dangerous_rm_root_wildcard_blocker.d.ts.map