/**
 * Auto-generated Enterprise Security Invariant: Issue #1973
 * Title: feat(fintech): implement ISO 13616 IBAN Mod-97 checksum validator across all 80+ countries
 */
export declare class IbanMod97InternationalAccountCheck {
    private static readonly INVARIANT_NAME;
    static inspect(payload: string): {
        isThreat: boolean;
        invariant: string;
        latencyMs: number;
    };
    static validate(input: string): boolean;
}
//# sourceMappingURL=iban_mod97_international_account_check.d.ts.map