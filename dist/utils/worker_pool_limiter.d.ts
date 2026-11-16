export declare class WorkerPoolLimiter {
    private concurrency;
    private running;
    private queue;
    constructor(concurrency: number);
    run<T>(task: () => Promise<T>): Promise<T>;
    getActiveCount(): number;
}
//# sourceMappingURL=worker_pool_limiter.d.ts.map