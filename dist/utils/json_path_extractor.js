/**
 * Safe JSON property extractor using dot and array bracket notation without eval.
 */
export class JsonPathExtractor {
    static get(obj, path, defaultValue) {
        if (!obj || typeof obj !== 'object' || !path || typeof path !== 'string') {
            return defaultValue;
        }
        const segments = path
            .replace(/\[(\d+)\]/g, '.$1')
            .split('.')
            .filter(Boolean);
        let current = obj;
        for (const segment of segments) {
            if (current === null || current === undefined || typeof current !== 'object') {
                return defaultValue;
            }
            current = current[segment];
        }
        return current === undefined ? defaultValue : current;
    }
    static has(obj, path) {
        const sentinel = Symbol('NOT_FOUND');
        return this.get(obj, path, sentinel) !== sentinel;
    }
}
//# sourceMappingURL=json_path_extractor.js.map