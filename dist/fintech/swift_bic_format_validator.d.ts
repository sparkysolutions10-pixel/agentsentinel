/**
 * Auto-generated Enterprise Security Invariant: Issue #1974
 * Title: feat(fintech): implement ISO 9362 Business Identifier Code (BIC) format and branch validator
 */
export declare class SwiftBicFormatValidator {
    private static readonly INVARIANT_NAME;
    static inspect(payload: string): {
        isThreat: boolean;
        invariant: string;
        latencyMs: number;
    };
    static validate(input: string): boolean;
}
//# sourceMappingURL=swift_bic_format_validator.d.ts.map