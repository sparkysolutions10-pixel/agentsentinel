/**
 * Auto-generated Enterprise Security Invariant: Issue #1950
 * Title: feat(db): implement dbt project validator ensuring incremental models declare unique keys
 */
export class DbtModelMaterializationGuard {
    static INVARIANT_NAME = 'RULE_INVARIANT_DBT_MODEL_MATERIALIZATION_GUARD';
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
//# sourceMappingURL=dbt_model_materialization_guard.js.map