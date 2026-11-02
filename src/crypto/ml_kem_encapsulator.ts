import crypto from 'crypto';

export class MlKemEncapsulator {
  public static encapsulate(publicKey: Buffer): { ciphertext: Buffer; sharedSecret: Buffer } {
    const sharedSecret = crypto.randomBytes(32);
    const ciphertext = crypto.createHash('sha384').update(Buffer.concat([publicKey, sharedSecret])).digest();
    return { ciphertext, sharedSecret };
  }

  public static decapsulate(ciphertext: Buffer, privateKey: Buffer): Buffer {
    return crypto.createHash('sha256').update(Buffer.concat([ciphertext, privateKey])).digest();
  }
}
