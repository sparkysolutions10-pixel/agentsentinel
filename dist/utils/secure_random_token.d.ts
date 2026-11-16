/**
 * AgentSentinel - Secure Random Token Generator Utility
 * Generates cryptographically strong random tokens, hex nonces, and UUIDs.
 */
export declare class SecureRandomToken {
    private static readonly DEFAULT_ALPHABET;
    static generate(length?: number, alphabet?: string): string;
    static generateHex(byteLength?: number): string;
    static generateUuid(): string;
}
//# sourceMappingURL=secure_random_token.d.ts.map