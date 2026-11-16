/**
 * AgentSentinel - Greeting Normalizer Utility
 * Strips conversational salutations across multiple languages to extract pure intent.
 */
export class GreetingNormalizer {
    static GREETING_REGEX = /^[\s]*(hello|hi|hey|hola|bonjour|namaste|konnichiwa|greetings|good\s+(morning|afternoon|evening))[\s,!.]*/i;
    static isGreeting(text) {
        if (!text || typeof text !== 'string')
            return false;
        return this.GREETING_REGEX.test(text);
    }
    static stripGreeting(text) {
        if (!text || typeof text !== 'string')
            return '';
        return text.replace(this.GREETING_REGEX, '').trim();
    }
}
//# sourceMappingURL=greeting_normalizer.js.map