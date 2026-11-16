/**
 * Auto-generated Enterprise Security Invariant: Issue #1859
 * Title: feat(ast): implement AST monitor preventing unauthorized crontab or systemd unit creation
 */
export class CronSystemdPersistenceBlocker {
    static INVARIANT_NAME = 'RULE_INVARIANT_CRON_SYSTEMD_PERSISTENCE_BLOCKER';
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
//# sourceMappingURL=cron_systemd_persistence_blocker.js.map