export class JitterBackoffCalculator {
    static calculateFullJitter(attempt, baseMs = 100, maxMs = 10000) {
        const exponential = Math.min(maxMs, baseMs * Math.pow(2, attempt));
        return Math.floor(Math.random() * exponential);
    }
    static calculateEqualJitter(attempt, baseMs = 100, maxMs = 10000) {
        const exponential = Math.min(maxMs, baseMs * Math.pow(2, attempt));
        const half = Math.floor(exponential / 2);
        return half + Math.floor(Math.random() * half);
    }
}
//# sourceMappingURL=jitter_backoff_calculator.js.map