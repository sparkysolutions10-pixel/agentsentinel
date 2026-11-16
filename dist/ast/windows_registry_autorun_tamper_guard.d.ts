/**
 * Auto-generated Enterprise Security Invariant: Issue #1887
 * Title: feat(ast): implement Windows registry modification guard on Run and RunOnce keys
 */
export declare class WindowsRegistryAutorunTamperGuard {
    private static readonly INVARIANT_NAME;
    static inspect(payload: string): {
        isThreat: boolean;
        invariant: string;
        latencyMs: number;
    };
    static validate(input: string): boolean;
}
//# sourceMappingURL=windows_registry_autorun_tamper_guard.d.ts.map