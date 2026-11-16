export class PromptLeakProbeDetector {
    static PATTERNS = [
        /repeat\s+(?:everything|all)\s+(?:above|before)/i,
        /(?:output|print|show|reveal)\s+(?:your\s+)?(?:system\s+prompt|initial\s+instructions)/i,
        /what\s+are\s+your\s+(?:secret\s+)?(?:rules|instructions|prompts)/i,
        /begin\s+your\s+response\s+with\s+the\s+system\s+prompt/i
    ];
    static isProbing(prompt) {
        if (!prompt || typeof prompt !== 'string')
            return false;
        return this.PATTERNS.some(p => p.test(prompt));
    }
}
//# sourceMappingURL=prompt_leak_probe_detector.js.map