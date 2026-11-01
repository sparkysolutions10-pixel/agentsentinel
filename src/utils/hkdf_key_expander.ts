import crypto from 'crypto';

export class HkdfKeyExpander {
  public static extract(ikm: Buffer, salt?: Buffer): Buffer {
    const effectiveSalt = salt && salt.length > 0 ? salt : Buffer.alloc(32, 0);
    return crypto.createHmac('sha256', effectiveSalt).update(ikm).digest();
  }

  public static expand(prk: Buffer, info: Buffer, length: number): Buffer {
    const hashLen = 32;
    const n = Math.ceil(length / hashLen);
    let okm = Buffer.alloc(0);
    let prev = Buffer.alloc(0);

    for (let i = 1; i <= n; i++) {
      const hmac = crypto.createHmac('sha256', prk);
      hmac.update(prev);
      hmac.update(info);
      hmac.update(Buffer.from([i]));
      prev = hmac.digest();
      okm = Buffer.concat([okm, prev]);
    }

    return okm.subarray(0, length);
  }

  public static deriveKey(ikm: Buffer, salt: Buffer, info: Buffer, length: number): Buffer {
    const prk = this.extract(ikm, salt);
    return this.expand(prk, info, length);
  }
}
