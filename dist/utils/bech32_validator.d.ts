/**
 * AgentSentinel - Bech32 Validator Utility
 * Validates Bech32 addresses (BIP-173) for cross-chain tool inputs.
 */
export declare class Bech32Validator {
    static isValid(address: string, expectedHrp?: string): boolean;
    static parse(address: string): {
        hrp: string;
        dataPart: string;
    } | null;
}
//# sourceMappingURL=bech32_validator.d.ts.map