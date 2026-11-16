export declare class SlidingWindowCounter {
    private windowMs;
    private events;
    constructor(windowMs: number);
    increment(count?: number, now?: number): void;
    getCount(now?: number): number;
    private prune;
}
//# sourceMappingURL=sliding_window_counter.d.ts.map