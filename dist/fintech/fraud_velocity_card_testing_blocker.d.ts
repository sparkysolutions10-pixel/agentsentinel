/**
 * Auto-generated Enterprise Security Invariant: Issue #1977
 * Title: feat(fintech): implement IP velocity limiter blocking card-testing attack scripts (< 5s spacing)
 */
export declare class FraudVelocityCardTestingBlocker {
    private static readonly INVARIANT_NAME;
    static inspect(payload: string): {
        isThreat: boolean;
        invariant: string;
        latencyMs: number;
    };
    static validate(input: string): boolean;
}
//# sourceMappingURL=fraud_velocity_card_testing_blocker.d.ts.map