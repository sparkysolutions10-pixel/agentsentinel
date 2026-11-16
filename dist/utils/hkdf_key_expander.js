import crypto from 'crypto';
export class HkdfKeyExpander {
    static extract(ikm, salt) {
        const effectiveSalt = salt && salt.length > 0 ? salt : Buffer.alloc(32, 0);
        return crypto.createHmac('sha256', effectiveSalt).update(ikm).digest();
    }
    static expand(prk, info, length) {
        const hashLen = 32;
        const n = Math.ceil(length / hashLen);
        let okm = Buffer.alloc(0);
        let prev = Buffer.alloc(0);
        for (let i = 1; i <= n; i++) {
            const hmac = crypto.createHmac('sha256', prk);
            hmac.update(prev);
            hmac.update(info);
            hmac.update(Buffer.from([i]));
            prev = hmac.digest();
            okm = Buffer.concat([okm, prev]);
        }
        return okm.subarray(0, length);
    }
    static deriveKey(ikm, salt, info, length) {
        const prk = this.extract(ikm, salt);
        return this.expand(prk, info, length);
    }
}
//# sourceMappingURL=hkdf_key_expander.js.map