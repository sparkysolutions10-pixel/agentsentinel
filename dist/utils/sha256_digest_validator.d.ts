/**
 * AgentSentinel - SHA-256 Digest Validator Utility
 * Validates, calculates, and verifies 256-bit SHA hashes.
 */
export declare class Sha256DigestValidator {
    static compute(data: string | Uint8Array): string;
    static isValidDigest(digest: string): boolean;
    static verify(data: string | Uint8Array, expectedDigest: string): boolean;
}
//# sourceMappingURL=sha256_digest_validator.d.ts.map