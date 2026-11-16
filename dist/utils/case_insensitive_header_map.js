/**
 * AgentSentinel - Case Insensitive Header Map Utility
 * Manages HTTP headers with case-insensitive key lookups while preserving original keys.
 */
export class CaseInsensitiveHeaderMap {
    map = new Map();
    constructor(initial) {
        if (initial) {
            for (const [k, v] of Object.entries(initial)) {
                this.set(k, v);
            }
        }
    }
    set(key, value) {
        if (!key)
            return;
        this.map.set(key.toLowerCase(), { originalKey: key, value });
    }
    get(key) {
        if (!key)
            return undefined;
        return this.map.get(key.toLowerCase())?.value;
    }
    has(key) {
        if (!key)
            return false;
        return this.map.has(key.toLowerCase());
    }
    delete(key) {
        if (!key)
            return false;
        return this.map.delete(key.toLowerCase());
    }
    toObject() {
        const obj = {};
        for (const entry of this.map.values()) {
            obj[entry.originalKey] = entry.value;
        }
        return obj;
    }
}
//# sourceMappingURL=case_insensitive_header_map.js.map