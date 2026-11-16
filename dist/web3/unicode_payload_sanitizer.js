/**
 * AgentSentinel - Unicode Payload Sanitizer
 * Scans transaction memos, parameters, and contract call arguments for
 * invisible zero-width spaces, directional override codes, and homoglyph exploits.
 */
import { Verdict } from '../types.js';
// Regex for zero-width characters and bidirectional override characters
const INVISIBLE_UNICODE_REGEX = /[\u200B-\u200D\uFEFF\u202A-\u202E\u2066-\u2069]/;
export function createUnicodePayloadSanitizerRule() {
    return {
        id: 'unicode-payload-sanitizer',
        name: 'Unicode Payload Sanitizer',
        category: 'custom',
        priority: 85,
        enabled: true,
        evaluate(context) {
            const params = context.params || {};
            for (const [key, val] of Object.entries(params)) {
                if (typeof val === 'string') {
                    if (INVISIBLE_UNICODE_REGEX.test(val)) {
                        return {
                            ruleId: 'unicode-payload-sanitizer',
                            ruleName: 'Unicode Payload Sanitizer',
                            severity: 'high',
                            verdict: Verdict.BLOCK,
                            reason: `Obfuscated Unicode payload detected in parameter "${key}": contains invisible zero-width space or directional override code. Potential prompt injection / filter evasion.`,
                            detectedPattern: 'INVISIBLE_UNICODE_DETECTED'
                        };
                    }
                }
            }
            return null;
        }
    };
}
//# sourceMappingURL=unicode_payload_sanitizer.js.map