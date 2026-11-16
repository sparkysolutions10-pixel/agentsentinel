import crypto from 'crypto';
export class Pbkdf2KeyDeriver {
    static deriveKey(password, salt, options = {}) {
        const iterations = options.iterations ?? 100000;
        const keylen = options.keylen ?? 32;
        const digest = options.digest ?? 'sha256';
        const saltBuf = typeof salt === 'string' ? Buffer.from(salt, 'utf-8') : salt;
        return crypto.pbkdf2Sync(password, saltBuf, iterations, keylen, digest);
    }
    static deriveHexKey(password, salt, options = {}) {
        return this.deriveKey(password, salt, options).toString('hex');
    }
}
//# sourceMappingURL=pbkdf2_key_deriver.js.map