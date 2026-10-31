import { describe, it, expect } from 'vitest';
import { CorsOriginValidator } from '../src/utils/cors_origin_validator.js';

describe('CorsOriginValidator', () => {
  it('allows exact domain origins', () => {
    const allowed = ['https://app.agentsentinel.io'];
    expect(CorsOriginValidator.isOriginAllowed('https://app.agentsentinel.io', allowed)).toBe(true);
    expect(CorsOriginValidator.isOriginAllowed('https://evil.com', allowed)).toBe(false);
  });

  it('matches valid wildcard subdomains while rejecting prefix collisions', () => {
    const allowed = ['https://*.agentsentinel.io'];
    expect(CorsOriginValidator.isOriginAllowed('https://api.agentsentinel.io', allowed)).toBe(true);
    expect(CorsOriginValidator.isOriginAllowed('https://evil-agentsentinel.io', allowed)).toBe(false);
    expect(CorsOriginValidator.isOriginAllowed('null', allowed)).toBe(false);
  });
});
