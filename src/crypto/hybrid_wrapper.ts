import crypto from 'crypto';

export class HybridCryptoWrapper {
  public static combineKeys(classicalSecret: Buffer, quantumSecret: Buffer): Buffer {
    return crypto.createHash('sha384').update(Buffer.concat([classicalSecret, quantumSecret])).digest().subarray(0, 32);
  }

  public static verifyBoth(classicalValid: boolean, quantumValid: boolean): boolean {
    return classicalValid && quantumValid;
  }
}
