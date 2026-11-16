/**
 * SemaphoreLock - Counting semaphore for async concurrency bounds.
 */
export class SemaphoreLock {
    maxConcurrency;
    activeCount = 0;
    waitingQueue = [];
    constructor(maxConcurrency) {
        this.maxConcurrency = maxConcurrency;
        if (maxConcurrency <= 0) {
            throw new Error('maxConcurrency must be greater than 0');
        }
    }
    async acquire() {
        if (this.activeCount < this.maxConcurrency) {
            this.activeCount++;
            return;
        }
        return new Promise(resolve => {
            this.waitingQueue.push(resolve);
        });
    }
    release() {
        if (this.waitingQueue.length > 0) {
            const next = this.waitingQueue.shift();
            next();
        }
        else {
            this.activeCount = Math.max(0, this.activeCount - 1);
        }
    }
    async withLock(fn) {
        await this.acquire();
        try {
            return await fn();
        }
        finally {
            this.release();
        }
    }
    getActiveCount() {
        return this.activeCount;
    }
    getWaitingCount() {
        return this.waitingQueue.length;
    }
}
//# sourceMappingURL=semaphore_lock.js.map