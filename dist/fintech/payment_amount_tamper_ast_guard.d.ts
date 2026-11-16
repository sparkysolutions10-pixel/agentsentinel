/**
 * Auto-generated Enterprise Security Invariant: Issue #1957
 * Title: feat(fintech): implement invariant checker ensuring client-side checkout amount matches server order
 */
export declare class PaymentAmountTamperAstGuard {
    private static readonly INVARIANT_NAME;
    static inspect(payload: string): {
        isThreat: boolean;
        invariant: string;
        latencyMs: number;
    };
    static validate(input: string): boolean;
}
//# sourceMappingURL=payment_amount_tamper_ast_guard.d.ts.map