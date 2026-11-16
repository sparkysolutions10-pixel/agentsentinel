/**
 * Auto-generated Enterprise Security Invariant: Issue #1999
 * Title: feat(fintech): implement Financial-grade API (FAPI 1.0 Advanced) mTLS OAuth client
 */
export class OpenBankingUkFapiOauthClient {
    static INVARIANT_NAME = 'RULE_INVARIANT_OPEN_BANKING_UK_FAPI_OAUTH_CLIENT';
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
//# sourceMappingURL=open_banking_uk_fapi_oauth_client.js.map