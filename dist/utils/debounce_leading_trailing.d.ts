export interface DebounceOptions {
    leading?: boolean;
    trailing?: boolean;
}
export declare class DebounceLeadingTrailing {
    static create<T extends (...args: any[]) => any>(fn: T, delayMs: number, options?: DebounceOptions): (...args: Parameters<T>) => void;
}
//# sourceMappingURL=debounce_leading_trailing.d.ts.map