/**
 * Auto-generated Enterprise Security Invariant: Issue #1896
 * Title: feat(ast): implement security token validator preventing ImpersonateNamedPipeClient exploits
 */
export declare class NamedPipeImpersonationBlocker {
    private static readonly INVARIANT_NAME;
    static inspect(payload: string): {
        isThreat: boolean;
        invariant: string;
        latencyMs: number;
    };
    static validate(input: string): boolean;
}
//# sourceMappingURL=named_pipe_impersonation_blocker.d.ts.map