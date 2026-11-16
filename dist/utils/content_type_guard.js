/**
 * AgentSentinel - Content Type Guard Utility
 * Validates Content-Type header strings and ensures strict application/json adherence.
 */
export class ContentTypeGuard {
    static getBaseMimeType(contentType) {
        if (!contentType || typeof contentType !== 'string')
            return '';
        return contentType.split(';')[0].trim().toLowerCase();
    }
    static isJsonContentType(contentType) {
        const base = this.getBaseMimeType(contentType);
        return base === 'application/json' || base === 'application/vnd.api+json' || base.endsWith('+json');
    }
}
//# sourceMappingURL=content_type_guard.js.map