/**
 * AgentSentinel - Safe JSON Utility
 * Safely stringifies complex objects containing circular references and BigInts,
 * and parses JSON with guaranteed fallbacks.
 */
export class SafeJson {
    static stringify(value, space) {
        const seen = new WeakSet();
        return JSON.stringify(value, (_key, val) => {
            if (typeof val === 'object' && val !== null) {
                if (seen.has(val)) {
                    return '[Circular]';
                }
                seen.add(val);
            }
            if (typeof val === 'bigint') {
                return val.toString() + 'n';
            }
            return val;
        }, space);
    }
    static parseSafe(json, fallback) {
        try {
            if (typeof json !== 'string')
                return fallback;
            return JSON.parse(json);
        }
        catch {
            return fallback;
        }
    }
}
//# sourceMappingURL=safe_json.js.map