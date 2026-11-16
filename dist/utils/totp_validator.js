import crypto from 'crypto';
export class TotpValidator {
    static generateCode(secret, timeStepSeconds = 30, timestampMs = Date.now()) {
        const counter = Math.floor(timestampMs / 1000 / timeStepSeconds);
        const counterBuf = Buffer.alloc(8);
        counterBuf.writeBigUInt64BE(BigInt(counter));
        const hmac = crypto.createHmac('sha1', secret).update(counterBuf).digest();
        const offset = hmac[hmac.length - 1] & 0xf;
        const codeInt = (hmac.readUInt32BE(offset) & 0x7fffffff) % 1000000;
        return codeInt.toString().padStart(6, '0');
    }
    static verifyCode(token, secret, windowSteps = 1, timeStepSeconds = 30, timestampMs = Date.now()) {
        if (!token || token.length !== 6)
            return false;
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
//# sourceMappingURL=totp_validator.js.map