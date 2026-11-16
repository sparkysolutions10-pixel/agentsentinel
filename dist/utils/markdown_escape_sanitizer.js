/**
 * AgentSentinel - Markdown Escape Sanitizer Utility
 * Escapes Markdown formatting characters to prevent injection of malicious links or headings.
 */
export class MarkdownEscapeSanitizer {
    static ESCAPE_REGEX = /([\\`*_[\]()#+\-.!~|<>{}])/g;
    static UNESCAPE_REGEX = /\\([\\`*_[\]()#+\-.!~|<>{}])/g;
    static escape(text) {
        if (!text || typeof text !== 'string')
            return '';
        return text.replace(this.ESCAPE_REGEX, '\\$1');
    }
    static unescape(text) {
        if (!text || typeof text !== 'string')
            return '';
        return text.replace(this.UNESCAPE_REGEX, '$1');
    }
}
//# sourceMappingURL=markdown_escape_sanitizer.js.map