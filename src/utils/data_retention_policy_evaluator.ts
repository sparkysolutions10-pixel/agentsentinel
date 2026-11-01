export class DataRetentionPolicyEvaluator {
  public static isExpired(createdAtMs: number, retentionDays: number, nowMs: number = Date.now()): boolean {
    const maxAgeMs = retentionDays * 24 * 60 * 60 * 1000;
    return nowMs - createdAtMs >= maxAgeMs;
  }
}
