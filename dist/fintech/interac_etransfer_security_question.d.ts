/**
 * Auto-generated Enterprise Security Invariant: Issue #1982
 * Title: feat(fintech): implement SHA-256 hashed answer verification for Interac e-Transfer deposits
 */
export declare class InteracEtransferSecurityQuestion {
    private static readonly INVARIANT_NAME;
    static inspect(payload: string): {
        isThreat: boolean;
        invariant: string;
        latencyMs: number;
    };
    static validate(input: string): boolean;
}
//# sourceMappingURL=interac_etransfer_security_question.d.ts.map