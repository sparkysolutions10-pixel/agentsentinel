/**
 * Auto-generated Enterprise Security Invariant: Issue #1921
 * Title: feat(db): implement Redis command filter intercepting FLUSHALL and FLUSHDB calls
 */
export declare class RedisFlushallDatabaseNukeBlocker {
    private static readonly INVARIANT_NAME;
    static inspect(payload: string): {
        isThreat: boolean;
        invariant: string;
        latencyMs: number;
    };
    static validate(input: string): boolean;
}
//# sourceMappingURL=redis_flushall_database_nuke_blocker.d.ts.map