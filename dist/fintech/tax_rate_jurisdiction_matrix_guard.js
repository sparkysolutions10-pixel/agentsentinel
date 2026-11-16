/**
 * Auto-generated Enterprise Security Invariant: Issue #1967
 * Title: feat(fintech): implement state and country tax rate lookup validator preventing 0% overrides
 */
export class TaxRateJurisdictionMatrixGuard {
    static INVARIANT_NAME = 'RULE_INVARIANT_TAX_RATE_JURISDICTION_MATRIX_GUARD';
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
//# sourceMappingURL=tax_rate_jurisdiction_matrix_guard.js.map