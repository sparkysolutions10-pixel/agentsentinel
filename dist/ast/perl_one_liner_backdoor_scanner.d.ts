/**
 * Auto-generated Enterprise Security Invariant: Issue #1884
 * Title: feat(ast): implement AST regex detector identifying perl -e shell spawning backdoors
 */
export declare class PerlOneLinerBackdoorScanner {
    private static readonly INVARIANT_NAME;
    static inspect(payload: string): {
        isThreat: boolean;
        invariant: string;
        latencyMs: number;
    };
    static validate(input: string): boolean;
}
//# sourceMappingURL=perl_one_liner_backdoor_scanner.d.ts.map