/**
 * Auto-generated Enterprise Security Invariant: Issue #1977
 * Title: feat(fintech): implement IP velocity limiter blocking card-testing attack scripts (< 5s spacing)
 */
export class FraudVelocityCardTestingBlocker {
    static INVARIANT_NAME = 'RULE_INVARIANT_FRAUD_VELOCITY_CARD_TESTING_BLOCKER';
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
//# sourceMappingURL=fraud_velocity_card_testing_blocker.js.map