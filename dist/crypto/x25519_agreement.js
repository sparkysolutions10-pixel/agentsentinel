import crypto from 'crypto';
export class X25519KeyAgreement {
    static generateKeyPair() {
        const { publicKey, privateKey } = crypto.generateKeyPairSync('x25519');
        return {
            publicKey: publicKey.export({ type: 'spki', format: 'der' }),
            privateKey: privateKey.export({ type: 'pkcs8', format: 'der' })
        };
    }
    static computeSharedSecret(privateKeyDer, peerPublicKeyDer) {
        const privKey = crypto.createPrivateKey({ key: privateKeyDer, format: 'der', type: 'pkcs8' });
        const pubKey = crypto.createPublicKey({ key: peerPublicKeyDer, format: 'der', type: 'spki' });
        return crypto.diffieHellman({ privateKey: privKey, publicKey: pubKey });
    }
}
//# sourceMappingURL=x25519_agreement.js.map