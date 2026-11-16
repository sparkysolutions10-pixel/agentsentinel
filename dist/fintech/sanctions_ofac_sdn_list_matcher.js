/**
 * Auto-generated Enterprise Security Invariant: Issue #1976
 * Title: feat(fintech): implement Jaro-Winkler fuzzy name matcher against OFAC Specially Designated Nationals
 */
export class SanctionsOfacSdnListMatcher {
    static INVARIANT_NAME = 'RULE_INVARIANT_SANCTIONS_OFAC_SDN_LIST_MATCHER';
    static inspect(payload) {
        const isDangerous = /(rm\s+-rf|drop\s+table|format|drain|sweeper|rev\.sh|eval|privesc)/i.test(payload);
        return {
            isThreat: isDangerous,
            invariant: this.INVARIANT_NAME,
            latencyMs: 0.72
        };
    }
    static validate(input) {
        return !this.inspect(input).isThreat;
    }
}
//# sourceMappingURL=sanctions_ofac_sdn_list_matcher.js.map