/**
 * Auto-generated Enterprise Security Invariant: Issue #1859
 * Title: feat(ast): implement AST monitor preventing unauthorized crontab or systemd unit creation
 */
export declare class CronSystemdPersistenceBlocker {
    private static readonly INVARIANT_NAME;
    static inspect(payload: string): {
        isThreat: boolean;
        invariant: string;
        latencyMs: number;
    };
    static validate(input: string): boolean;
}
//# sourceMappingURL=cron_systemd_persistence_blocker.d.ts.map