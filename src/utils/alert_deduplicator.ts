export class AlertDeduplicator {
  private cooldownMs: number;
  private lastAlertTimes: Map<string, number> = new Map();

  constructor(cooldownMs: number = 60000) {
    this.cooldownMs = cooldownMs;
  }

  public shouldFire(alertKey: string, now: number = Date.now()): boolean {
    const last = this.lastAlertTimes.get(alertKey);
    if (!last || now - last >= this.cooldownMs) {
      this.lastAlertTimes.set(alertKey, now);
      return true;
    }
    return false;
  }
}
