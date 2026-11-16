/**
 * Strips or escapes HTML tags and entities from agent outputs to prevent XSS.
 */
export class HtmlTagSanitizer {
    static ENTITY_MAP = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
    };
    static escape(input) {
        if (!input || typeof input !== 'string')
            return '';
        return input.replace(/[&<>"']/g, char => this.ENTITY_MAP[char] || char);
    }
    static stripTags(input) {
        if (!input || typeof input !== 'string')
            return '';
        return input.replace(/<[^>]*>/g, '');
    }
    static stripScriptAndStyle(input) {
        if (!input || typeof input !== 'string')
            return '';
        return input
            .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
            .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '');
    }
}
//# sourceMappingURL=html_tag_sanitizer.js.map