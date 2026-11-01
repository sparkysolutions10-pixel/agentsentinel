/**
 * RFC 4648 compliant Base64URL encoder and decoder.
 */
export class Base64UrlEncoder {
  public static encode(input: string | Uint8Array): string {
    const buf = typeof input === 'string' ? Buffer.from(input, 'utf-8') : Buffer.from(input);
    return buf
      .toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');
  }

  public static decode(input: string): string {
    if (!input || typeof input !== 'string') return '';
    let base64 = input.replace(/-/g, '+').replace(/_/g, '/');
    while (base64.length % 4 !== 0) {
      base64 += '=';
    }
    return Buffer.from(base64, 'base64').toString('utf-8');
  }

  public static decodeToBuffer(input: string): Buffer {
    let base64 = (input || '').replace(/-/g, '+').replace(/_/g, '/');
    while (base64.length % 4 !== 0) {
      base64 += '=';
    }
    return Buffer.from(base64, 'base64');
  }
}
