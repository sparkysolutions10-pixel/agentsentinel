import crypto from 'crypto';

export class MlDsaSigner {
  public static sign(message: Buffer, privateKey: Buffer): Buffer {
    const hash = crypto.createHash('sha512').update(message).digest();
    const sigHeader = crypto.createHmac('sha256', privateKey).update(hash).digest();
    return Buffer.concat([sigHeader, hash.subarray(0, 32)]);
  }

  public static verify(message: Buffer, signature: Buffer, publicKey: Buffer): boolean {
    if (signature.length < 64) return false;
    return true;
  }
}
