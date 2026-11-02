import crypto from 'crypto';

export class HkdfSessionDeriver {
  public static deriveKey(masterSecret: Buffer, salt: Buffer, info: string, keyLength: number = 32): Buffer {
    const raw = crypto.hkdfSync('sha256', masterSecret, salt, Buffer.from(info, 'utf8'), keyLength);
    return Buffer.from(raw);
  }
}
