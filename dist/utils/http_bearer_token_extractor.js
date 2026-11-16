export class HttpBearerTokenExtractor {
    static extract(authHeader) {
        if (!authHeader || typeof authHeader !== 'string')
            return null;
        const match = authHeader.trim().match(/^bearer\s+([a-zA-Z0-9._~+\/-]+=*)$/i);
        return match ? match[1] : null;
    }
}
//# sourceMappingURL=http_bearer_token_extractor.js.map