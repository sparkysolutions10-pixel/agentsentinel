/**
 * AgentSentinel - Invisible Character Scrubber Utility
 * Removes zero-width Unicode characters, joiners, and hidden whitespace bypass vectors.
 */
export declare class InvisibleCharScrubber {
    private static readonly INVISIBLE_REGEX;
    static scrub(text: string): string;
    static hasInvisibleChars(text: string): boolean;
}
//# sourceMappingURL=invisible_char_scrubber.d.ts.map