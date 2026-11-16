/**
 * Safe unverified JWT header and payload inspector.
 */
export interface JwtClaims {
    iss?: string;
    sub?: string;
    aud?: string | string[];
    exp?: number;
    nbf?: number;
    iat?: number;
    jti?: string;
    [key: string]: any;
}
export declare class JwtClaimsExtractor {
    static extractPayload(token: string): JwtClaims | null;
    static isExpired(token: string, clockSkewSec?: number): boolean;
}
//# sourceMappingURL=jwt_claims_extractor.d.ts.map