/**
 * AgentSentinel - Allowed Keys Validator Utility
 * Validates that object dictionaries do not contain forbidden or unexpected extra keys.
 */
export class AllowedKeysValidator {
    static getUnexpectedKeys(obj, allowedKeys) {
        if (!obj || typeof obj !== 'object' || Array.isArray(obj))
            return [];
        const keys = Object.keys(obj);
        const allowedSet = new Set(allowedKeys);
        return keys.filter(k => !allowedSet.has(k));
    }
    static hasOnlyAllowedKeys(obj, allowedKeys) {
        return this.getUnexpectedKeys(obj, allowedKeys).length === 0;
    }
}
//# sourceMappingURL=allowed_keys_validator.js.map