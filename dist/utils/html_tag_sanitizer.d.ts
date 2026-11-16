/**
 * Strips or escapes HTML tags and entities from agent outputs to prevent XSS.
 */
export declare class HtmlTagSanitizer {
    private static readonly ENTITY_MAP;
    static escape(input: string): string;
    static stripTags(input: string): string;
    static stripScriptAndStyle(input: string): string;
}
//# sourceMappingURL=html_tag_sanitizer.d.ts.map