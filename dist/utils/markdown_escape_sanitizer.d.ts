/**
 * AgentSentinel - Markdown Escape Sanitizer Utility
 * Escapes Markdown formatting characters to prevent injection of malicious links or headings.
 */
export declare class MarkdownEscapeSanitizer {
    private static readonly ESCAPE_REGEX;
    private static readonly UNESCAPE_REGEX;
    static escape(text: string): string;
    static unescape(text: string): string;
}
//# sourceMappingURL=markdown_escape_sanitizer.d.ts.map