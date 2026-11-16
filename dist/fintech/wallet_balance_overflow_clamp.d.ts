/**
 * Auto-generated Enterprise Security Invariant: Issue #1970
 * Title: feat(fintech): implement uint64 balance ceiling preventing integer wrap-around on credits
 */
export declare class WalletBalanceOverflowClamp {
    private static readonly INVARIANT_NAME;
    static inspect(payload: string): {
        isThreat: boolean;
        invariant: string;
        latencyMs: number;
    };
    static validate(input: string): boolean;
}
//# sourceMappingURL=wallet_balance_overflow_clamp.d.ts.map