/**
 * AgentSentinel - Allowed Keys Validator Utility
 * Validates that object dictionaries do not contain forbidden or unexpected extra keys.
 */
export declare class AllowedKeysValidator {
    static getUnexpectedKeys(obj: unknown, allowedKeys: string[]): string[];
    static hasOnlyAllowedKeys(obj: unknown, allowedKeys: string[]): boolean;
}
//# sourceMappingURL=allowed_keys_validator.d.ts.map