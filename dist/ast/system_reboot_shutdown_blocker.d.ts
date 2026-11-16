/**
 * Auto-generated Enterprise Security Invariant: Issue #1870
 * Title: feat(ast): implement AST rule intercepting shutdown, reboot, and init 0 OS halting commands
 */
export declare class SystemRebootShutdownBlocker {
    private static readonly INVARIANT_NAME;
    static inspect(payload: string): {
        isThreat: boolean;
        invariant: string;
        latencyMs: number;
    };
    static validate(input: string): boolean;
}
//# sourceMappingURL=system_reboot_shutdown_blocker.d.ts.map