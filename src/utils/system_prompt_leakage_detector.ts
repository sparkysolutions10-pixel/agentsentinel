/**
 * AgentSentinel - System Prompt Leakage Detector Utility
 * Inspects agent responses for system instruction leaks and canary token disclosures.
 */

export class SystemPromptLeakageDetector {
  private static readonly LEAK_PATTERNS = [
    /my\s+system\s+prompt\s+is/i,
    /here\s+are\s+my\s+instructions/i,
    /i\s+am\s+instructed\s+to\s+act\s+as/i,
    /system\s+instructions\s*:/i,
    /you\s+are\s+a\s+helpful\s+assistant/i
  ];

  public static containsLeakage(response: string, canaryTokens: string[] = []): boolean {
    if (!response || typeof response !== 'string') return false;

    // Check custom canary tokens
    for (const token of canaryTokens) {
      if (token && response.includes(token)) {
        return true;
      }
    }

    // Check standard leakage phrases
    for (const pattern of this.LEAK_PATTERNS) {
      if (pattern.test(response)) {
        return true;
      }
    }

    return false;
  }
}
