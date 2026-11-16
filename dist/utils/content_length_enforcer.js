export class ContentLengthEnforcer {
    static isWithinLimit(headerValue, maxBytes) {
        if (headerValue === undefined || headerValue === null)
            return true;
        const parsed = typeof headerValue === 'number' ? headerValue : parseInt(headerValue.trim(), 10);
        if (isNaN(parsed) || parsed < 0)
            return false;
        return parsed <= maxBytes;
    }
}
//# sourceMappingURL=content_length_enforcer.js.map