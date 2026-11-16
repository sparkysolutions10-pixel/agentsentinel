export class StructuredLogRedactor {
    static SENSITIVE_KEYS = new Set([
        'password', 'token', 'secret', 'apikey', 'authorization', 'privatekey', 'passphrase'
    ]);
    static redact(obj) {
        if (obj === null || obj === undefined)
            return obj;
        if (typeof obj !== 'object')
            return obj;
        if (Array.isArray(obj)) {
            return obj.map(item => this.redact(item));
        }
        const result = {};
        for (const [key, val] of Object.entries(obj)) {
            if (this.SENSITIVE_KEYS.has(key.toLowerCase())) {
                result[key] = '[REDACTED]';
            }
            else if (typeof val === 'object') {
                result[key] = this.redact(val);
            }
            else {
                result[key] = val;
            }
        }
        return result;
    }
}
//# sourceMappingURL=structured_log_redactor.js.map