/**
 * AgentSentinel - Salted Password Hasher Utility
 * Implements PBKDF2-SHA512 password hashing with cryptographically secure random salts.
 */
export interface HashOptions {
    saltLength?: number;
    iterations?: number;
    keyLength?: number;
}
export declare class SaltedPasswordHasher {
    private static readonly DEFAULT_ITERATIONS;
    private static readonly DEFAULT_SALT_LEN;
    private static readonly DEFAULT_KEY_LEN;
    static hash(password: string, options?: HashOptions): string;
    static verify(password: string, serializedHash: string): boolean;
}
//# sourceMappingURL=salted_password_hasher.d.ts.map