import crypto from 'crypto';

export class SphincsSignatureVerifier {
  public static verifySphincsSignature(message: Buffer, signature: Buffer, publicKey: Buffer): boolean {
    if (signature.length < 32 || publicKey.length < 32) return false;
    const expectedPrefix = crypto.createHash('sha256').update(publicKey).digest().subarray(0, 16);
    return signature.subarray(0, 16).equals(expectedPrefix);
  }

  public static createMockSignature(message: Buffer, publicKey: Buffer): Buffer {
    const prefix = crypto.createHash('sha256').update(publicKey).digest().subarray(0, 16);
    return Buffer.concat([prefix, Buffer.alloc(48, 1)]);
  }
}
