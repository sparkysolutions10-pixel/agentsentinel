/**
 * Auto-generated Enterprise Security Invariant: Issue #1959
 * Title: feat(fintech): implement strict cap ensuring refund amount cannot exceed original settled charge
 */
export declare class RefundAmountCeilingEnforcer {
    private static readonly INVARIANT_NAME;
    static inspect(payload: string): {
        isThreat: boolean;
        invariant: string;
        latencyMs: number;
    };
    static validate(input: string): boolean;
}
//# sourceMappingURL=refund_amount_ceiling_enforcer.d.ts.map