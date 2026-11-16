/**
 * AgentSentinel - Secure Random Token Generator Utility
 * Generates cryptographically strong random tokens, hex nonces, and UUIDs.
 */
import crypto from 'node:crypto';
export class SecureRandomToken {
    static DEFAULT_ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_';
    static generate(length = 32, alphabet = this.DEFAULT_ALPHABET) {
        if (length <= 0)
            return '';
        const bytes = crypto.randomBytes(length);
        let result = '';
        const alphaLen = alphabet.length;
        for (let i = 0; i < length; i++) {
            result += alphabet[bytes[i] % alphaLen];
        }
        return result;
    }
    static generateHex(byteLength = 16) {
        return crypto.randomBytes(byteLength).toString('hex');
    }
    static generateUuid() {
        return crypto.randomUUID();
    }
}
//# sourceMappingURL=secure_random_token.js.map