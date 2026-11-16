/**
 * AgentSentinel - Leetspeak Normalizer Utility
 * Normalizes common leetspeak substitutions to standard characters for keyword filtering.
 */
export class LeetspeakNormalizer {
    static LEET_MAP = {
        '0': 'o',
        '1': 'i',
        '!': 'i',
        '|': 'l',
        '3': 'e',
        '4': 'a',
        '@': 'a',
        '5': 's',
        '$': 's',
        '7': 't',
        '+': 't',
        '8': 'b'
    };
    static normalize(text) {
        if (!text || typeof text !== 'string')
            return '';
        const lower = text.toLowerCase();
        let result = '';
        for (let i = 0; i < lower.length; i++) {
            const char = lower[i];
            result += this.LEET_MAP[char] ?? char;
        }
        return result;
    }
}
//# sourceMappingURL=leetspeak_normalizer.js.map