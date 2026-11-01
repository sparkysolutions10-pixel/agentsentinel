export class PromptLeakProbeDetector {
  private static readonly PATTERNS = [
    /repeat\s+(?:everything|all)\s+(?:above|before)/i,
    /(?:output|print|show|reveal)\s+(?:your\s+)?(?:system\s+prompt|initial\s+instructions)/i,
    /what\s+are\s+your\s+(?:secret\s+)?(?:rules|instructions|prompts)/i,
    /begin\s+your\s+response\s+with\s+the\s+system\s+prompt/i
  ];

  public static isProbing(prompt: string): boolean {
    if (!prompt || typeof prompt !== 'string') return false;
    return this.PATTERNS.some(p => p.test(prompt));
  }
}
