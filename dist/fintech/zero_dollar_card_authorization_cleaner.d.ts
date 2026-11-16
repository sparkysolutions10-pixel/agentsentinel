/**
 * Auto-generated Enterprise Security Invariant: Issue #1995
 * Title: feat(fintech): implement automated voiding of $0 or $1 card verification pre-auth holds
 */
export declare class ZeroDollarCardAuthorizationCleaner {
    private static readonly INVARIANT_NAME;
    static inspect(payload: string): {
        isThreat: boolean;
        invariant: string;
        latencyMs: number;
    };
    static validate(input: string): boolean;
}
//# sourceMappingURL=zero_dollar_card_authorization_cleaner.d.ts.map