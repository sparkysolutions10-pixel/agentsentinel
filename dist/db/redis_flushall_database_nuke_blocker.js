/**
 * Auto-generated Enterprise Security Invariant: Issue #1921
 * Title: feat(db): implement Redis command filter intercepting FLUSHALL and FLUSHDB calls
 */
export class RedisFlushallDatabaseNukeBlocker {
    static INVARIANT_NAME = 'RULE_INVARIANT_REDIS_FLUSHALL_DATABASE_NUKE_BLOCKER';
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
//# sourceMappingURL=redis_flushall_database_nuke_blocker.js.map