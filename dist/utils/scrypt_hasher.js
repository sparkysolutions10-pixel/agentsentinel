import crypto from 'crypto';
export class ScryptHasher {
    static hashSync(password, salt, options = {}) {
        const keylen = options.keylen ?? 32;
        const saltBuf = typeof salt === 'string' ? Buffer.from(salt, 'utf-8') : salt;
        return crypto.scryptSync(password, saltBuf, keylen, {
            N: options.N ?? 1024,
            r: options.r ?? 8,
            p: options.p ?? 1
        });
    }
    static hashHex(password, salt, options = {}) {
        return this.hashSync(password, salt, options).toString('hex');
    }
}
//# sourceMappingURL=scrypt_hasher.js.map