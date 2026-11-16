import crypto from 'crypto';
export class HkdfSessionDeriver {
    static deriveKey(masterSecret, salt, info, keyLength = 32) {
        const raw = crypto.hkdfSync('sha256', masterSecret, salt, Buffer.from(info, 'utf8'), keyLength);
        return Buffer.from(raw);
    }
}
//# sourceMappingURL=hkdf_session.js.map