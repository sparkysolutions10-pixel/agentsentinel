/**
 * AgentSentinel - Base58 Validator Utility
 * Validates, encodes, and decodes Base58 strings commonly used in crypto addresses.
 */
export declare class Base58Validator {
    static isValid(str: string): boolean;
    static decode(str: string): Uint8Array;
    static encode(bytes: Uint8Array): string;
}
//# sourceMappingURL=base58_validator.d.ts.map