/**
 * Auto-generated Enterprise Security Invariant: Issue #1961
 * Title: feat(fintech): implement static AST rule prohibiting storing CVV/CVC codes in database schemas
 */
export declare class CvvPersistenceProhibitionCheck {
    private static readonly INVARIANT_NAME;
    static inspect(payload: string): {
        isThreat: boolean;
        invariant: string;
        latencyMs: number;
    };
    static validate(input: string): boolean;
}
//# sourceMappingURL=cvv_persistence_prohibition_check.d.ts.map