/**
 * AgentSentinel - Safe JSON Utility
 * Safely stringifies complex objects containing circular references and BigInts,
 * and parses JSON with guaranteed fallbacks.
 */
export declare class SafeJson {
    static stringify(value: any, space?: number): string;
    static parseSafe<T>(json: string, fallback: T): T;
}
//# sourceMappingURL=safe_json.d.ts.map