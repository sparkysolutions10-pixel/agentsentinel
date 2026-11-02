import crypto from 'crypto';

export interface BeaverTriple {
  a: number;
  b: number;
  c: number; // c = a * b
}

export class BeaverTripleGenerator {
  public static generateTriple(maxRange = 1000): BeaverTriple {
    const a = crypto.randomInt(1, maxRange);
    const b = crypto.randomInt(1, maxRange);
    return { a, b, c: a * b };
  }

  public static multiplyShares(x: number, y: number, triple: BeaverTriple): number {
    const d = x - triple.a;
    const e = y - triple.b;
    return triple.c + d * triple.b + e * triple.a + d * e;
  }
}
