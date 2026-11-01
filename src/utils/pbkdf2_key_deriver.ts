import crypto from 'crypto';

export interface Pbkdf2Options {
  iterations?: number;
  keylen?: number;
  digest?: string;
}

export class Pbkdf2KeyDeriver {
  public static deriveKey(password: string, salt: string | Buffer, options: Pbkdf2Options = {}): Buffer {
    const iterations = options.iterations ?? 100000;
    const keylen = options.keylen ?? 32;
    const digest = options.digest ?? 'sha256';
    const saltBuf = typeof salt === 'string' ? Buffer.from(salt, 'utf-8') : salt;

    return crypto.pbkdf2Sync(password, saltBuf, iterations, keylen, digest);
  }

  public static deriveHexKey(password: string, salt: string | Buffer, options: Pbkdf2Options = {}): string {
    return this.deriveKey(password, salt, options).toString('hex');
  }
}
