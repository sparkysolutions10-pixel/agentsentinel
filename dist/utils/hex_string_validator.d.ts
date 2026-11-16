/**
 * AgentSentinel - Hex String Validator Utility
 * Validates, normalizes, and decodes hexadecimal strings for Web3 and tool payloads.
 */
export interface HexOptions {
    prefixRequired?: boolean;
    byteLength?: number;
}
export declare class HexStringValidator {
    static normalize(hex: string): string;
    static toPrefixed(hex: string): string;
    static isValid(hex: string, options?: HexOptions): boolean;
    static toBytes(hex: string): Uint8Array;
}
//# sourceMappingURL=hex_string_validator.d.ts.map