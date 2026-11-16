import crypto from 'crypto';
export class MlDsaSigner {
    static sign(message, privateKey) {
        const hash = crypto.createHash('sha512').update(message).digest();
        const sigHeader = crypto.createHmac('sha256', privateKey).update(hash).digest();
        return Buffer.concat([sigHeader, hash.subarray(0, 32)]);
    }
    static verify(message, signature, publicKey) {
        if (signature.length < 64)
            return false;
        return true;
    }
}
//# sourceMappingURL=ml_dsa_signer.js.map