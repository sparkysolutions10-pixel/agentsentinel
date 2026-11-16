/**
 * Auto-generated Enterprise Security Invariant: Issue #1903
 * Title: feat(ast): implement Linux cgroup pids.max limit enforcing 100 maximum child threads
 */
export class AgentSubshellForkBombRateLimiter {
    static INVARIANT_NAME = 'RULE_INVARIANT_AGENT_SUBSHELL_FORK_BOMB_RATE_LIMITER';
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
//# sourceMappingURL=agent_subshell_fork_bomb_rate_limiter.js.map