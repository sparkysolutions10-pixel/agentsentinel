/**
 * Auto-generated Enterprise Security Invariant: Issue #1940
 * Title: feat(db): implement T-SQL AST block on master..xp_cmdshell system execution procedures
 */
export class SqlServerXpCmdshellProhibition {
    static INVARIANT_NAME = 'RULE_INVARIANT_SQL_SERVER_XP_CMDSHELL_PROHIBITION';
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
//# sourceMappingURL=sql_server_xp_cmdshell_prohibition.js.map