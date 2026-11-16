/**
 * Auto-generated Enterprise Security Invariant: Issue #1972
 * Title: feat(fintech): implement Federal Reserve 3-7-1 ABA routing number checksum algorithm
 */
export declare class AchRoutingAbaChecksumValidator {
    private static readonly INVARIANT_NAME;
    static inspect(payload: string): {
        isThreat: boolean;
        invariant: string;
        latencyMs: number;
    };
    static validate(input: string): boolean;
}
//# sourceMappingURL=ach_routing_aba_checksum_validator.d.ts.map