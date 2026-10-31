/**
 * AgentSentinel - Token Length Estimator Utility
 * High-performance character and word heuristic token estimator for context budgets.
 */

export class TokenLengthEstimator {
  public static estimateTokenCount(text: string): number {
    if (!text || typeof text !== 'string') return 0;
    const trimmed = text.trim();
    if (trimmed.length === 0) return 0;

    // Standard calibrated heuristic: approx 4 characters per token for English text
    const charEstimate = Math.ceil(trimmed.length / 4);
    const wordEstimate = Math.ceil(trimmed.split(/\s+/).length * 1.3);

    return Math.max(charEstimate, wordEstimate);
  }

  public static isWithinTokenLimit(text: string, maxTokens: number): boolean {
    return this.estimateTokenCount(text) <= maxTokens;
  }
}
