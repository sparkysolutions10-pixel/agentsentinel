export class MemoryTrendTracker {
    samples = [];
    addSample(heapBytes, timestamp = Date.now()) {
        this.samples.push({ timestamp, heapBytes });
    }
    getGrowthRatePerSec() {
        if (this.samples.length < 2)
            return 0;
        const first = this.samples[0];
        const last = this.samples[this.samples.length - 1];
        const deltaSec = (last.timestamp - first.timestamp) / 1000;
        if (deltaSec <= 0)
            return 0;
        return (last.heapBytes - first.heapBytes) / deltaSec;
    }
}
//# sourceMappingURL=memory_trend_tracker.js.map