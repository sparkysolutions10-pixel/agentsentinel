export class WorkerPoolLimiter {
    concurrency;
    running = 0;
    queue = [];
    constructor(concurrency) {
        this.concurrency = Math.max(1, concurrency);
    }
    async run(task) {
        if (this.running >= this.concurrency) {
            await new Promise(resolve => this.queue.push(resolve));
        }
        this.running++;
        try {
            return await task();
        }
        finally {
            this.running--;
            if (this.queue.length > 0) {
                const next = this.queue.shift();
                if (next)
                    next();
            }
        }
    }
    getActiveCount() {
        return this.running;
    }
}
//# sourceMappingURL=worker_pool_limiter.js.map