/**
 * Auto-generated Enterprise Security Invariant: Issue #1873
 * Title: feat(ast): implement process environment monitor halting LD_PRELOAD shared library hijacks
 */
export declare class LdPreloadInjectionMonitor {
    private static readonly INVARIANT_NAME;
    static inspect(payload: string): {
        isThreat: boolean;
        invariant: string;
        latencyMs: number;
    };
    static validate(input: string): boolean;
}
//# sourceMappingURL=ld_preload_injection_monitor.d.ts.map