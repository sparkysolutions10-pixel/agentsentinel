export class CostCenterTagValidator {
    static validate(tags, requiredKeys) {
        if (!tags || typeof tags !== 'object') {
            return { isValid: false, missingKeys: [...requiredKeys] };
        }
        const missingKeys = requiredKeys.filter(k => !tags[k] || tags[k].trim() === '');
        return {
            isValid: missingKeys.length === 0,
            missingKeys
        };
    }
}
//# sourceMappingURL=cost_center_tag_validator.js.map