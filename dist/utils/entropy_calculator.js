export class EntropyCalculator {
    static calculateShannonEntropy(input) {
        if (!input || input.length === 0)
            return 0;
        const freqs = {};
        for (const char of input) {
            freqs[char] = (freqs[char] || 0) + 1;
        }
        let entropy = 0;
        const len = input.length;
        for (const char in freqs) {
            const p = freqs[char] / len;
            entropy -= p * Math.log2(p);
        }
        return entropy;
    }
    static isHighEntropy(input, threshold = 4.5) {
        return this.calculateShannonEntropy(input) >= threshold;
    }
}
//# sourceMappingURL=entropy_calculator.js.map