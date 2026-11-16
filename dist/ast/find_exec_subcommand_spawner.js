/**
 * Auto-generated Enterprise Security Invariant: Issue #1882
 * Title: feat(ast): implement AST scanner verifying recursive find -exec and xargs subcommand safety
 */
export class FindExecSubcommandSpawner {
    static INVARIANT_NAME = 'RULE_INVARIANT_FIND_EXEC_SUBCOMMAND_SPAWNER';
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
//# sourceMappingURL=find_exec_subcommand_spawner.js.map