/**
 * AgentSentinel - AES-256-GCM Encryptor Utility
 * Authenticated payload encryption with ephemeral IVs and authentication tags.
 */
import crypto from 'node:crypto';
export class AesGcmEncryptor {
    static encrypt(plaintext, key32Bytes) {
        if (key32Bytes.length !== 32) {
            throw new Error(`AES-256 key must be exactly 32 bytes, got ${key32Bytes.length}`);
        }
        const iv = crypto.randomBytes(12);
        const cipher = crypto.createCipheriv('aes-256-gcm', key32Bytes, iv);
        let ciphertext = cipher.update(plaintext, 'utf-8', 'hex');
        ciphertext += cipher.final('hex');
        const tag = cipher.getAuthTag().toString('hex');
        return {
            ciphertext,
            iv: iv.toString('hex'),
            tag
        };
    }
    static decrypt(payload, key32Bytes) {
        if (key32Bytes.length !== 32) {
            throw new Error(`AES-256 key must be exactly 32 bytes, got ${key32Bytes.length}`);
        }
        const iv = Buffer.from(payload.iv, 'hex');
        const tag = Buffer.from(payload.tag, 'hex');
        const decipher = crypto.createDecipheriv('aes-256-gcm', key32Bytes, iv);
        decipher.setAuthTag(tag);
        let plaintext = decipher.update(payload.ciphertext, 'hex', 'utf-8');
        plaintext += decipher.final('utf-8');
        return plaintext;
    }
}
//# sourceMappingURL=aes_gcm_encryptor.js.map