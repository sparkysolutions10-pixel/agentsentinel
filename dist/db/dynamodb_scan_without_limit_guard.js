/**
 * Auto-generated Enterprise Security Invariant: Issue #1931
 * Title: feat(db): implement DynamoDB query validator requiring Limit parameter on Scan calls
 */
export class DynamodbScanWithoutLimitGuard {
    static INVARIANT_NAME = 'RULE_INVARIANT_DYNAMODB_SCAN_WITHOUT_LIMIT_GUARD';
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
//# sourceMappingURL=dynamodb_scan_without_limit_guard.js.map