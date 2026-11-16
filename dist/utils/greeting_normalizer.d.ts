/**
 * AgentSentinel - Greeting Normalizer Utility
 * Strips conversational salutations across multiple languages to extract pure intent.
 */
export declare class GreetingNormalizer {
    private static readonly GREETING_REGEX;
    static isGreeting(text: string): boolean;
    static stripGreeting(text: string): string;
}
//# sourceMappingURL=greeting_normalizer.d.ts.map