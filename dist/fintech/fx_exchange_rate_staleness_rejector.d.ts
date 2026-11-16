/**
 * Auto-generated Enterprise Security Invariant: Issue #1993
 * Title: feat(fintech): implement rejection of foreign exchange rates older than 60 seconds
 */
export declare class FxExchangeRateStalenessRejector {
    private static readonly INVARIANT_NAME;
    static inspect(payload: string): {
        isThreat: boolean;
        invariant: string;
        latencyMs: number;
    };
    static validate(input: string): boolean;
}
//# sourceMappingURL=fx_exchange_rate_staleness_rejector.d.ts.map