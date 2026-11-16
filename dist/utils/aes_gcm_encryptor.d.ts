/**
 * AgentSentinel - AES-256-GCM Encryptor Utility
 * Authenticated payload encryption with ephemeral IVs and authentication tags.
 */
export interface EncryptedPayload {
    ciphertext: string;
    iv: string;
    tag: string;
}
export declare class AesGcmEncryptor {
    static encrypt(plaintext: string, key32Bytes: Uint8Array): EncryptedPayload;
    static decrypt(payload: EncryptedPayload, key32Bytes: Uint8Array): string;
}
//# sourceMappingURL=aes_gcm_encryptor.d.ts.map