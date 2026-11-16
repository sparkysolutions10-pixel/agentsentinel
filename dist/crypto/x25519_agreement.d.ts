export declare class X25519KeyAgreement {
    static generateKeyPair(): {
        publicKey: Buffer;
        privateKey: Buffer;
    };
    static computeSharedSecret(privateKeyDer: Buffer, peerPublicKeyDer: Buffer): Buffer;
}
//# sourceMappingURL=x25519_agreement.d.ts.map