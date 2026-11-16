import crypto from 'crypto';
export class MlKemEncapsulator {
    static encapsulate(publicKey) {
        const sharedSecret = crypto.randomBytes(32);
        const ciphertext = crypto.createHash('sha384').update(Buffer.concat([publicKey, sharedSecret])).digest();
        return { ciphertext, sharedSecret };
    }
    static decapsulate(ciphertext, privateKey) {
        return crypto.createHash('sha256').update(Buffer.concat([ciphertext, privateKey])).digest();
    }
}
//# sourceMappingURL=ml_kem_encapsulator.js.map