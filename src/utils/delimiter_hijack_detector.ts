/**
 * AgentSentinel - Delimiter Hijack Detector Utility
 * Detects attempts to break out of structured prompt fences and XML tags.
 */

export class DelimiterHijackDetector {
  public static hasUnbalancedDelimiters(text: string): boolean {
    if (!text || typeof text !== 'string') return false;

    // Check for odd number of triple backticks
    const backtickBlocks = text.match(/```/g);
    if (backtickBlocks && backtickBlocks.length % 2 !== 0) {
      return true;
    }

    // Check for unmatched common prompt isolation tags
    const tags = ['system', 'context', 'user_input', 'instructions'];
    for (const tag of tags) {
      const openCount = (text.match(new RegExp(`<${tag}[^>]*>`, 'gi')) || []).length;
      const closeCount = (text.match(new RegExp(`</${tag}>`, 'gi')) || []).length;
      if (openCount !== closeCount) {
        return true;
      }
    }

    return false;
  }
}
