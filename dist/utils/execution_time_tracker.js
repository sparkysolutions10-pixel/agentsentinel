export class ExecutionTimeTracker {
    startTime = null;
    start() {
        this.startTime = process.hrtime.bigint();
    }
    stop() {
        if (this.startTime === null)
            return 0;
        const diff = process.hrtime.bigint() - this.startTime;
        this.startTime = null;
        return Number(diff) / 1_000_000;
    }
}
//# sourceMappingURL=execution_time_tracker.js.map