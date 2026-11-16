import crypto from 'crypto';
export class Sha512ChecksumCalculator {
    static calculate(data, encoding = 'hex') {
        const hash = crypto.createHash('sha512');
        hash.update(data);
        return hash.digest(encoding);
    }
    static verify(data, expectedDigest) {
        const actual = this.calculate(data, 'hex');
        const cleanExpected = expectedDigest.trim().toLowerCase();
        return actual === cleanExpected;
    }
}
//# sourceMappingURL=sha512_checksum_calculator.js.map