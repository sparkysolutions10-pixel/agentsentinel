import crypto from 'crypto';

export class TotpValidator {
  public static generateCode(secret: Buffer, timeStepSeconds: number = 30, timestampMs: number = Date.now()): string {
    const counter = Math.floor(timestampMs / 1000 / timeStepSeconds);
    const counterBuf = Buffer.alloc(8);
    counterBuf.writeBigUInt64BE(BigInt(counter));

    const hmac = crypto.createHmac('sha1', secret).update(counterBuf).digest();
    const offset = hmac[hmac.length - 1] & 0xf;
    const codeInt = (hmac.readUInt32BE(offset) & 0x7fffffff) % 1000000;
    return codeInt.toString().padStart(6, '0');
  }

  public static verifyCode(token: string, secret: Buffer, windowSteps: number = 1, timeStepSeconds: number = 30, timestampMs: number = Date.now()): boolean {
    if (!token || token.length !== 6) return false;
    const currentCounter = Math.floor(timestampMs / 1000 / timeStepSeconds);

    for (let i = -windowSteps; i <= windowSteps; i++) {
      const stepTimeMs = (currentCounter + i) * timeStepSeconds * 1000;
      const expected = this.generateCode(secret, timeStepSeconds, stepTimeMs);
      if (crypto.timingSafeEqual(Buffer.from(token), Buffer.from(expected))) {
        return true;
      }
    }
    return false;
  }
}
