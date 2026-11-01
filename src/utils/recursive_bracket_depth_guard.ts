export class RecursiveBracketDepthGuard {
  public static getMaxDepth(input: string): number {
    if (!input || typeof input !== 'string') return 0;
    let currentDepth = 0;
    let maxDepth = 0;

    for (const char of input) {
      if (char === '(' || char === '[' || char === '{') {
        currentDepth++;
        if (currentDepth > maxDepth) maxDepth = currentDepth;
      } else if (char === ')' || char === ']' || char === '}') {
        if (currentDepth > 0) currentDepth--;
      }
    }
    return maxDepth;
  }

  public static isSafe(input: string, maxAllowedDepth: number = 20): boolean {
    return this.getMaxDepth(input) <= maxAllowedDepth;
  }
}
