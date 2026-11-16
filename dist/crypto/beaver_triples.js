import crypto from 'crypto';
export class BeaverTripleGenerator {
    static generateTriple(maxRange = 1000) {
        const a = crypto.randomInt(1, maxRange);
        const b = crypto.randomInt(1, maxRange);
        return { a, b, c: a * b };
    }
    static multiplyShares(x, y, triple) {
        const d = x - triple.a;
        const e = y - triple.b;
        return triple.c + d * triple.b + e * triple.a + d * e;
    }
}
//# sourceMappingURL=beaver_triples.js.map