/**
 * SemaphoreLock - Counting semaphore for async concurrency bounds.
 */
export declare class SemaphoreLock {
    readonly maxConcurrency: number;
    private activeCount;
    private waitingQueue;
    constructor(maxConcurrency: number);
    acquire(): Promise<void>;
    release(): void;
    withLock<T>(fn: () => Promise<T>): Promise<T>;
    getActiveCount(): number;
    getWaitingCount(): number;
}
//# sourceMappingURL=semaphore_lock.d.ts.map