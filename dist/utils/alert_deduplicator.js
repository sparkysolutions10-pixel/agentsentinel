export class AlertDeduplicator {
    cooldownMs;
    lastAlertTimes = new Map();
    constructor(cooldownMs = 60000) {
        this.cooldownMs = cooldownMs;
    }
    shouldFire(alertKey, now = Date.now()) {
        const last = this.lastAlertTimes.get(alertKey);
        if (!last || now - last >= this.cooldownMs) {
            this.lastAlertTimes.set(alertKey, now);
            return true;
        }
        return false;
    }
}
//# sourceMappingURL=alert_deduplicator.js.map