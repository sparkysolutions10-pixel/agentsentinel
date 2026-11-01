import crypto from 'crypto';

export class Sha512ChecksumCalculator {
  public static calculate(data: string | Buffer, encoding: 'hex' | 'base64' = 'hex'): string {
    const hash = crypto.createHash('sha512');
    hash.update(data);
    return hash.digest(encoding);
  }

  public static verify(data: string | Buffer, expectedDigest: string): boolean {
    const actual = this.calculate(data, 'hex');
    const cleanExpected = expectedDigest.trim().toLowerCase();
    return actual === cleanExpected;
  }
}
