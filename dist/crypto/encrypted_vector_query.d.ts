export declare class EncryptedVectorQueryWrapper {
    static encryptQueryVector(vector: number[], secretKey: Buffer): {
        encryptedPayload: string;
        iv: string;
    };
    static decryptQueryVector(encryptedPayload: string, ivHex: string, secretKey: Buffer): number[];
}
//# sourceMappingURL=encrypted_vector_query.d.ts.map