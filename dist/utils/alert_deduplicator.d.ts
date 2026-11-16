export declare class AlertDeduplicator {
    private cooldownMs;
    private lastAlertTimes;
    constructor(cooldownMs?: number);
    shouldFire(alertKey: string, now?: number): boolean;
}
//# sourceMappingURL=alert_deduplicator.d.ts.map