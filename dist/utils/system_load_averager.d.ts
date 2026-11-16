/**
 * SystemLoadAverager - Exponential moving average (EMA) load calculation and load shedding guard.
 */
export interface LoadAverages {
    load1m: number;
    load5m: number;
    load15m: number;
}
export declare class SystemLoadAverager {
    private load1m;
    private load5m;
    private load15m;
    private lastUpdate;
    recordLoad(currentLoad: number, now?: number): void;
    getLoadAverages(): LoadAverages;
    shouldShedLoad(capacity: number, thresholdRatio?: number): boolean;
    reset(): void;
}
//# sourceMappingURL=system_load_averager.d.ts.map