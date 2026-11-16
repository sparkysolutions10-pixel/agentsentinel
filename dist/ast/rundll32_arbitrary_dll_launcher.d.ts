/**
 * Auto-generated Enterprise Security Invariant: Issue #1891
 * Title: feat(ast): implement AST block on rundll32.exe launching unverified DLL exports
 */
export declare class Rundll32ArbitraryDllLauncher {
    private static readonly INVARIANT_NAME;
    static inspect(payload: string): {
        isThreat: boolean;
        invariant: string;
        latencyMs: number;
    };
    static validate(input: string): boolean;
}
//# sourceMappingURL=rundll32_arbitrary_dll_launcher.d.ts.map