/**
 * Auto-generated Enterprise Security Invariant: Issue #1926
 * Title: feat(db): implement 30-second idle in transaction timeout terminator
 */
export declare class DatabaseTransactionIdleTimeoutReaper {
    private static readonly INVARIANT_NAME;
    static inspect(payload: string): {
        isThreat: boolean;
        invariant: string;
        latencyMs: number;
    };
    static validate(input: string): boolean;
}
//# sourceMappingURL=database_transaction_idle_timeout_reaper.d.ts.map