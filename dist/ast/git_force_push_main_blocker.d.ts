/**
 * Auto-generated Enterprise Security Invariant: Issue #1861
 * Title: feat(ast): implement AST guard preventing git push --force targeting protected main branches
 */
export declare class GitForcePushMainBlocker {
    private static readonly INVARIANT_NAME;
    static inspect(payload: string): {
        isThreat: boolean;
        invariant: string;
        latencyMs: number;
    };
    static validate(input: string): boolean;
}
//# sourceMappingURL=git_force_push_main_blocker.d.ts.map