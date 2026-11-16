/**
 * Auto-generated Enterprise Security Invariant: Issue #1858
 * Title: feat(ast): implement regex and AST parser identifying :(){ :|:& };: forkbomb signatures
 */
export declare class ForkbombBashFunctionDetector {
    private static readonly INVARIANT_NAME;
    static inspect(payload: string): {
        isThreat: boolean;
        invariant: string;
        latencyMs: number;
    };
    static validate(input: string): boolean;
}
//# sourceMappingURL=forkbomb_bash_function_detector.d.ts.map