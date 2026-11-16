/**
 * Auto-generated Enterprise Security Invariant: Issue #1855
 * Title: feat(ast): implement AST block intercepting sudo and su commands in coding agent shells
 */
export declare class SudoPrivilegeEscalationGuard {
    private static readonly INVARIANT_NAME;
    static inspect(payload: string): {
        isThreat: boolean;
        invariant: string;
        latencyMs: number;
    };
    static validate(input: string): boolean;
}
//# sourceMappingURL=sudo_privilege_escalation_guard.d.ts.map