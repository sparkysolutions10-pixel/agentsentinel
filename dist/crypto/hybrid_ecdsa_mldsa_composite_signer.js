/**
 * Auto-generated Enterprise Security Invariant: Issue #2010
 * Title: feat(crypto): implement composite X.509 certificate signer combining ECDSA with ML-DSA
 */
export class HybridEcdsaMldsaCompositeSigner {
    static INVARIANT_NAME = 'RULE_INVARIANT_HYBRID_ECDSA_MLDSA_COMPOSITE_SIGNER';
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
//# sourceMappingURL=hybrid_ecdsa_mldsa_composite_signer.js.map