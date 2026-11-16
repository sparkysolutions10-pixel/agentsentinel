/**
 * Auto-generated Enterprise Security Invariant: Issue #1975
 * Title: feat(fintech): implement heuristic detecting repetitive transactions just under $10,000 threshold
 */
export declare class AntiMoneyLaunderingStructuringFlag {
    private static readonly INVARIANT_NAME;
    static inspect(payload: string): {
        isThreat: boolean;
        invariant: string;
        latencyMs: number;
    };
    static validate(input: string): boolean;
}
//# sourceMappingURL=anti_money_laundering_structuring_flag.d.ts.map