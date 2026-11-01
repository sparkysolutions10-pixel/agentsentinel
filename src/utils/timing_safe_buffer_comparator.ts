import crypto from 'crypto';

export class TimingSafeBufferComparator {
  public static equals(a: Buffer, b: Buffer): boolean {
    if (!Buffer.isBuffer(a) || !Buffer.isBuffer(b)) {
      return false;
    }

    if (a.length !== b.length) {
      // Execute dummy timingSafeEqual to avoid timing discrepancy
      const dummy = Buffer.alloc(a.length);
      crypto.timingSafeEqual(a, dummy);
      return false;
    }

    return crypto.timingSafeEqual(a, b);
  }
}
