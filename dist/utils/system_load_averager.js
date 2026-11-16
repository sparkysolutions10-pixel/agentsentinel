/**
 * SystemLoadAverager - Exponential moving average (EMA) load calculation and load shedding guard.
 */
export class SystemLoadAverager {
    load1m = 0;
    load5m = 0;
    load15m = 0;
    lastUpdate = null;
    recordLoad(currentLoad, now = Date.now()) {
        if (typeof currentLoad !== 'number' || currentLoad < 0 || isNaN(currentLoad)) {
            throw new Error('Load must be a non-negative number');
        }
        if (this.lastUpdate === null) {
            this.load1m = currentLoad;
            this.load5m = currentLoad;
            this.load15m = currentLoad;
            this.lastUpdate = now;
            return;
        }
        const elapsedSeconds = Math.max(1, (now - this.lastUpdate) / 1000);
        this.lastUpdate = now;
        // Decay factor formula: exp(-elapsed / (period * 60))
        const decay1 = Math.exp(-elapsedSeconds / 60);
        const decay5 = Math.exp(-elapsedSeconds / 300);
        const decay15 = Math.exp(-elapsedSeconds / 900);
        this.load1m = this.load1m * decay1 + currentLoad * (1 - decay1);
        this.load5m = this.load5m * decay5 + currentLoad * (1 - decay5);
        this.load15m = this.load15m * decay15 + currentLoad * (1 - decay15);
    }
    getLoadAverages() {
        return {
            load1m: Number(this.load1m.toFixed(2)),
            load5m: Number(this.load5m.toFixed(2)),
            load15m: Number(this.load15m.toFixed(2))
        };
    }
    shouldShedLoad(capacity, thresholdRatio = 0.9) {
        if (capacity <= 0)
            return true;
        return this.load1m >= capacity * thresholdRatio;
    }
    reset() {
        this.load1m = 0;
        this.load5m = 0;
        this.load15m = 0;
        this.lastUpdate = null;
    }
}
//# sourceMappingURL=system_load_averager.js.map