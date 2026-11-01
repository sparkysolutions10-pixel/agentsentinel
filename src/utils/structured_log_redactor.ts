export class StructuredLogRedactor {
  private static readonly SENSITIVE_KEYS = new Set([
    'password', 'token', 'secret', 'apikey', 'authorization', 'privatekey', 'passphrase'
  ]);

  public static redact(obj: any): any {
    if (obj === null || obj === undefined) return obj;
    if (typeof obj !== 'object') return obj;

    if (Array.isArray(obj)) {
      return obj.map(item => this.redact(item));
    }

    const result: Record<string, any> = {};
    for (const [key, val] of Object.entries(obj)) {
      if (this.SENSITIVE_KEYS.has(key.toLowerCase())) {
        result[key] = '[REDACTED]';
      } else if (typeof val === 'object') {
        result[key] = this.redact(val);
      } else {
        result[key] = val;
      }
    }

    return result;
  }
}
