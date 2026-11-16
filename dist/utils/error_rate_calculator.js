/**
 * ErrorRateCalculator - Sliding window error rate and classification monitor.
 */
export class ErrorRateCalculator {
    windowMs;
    events = [];
    constructor(windowMs = 60000) {
        this.windowMs = windowMs;
        if (windowMs <= 0) {
            throw new Error('Window must be positive');
        }
    }
    prune(now) {
        const cutoff = now - this.windowMs;
        this.events = this.events.filter(e => e.timestamp > cutoff);
    }
    recordSuccess(now = Date.now()) {
        this.prune(now);
        this.events.push({ timestamp: now, isError: false });
    }
    recordError(errorType = 'generic', now = Date.now()) {
        this.prune(now);
        this.events.push({ timestamp: now, isError: true, errorType });
    }
    getErrorRate(now = Date.now()) {
        this.prune(now);
        if (this.events.length === 0)
            return 0;
        const errorCount = this.events.filter(e => e.isError).length;
        return Number((errorCount / this.events.length).toFixed(4));
    }
    getErrorCountByType(now = Date.now()) {
        this.prune(now);
        const breakdown = {};
        for (const e of this.events) {
            if (e.isError && e.errorType) {
                breakdown[e.errorType] = (breakdown[e.errorType] ?? 0) + 1;
            }
        }
        return breakdown;
    }
    getTotalEvents(now = Date.now()) {
        this.prune(now);
        return this.events.length;
    }
    isExceedingThreshold(threshold, minEvents = 10, now = Date.now()) {
        this.prune(now);
        if (this.events.length < minEvents)
            return false;
        return this.getErrorRate(now) >= threshold;
    }
    reset() {
        this.events = [];
    }
}
//# sourceMappingURL=error_rate_calculator.js.map