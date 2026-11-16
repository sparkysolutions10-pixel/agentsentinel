/**
 * AgentSentinel - UUID v4 Validator Utility
 * Validates RFC-4122 UUID v4 strings including variant and version nibbles.
 */
export declare class UuidV4Validator {
    private static readonly UUID_V4_REGEX;
    static isValid(uuid: string): boolean;
    static normalize(uuid: string): string;
}
//# sourceMappingURL=uuid_v4_validator.d.ts.map