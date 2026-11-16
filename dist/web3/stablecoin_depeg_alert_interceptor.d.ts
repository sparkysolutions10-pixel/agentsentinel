/**
 * Auto-generated Enterprise Security Invariant: Issue #1795
 * Title: feat(web3): implement autonomous circuit breaker on stablecoin deviation > 0.5%
 */
export declare class StablecoinDepegAlertInterceptor {
    private static readonly INVARIANT_NAME;
    static inspect(payload: string): {
        isThreat: boolean;
        invariant: string;
        latencyMs: number;
    };
    static validate(input: string): boolean;
}
//# sourceMappingURL=stablecoin_depeg_alert_interceptor.d.ts.map