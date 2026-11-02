import crypto from 'crypto';

export class CryptoExecutionJitter {
  public static getRandomJitterMicroseconds(minUs: number = 50, maxUs: number = 500): number {
    const range = maxUs - minUs;
    const randByte = crypto.randomBytes(2).readUInt16LE(0);
    return minUs + (randByte % range);
  }

  public static async injectJitterMs(minMs: number = 1, maxMs: number = 5): Promise<void> {
    const range = maxMs - minMs;
    const rand = crypto.randomBytes(1)[0] % (range + 1);
    const delay = minMs + rand;
    return new Promise(resolve => setTimeout(resolve, delay));
  }
}
