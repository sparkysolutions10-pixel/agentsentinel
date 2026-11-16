/**
 * Auto-generated Enterprise Security Invariant: Issue #1890
 * Title: feat(ast): implement AST rule preventing mshta.exe execution of remote VBScript payloads
 */
export declare class MshtaVbscriptExecutionGuard {
    private static readonly INVARIANT_NAME;
    static inspect(payload: string): {
        isThreat: boolean;
        invariant: string;
        latencyMs: number;
    };
    static validate(input: string): boolean;
}
//# sourceMappingURL=mshta_vbscript_execution_guard.d.ts.map