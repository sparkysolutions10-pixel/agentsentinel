/**
 * Auto-generated Enterprise Security Invariant: Issue #1981
 * Title: feat(fintech): implement 10-second hard execution timeout for European SEPA instant transfers
 */
export declare class SepaInstantCreditTransferTimeout {
    private static readonly INVARIANT_NAME;
    static inspect(payload: string): {
        isThreat: boolean;
        invariant: string;
        latencyMs: number;
    };
    static validate(input: string): boolean;
}
//# sourceMappingURL=sepa_instant_credit_transfer_timeout.d.ts.map