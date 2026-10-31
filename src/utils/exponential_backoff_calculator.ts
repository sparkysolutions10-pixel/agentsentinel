/**
 * ExponentialBackoffCalculator - Exponential backoff with jitter options.
 */

export type JitterMode = 'none' | 'full' | 'equal';

export class ExponentialBackoffCalculator {
  public static calculateDelayMs(
    attempt: number,
    baseDelayMs: number = 200,
    maxDelayMs: number = 30000,
    jitter: JitterMode = 'full',
    randomSource: () => number = Math.random
  ): number {
    const normalizedAttempt = Math.max(0, Math.floor(attempt));
    const rawDelay = baseDelayMs * Math.pow(2, normalizedAttempt);
    const cappedDelay = Math.min(maxDelayMs, rawDelay);

    if (jitter === 'none') {
      return cappedDelay;
    }

    if (jitter === 'full') {
      return Math.floor(randomSource() * cappedDelay);
    }

    // equal jitter: half deterministic, half randomized
    const half = cappedDelay / 2;
    return Math.floor(half + randomSource() * half);
  }
}
