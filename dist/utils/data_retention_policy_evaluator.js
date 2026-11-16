export class DataRetentionPolicyEvaluator {
    static isExpired(createdAtMs, retentionDays, nowMs = Date.now()) {
        const maxAgeMs = retentionDays * 24 * 60 * 60 * 1000;
        return nowMs - createdAtMs >= maxAgeMs;
    }
}
//# sourceMappingURL=data_retention_policy_evaluator.js.map