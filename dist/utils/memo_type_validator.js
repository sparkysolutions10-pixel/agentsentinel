/**
 * MemoTypeValidator - Stellar transaction memo validation and byte bounds checking.
 */
export class MemoTypeValidator {
    static validateTextMemo(text) {
        if (typeof text !== 'string') {
            return { valid: false, type: 'text', error: 'Memo text must be a string' };
        }
        const byteLength = Buffer.byteLength(text, 'utf-8');
        if (byteLength > 28) {
            return { valid: false, type: 'text', error: `Memo text exceeds 28 bytes (actual: ${byteLength})` };
        }
        return { valid: true, type: 'text' };
    }
    static validateIdMemo(id) {
        try {
            const b = BigInt(id);
            if (b < 0n || b > 18446744073709551615n) { // uint64 max
                return { valid: false, type: 'id', error: 'Memo ID must be an unsigned 64-bit integer (0 to 2^64-1)' };
            }
            return { valid: true, type: 'id' };
        }
        catch {
            return { valid: false, type: 'id', error: 'Invalid integer format for Memo ID' };
        }
    }
    static validateHashMemo(hash, type = 'hash') {
        if (typeof hash !== 'string') {
            return { valid: false, type, error: `Memo ${type} must be a hex string` };
        }
        const trimmed = hash.trim().toLowerCase();
        if (!/^[0-9a-f]{64}$/.test(trimmed)) {
            return { valid: false, type, error: `Memo ${type} must be a 64-character (32-byte) hex string` };
        }
        return { valid: true, type };
    }
}
//# sourceMappingURL=memo_type_validator.js.map