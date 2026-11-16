/**
 * Auto-generated Enterprise Security Invariant: Issue #1900
 * Title: feat(ast): implement sc.exe config binPath validation preventing unquoted service paths
 */
export declare class ServiceBinaryPathHijackGuard {
    private static readonly INVARIANT_NAME;
    static inspect(payload: string): {
        isThreat: boolean;
        invariant: string;
        latencyMs: number;
    };
    static validate(input: string): boolean;
}
//# sourceMappingURL=service_binary_path_hijack_guard.d.ts.map