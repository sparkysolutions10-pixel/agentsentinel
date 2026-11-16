/**
 * AgentSentinel - Case Insensitive Header Map Utility
 * Manages HTTP headers with case-insensitive key lookups while preserving original keys.
 */
export declare class CaseInsensitiveHeaderMap {
    private map;
    constructor(initial?: Record<string, string>);
    set(key: string, value: string): void;
    get(key: string): string | undefined;
    has(key: string): boolean;
    delete(key: string): boolean;
    toObject(): Record<string, string>;
}
//# sourceMappingURL=case_insensitive_header_map.d.ts.map