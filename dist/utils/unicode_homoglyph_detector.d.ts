/**
 * Detects Unicode homoglyphs and confusable characters used in spoofing attacks.
 */
export declare class UnicodeHomoglyphDetector {
    private static readonly HOMOGLYPH_MAP;
    static hasHomoglyphs(input: string): boolean;
    static normalize(input: string): string;
    static countHomoglyphs(input: string): number;
}
//# sourceMappingURL=unicode_homoglyph_detector.d.ts.map