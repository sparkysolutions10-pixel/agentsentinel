export class EntropyCalculator {
  public static calculateShannonEntropy(input: string): number {
    if (!input || input.length === 0) return 0;
    const freqs: Record<string, number> = {};
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

  public static isHighEntropy(input: string, threshold: number = 4.5): boolean {
    return this.calculateShannonEntropy(input) >= threshold;
  }
}
