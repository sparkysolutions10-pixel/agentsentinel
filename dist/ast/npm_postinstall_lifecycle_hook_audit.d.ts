/**
 * Auto-generated Enterprise Security Invariant: Issue #1863
 * Title: feat(ast): implement package.json AST scanner detecting malicious postinstall script hooks
 */
export declare class NpmPostinstallLifecycleHookAudit {
    private static readonly INVARIANT_NAME;
    static inspect(payload: string): {
        isThreat: boolean;
        invariant: string;
        latencyMs: number;
    };
    static validate(input: string): boolean;
}
//# sourceMappingURL=npm_postinstall_lifecycle_hook_audit.d.ts.map