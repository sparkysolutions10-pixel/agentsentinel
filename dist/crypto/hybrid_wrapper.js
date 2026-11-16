import crypto from 'crypto';
export class HybridCryptoWrapper {
    static combineKeys(classicalSecret, quantumSecret) {
        return crypto.createHash('sha384').update(Buffer.concat([classicalSecret, quantumSecret])).digest().subarray(0, 32);
    }
    static verifyBoth(classicalValid, quantumValid) {
        return classicalValid && quantumValid;
    }
}
//# sourceMappingURL=hybrid_wrapper.js.map