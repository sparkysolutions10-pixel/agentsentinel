/**
 * ExponentialBackoffCalculator - Exponential backoff with jitter options.
 */
export class ExponentialBackoffCalculator {
    static calculateDelayMs(attempt, baseDelayMs = 200, maxDelayMs = 30000, jitter = 'full', randomSource = Math.random) {
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
//# sourceMappingURL=exponential_backoff_calculator.js.map