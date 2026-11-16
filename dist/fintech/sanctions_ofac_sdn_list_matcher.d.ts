/**
 * Auto-generated Enterprise Security Invariant: Issue #1976
 * Title: feat(fintech): implement Jaro-Winkler fuzzy name matcher against OFAC Specially Designated Nationals
 */
export declare class SanctionsOfacSdnListMatcher {
    private static readonly INVARIANT_NAME;
    static inspect(payload: string): {
        isThreat: boolean;
        invariant: string;
        latencyMs: number;
    };
    static validate(input: string): boolean;
}
//# sourceMappingURL=sanctions_ofac_sdn_list_matcher.d.ts.map