import { describe, it, expect } from 'vitest';
import { JwtClaimsExtractor } from '../src/utils/jwt_claims_extractor.js';

describe('JwtClaimsExtractor', () => {
  const payload = { sub: 'agent-42', iss: 'sentinel', exp: 2500000000 };
  const b64Payload = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const validToken = `eyJhbGciOiJIUzI1NiJ9.${b64Payload}.signature`;

  it('extracts payload claims safely', () => {
    const claims = JwtClaimsExtractor.extractPayload(validToken);
    expect(claims?.sub).toBe('agent-42');
    expect(claims?.iss).toBe('sentinel');
    expect(claims?.exp).toBe(2500000000);
  });

  it('evaluates expiration correctly', () => {
    expect(JwtClaimsExtractor.isExpired(validToken)).toBe(false);

    const expiredPayload = { sub: 'agent-42', exp: 1000 };
    const b64Exp = Buffer.from(JSON.stringify(expiredPayload)).toString('base64url');
    const expiredToken = `header.${b64Exp}.sig`;
    expect(JwtClaimsExtractor.isExpired(expiredToken)).toBe(true);
  });

  it('returns null on invalid token formats', () => {
    expect(JwtClaimsExtractor.extractPayload('not.a.valid.jwt.token')).toBe(null);
    expect(JwtClaimsExtractor.extractPayload('')).toBe(null);
  });
});
