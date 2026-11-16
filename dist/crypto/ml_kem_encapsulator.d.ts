export declare class MlKemEncapsulator {
    static encapsulate(publicKey: Buffer): {
        ciphertext: Buffer;
        sharedSecret: Buffer;
    };
    static decapsulate(ciphertext: Buffer, privateKey: Buffer): Buffer;
}
//# sourceMappingURL=ml_kem_encapsulator.d.ts.map