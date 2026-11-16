/**
 * Auto-generated Enterprise Security Invariant: Issue #1876
 * Title: feat(ast): implement Python AST validator flagging dangerous eval() and exec() calls
 */
export declare class PythonEvalCodeInjectionBlocker {
    private static readonly INVARIANT_NAME;
    static inspect(payload: string): {
        isThreat: boolean;
        invariant: string;
        latencyMs: number;
    };
    static validate(input: string): boolean;
}
//# sourceMappingURL=python_eval_code_injection_blocker.d.ts.map