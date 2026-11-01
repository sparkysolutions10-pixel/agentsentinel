import crypto from 'crypto';

export interface ScryptOptions {
  N?: number;
  r?: number;
  p?: number;
  keylen?: number;
}

export class ScryptHasher {
  public static hashSync(password: string, salt: string | Buffer, options: ScryptOptions = {}): Buffer {
    const keylen = options.keylen ?? 32;
    const saltBuf = typeof salt === 'string' ? Buffer.from(salt, 'utf-8') : salt;
    return crypto.scryptSync(password, saltBuf, keylen, {
      N: options.N ?? 1024,
      r: options.r ?? 8,
      p: options.p ?? 1
    });
  }

  public static hashHex(password: string, salt: string | Buffer, options: ScryptOptions = {}): string {
    return this.hashSync(password, salt, options).toString('hex');
  }
}
