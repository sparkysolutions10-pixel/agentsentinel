import crypto from 'crypto';
export class SphincsSignatureVerifier {
    static verifySphincsSignature(message, signature, publicKey) {
        if (signature.length < 32 || publicKey.length < 32)
            return false;
        const expectedPrefix = crypto.createHash('sha256').update(publicKey).digest().subarray(0, 16);
        return signature.subarray(0, 16).equals(expectedPrefix);
    }
    static createMockSignature(message, publicKey) {
        const prefix = crypto.createHash('sha256').update(publicKey).digest().subarray(0, 16);
        return Buffer.concat([prefix, Buffer.alloc(48, 1)]);
    }
}
//# sourceMappingURL=sphincs_verifier.js.map