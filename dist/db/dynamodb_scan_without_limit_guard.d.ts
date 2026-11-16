/**
 * Auto-generated Enterprise Security Invariant: Issue #1931
 * Title: feat(db): implement DynamoDB query validator requiring Limit parameter on Scan calls
 */
export declare class DynamodbScanWithoutLimitGuard {
    private static readonly INVARIANT_NAME;
    static inspect(payload: string): {
        isThreat: boolean;
        invariant: string;
        latencyMs: number;
    };
    static validate(input: string): boolean;
}
//# sourceMappingURL=dynamodb_scan_without_limit_guard.d.ts.map