export class JwtClaimsExtractor {
    static extractPayload(token) {
        if (!token || typeof token !== 'string')
            return null;
        const parts = token.trim().split('.');
        if (parts.length !== 3)
            return null;
        try {
            const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
            const json = Buffer.from(base64, 'base64').toString('utf-8');
            return JSON.parse(json);
        }
        catch {
            return null;
        }
    }
    static isExpired(token, clockSkewSec = 0) {
        const claims = this.extractPayload(token);
        if (!claims || typeof claims.exp !== 'number') {
            return false;
        }
        const nowSec = Math.floor(Date.now() / 1000);
        return claims.exp + clockSkewSec <= nowSec;
    }
}
//# sourceMappingURL=jwt_claims_extractor.js.map