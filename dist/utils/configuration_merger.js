export class ConfigurationMerger {
    static merge(defaults, overrides) {
        const result = { ...defaults };
        if (!overrides || typeof overrides !== 'object')
            return result;
        for (const key of Object.keys(overrides)) {
            const val = overrides[key];
            if (val && typeof val === 'object' && !Array.isArray(val) && result[key] && typeof result[key] === 'object' && !Array.isArray(result[key])) {
                result[key] = this.merge(result[key], val);
            }
            else if (val !== undefined) {
                result[key] = val;
            }
        }
        return result;
    }
}
//# sourceMappingURL=configuration_merger.js.map