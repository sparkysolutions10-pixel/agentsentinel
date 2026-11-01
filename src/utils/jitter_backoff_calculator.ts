export class JitterBackoffCalculator {
  public static calculateFullJitter(attempt: number, baseMs: number = 100, maxMs: number = 10000): number {
    const exponential = Math.min(maxMs, baseMs * Math.pow(2, attempt));
    return Math.floor(Math.random() * exponential);
  }

  public static calculateEqualJitter(attempt: number, baseMs: number = 100, maxMs: number = 10000): number {
    const exponential = Math.min(maxMs, baseMs * Math.pow(2, attempt));
    const half = Math.floor(exponential / 2);
    return half + Math.floor(Math.random() * half);
  }
}
