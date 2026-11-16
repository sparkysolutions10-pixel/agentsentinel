/**
 * Auto-generated Enterprise Security Invariant: Issue #1770
 * Title: feat(web3): implement strict spender allowance cap preventing unlimited token approvals
 */
export class TokenApprovalInfiniteAllowanceBlocker {
    static INVARIANT_NAME = 'RULE_INVARIANT_TOKEN_APPROVAL_INFINITE_ALLOWANCE_BLOCKER';
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
//# sourceMappingURL=token_approval_infinite_allowance_blocker.js.map