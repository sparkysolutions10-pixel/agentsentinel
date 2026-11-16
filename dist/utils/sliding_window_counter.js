export class SlidingWindowCounter {
    windowMs;
    events = [];
    constructor(windowMs) {
        this.windowMs = windowMs;
    }
    increment(count = 1, now = Date.now()) {
        for (let i = 0; i < count; i++) {
            this.events.push(now);
        }
        this.prune(now);
    }
    getCount(now = Date.now()) {
        this.prune(now);
        return this.events.length;
    }
    prune(now) {
        const cutoff = now - this.windowMs;
        while (this.events.length > 0 && this.events[0] <= cutoff) {
            this.events.shift();
        }
    }
}
//# sourceMappingURL=sliding_window_counter.js.map