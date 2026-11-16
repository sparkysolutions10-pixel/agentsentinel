export class InstructionOverrideDetector {
    static PATTERNS = [
        /ignore\s+(?:all\s+)?(?:previous|prior|above)\s+(?:instructions|rules|prompts|directives)/i,
        /disregard\s+(?:all\s+)?(?:previous|prior|system)\s+(?:instructions|rules|prompts)/i,
        /forget\s+(?:all\s+)?(?:previous|prior|everything)\s+(?:above|rules|instructions)/i,
        /bypass\s+(?:all\s+)?(?:safety|system|filter)\s+(?:guidelines|rules|filters)/i,
        /new\s+(?:system\s+)?directive\s*:/i
    ];
    static hasOverrideAttempt(prompt) {
        if (!prompt || typeof prompt !== 'string')
            return false;
        return this.PATTERNS.some(pattern => pattern.test(prompt));
    }
}
//# sourceMappingURL=instruction_override_detector.js.map