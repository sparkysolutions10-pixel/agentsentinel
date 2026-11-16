/**
 * MemoryUsageSampler - Memory allocation tracking, delta analysis, and threshold enforcement.
 */
export class MemoryUsageSampler {
    baseline = null;
    lastSample = null;
    sample(customUsage, timestamp = Date.now()) {
        const raw = customUsage ?? process.memoryUsage();
        const sample = {
            heapUsed: raw.heapUsed,
            heapTotal: raw.heapTotal,
            rss: raw.rss,
            external: raw.external,
            timestamp
        };
        if (!this.baseline) {
            this.baseline = sample;
        }
        this.lastSample = sample;
        return sample;
    }
    getBaseline() {
        return this.baseline;
    }
    getLatest() {
        return this.lastSample;
    }
    getDeltaFromBaseline() {
        if (!this.baseline || !this.lastSample)
            return null;
        return {
            heapUsedDeltaBytes: this.lastSample.heapUsed - this.baseline.heapUsed,
            rssDeltaBytes: this.lastSample.rss - this.baseline.rss,
            elapsedMs: this.lastSample.timestamp - this.baseline.timestamp
        };
    }
    isWithinLimit(maxRssBytes) {
        if (!this.lastSample)
            return true;
        return this.lastSample.rss <= maxRssBytes;
    }
    static formatBytes(bytes) {
        const abs = Math.abs(bytes);
        if (abs >= 1024 * 1024 * 1024) {
            return (bytes / (1024 * 1024 * 1024)).toFixed(2) + ' GB';
        }
        if (abs >= 1024 * 1024) {
            return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
        }
        if (abs >= 1024) {
            return (bytes / 1024).toFixed(2) + ' KB';
        }
        return `${bytes} B`;
    }
    reset() {
        this.baseline = null;
        this.lastSample = null;
    }
}
//# sourceMappingURL=memory_usage_sampler.js.map