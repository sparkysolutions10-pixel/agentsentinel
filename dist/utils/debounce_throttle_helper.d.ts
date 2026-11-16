/**
 * DebounceThrottleHelper - Debounce and throttle execution helpers.
 */
export declare class DebounceThrottleHelper {
    static debounce<T extends (...args: any[]) => void>(fn: T, delayMs: number): {
        (...args: Parameters<T>): void;
        cancel: () => void;
    };
    static throttle<T extends (...args: any[]) => void>(fn: T, intervalMs: number): {
        (...args: Parameters<T>): void;
        cancel: () => void;
    };
}
//# sourceMappingURL=debounce_throttle_helper.d.ts.map