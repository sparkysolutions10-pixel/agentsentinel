import crypto from 'crypto';
export class CryptoExecutionJitter {
    static getRandomJitterMicroseconds(minUs = 50, maxUs = 500) {
        const range = maxUs - minUs;
        const randByte = crypto.randomBytes(2).readUInt16LE(0);
        return minUs + (randByte % range);
    }
    static async injectJitterMs(minMs = 1, maxMs = 5) {
        const range = maxMs - minMs;
        const rand = crypto.randomBytes(1)[0] % (range + 1);
        const delay = minMs + rand;
        return new Promise(resolve => setTimeout(resolve, delay));
    }
}
//# sourceMappingURL=jitter_injector.js.map