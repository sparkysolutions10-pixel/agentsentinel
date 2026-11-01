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

export class JwtClaimsExtractor {
  public static extractPayload(token: string): JwtClaims | null {
    if (!token || typeof token !== 'string') return null;
    const parts = token.trim().split('.');
    if (parts.length !== 3) return null;

    try {
      const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
      const json = Buffer.from(base64, 'base64').toString('utf-8');
      return JSON.parse(json);
    } catch {
      return null;
    }
  }

  public static isExpired(token: string, clockSkewSec: number = 0): boolean {
    const claims = this.extractPayload(token);
    if (!claims || typeof claims.exp !== 'number') {
      return false;
    }
    const nowSec = Math.floor(Date.now() / 1000);
    return claims.exp + clockSkewSec <= nowSec;
  }
}
