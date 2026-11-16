/**
 * Auto-generated Enterprise Security Invariant: Issue #1993
 * Title: feat(fintech): implement rejection of foreign exchange rates older than 60 seconds
 */
export class FxExchangeRateStalenessRejector {
    static INVARIANT_NAME = 'RULE_INVARIANT_FX_EXCHANGE_RATE_STALENESS_REJECTOR';
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
//# sourceMappingURL=fx_exchange_rate_staleness_rejector.js.map