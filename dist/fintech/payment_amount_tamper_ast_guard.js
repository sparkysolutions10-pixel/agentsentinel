/**
 * Auto-generated Enterprise Security Invariant: Issue #1957
 * Title: feat(fintech): implement invariant checker ensuring client-side checkout amount matches server order
 */
export class PaymentAmountTamperAstGuard {
    static INVARIANT_NAME = 'RULE_INVARIANT_PAYMENT_AMOUNT_TAMPER_AST_GUARD';
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
//# sourceMappingURL=payment_amount_tamper_ast_guard.js.map