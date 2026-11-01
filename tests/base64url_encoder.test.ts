import { describe, it, expect } from 'vitest';
import { Base64UrlEncoder } from '../src/utils/base64url_encoder.js';

describe('Base64UrlEncoder', () => {
  it('encodes string into URL-safe base64 without padding', () => {
    const raw = 'AgentSentinel > Soroban & Web3';
    const encoded = Base64UrlEncoder.encode(raw);
    expect(encoded).not.toContain('+');
    expect(encoded).not.toContain('/');
    expect(encoded).not.toContain('=');
    expect(Base64UrlEncoder.decode(encoded)).toBe(raw);
  });

  it('handles binary Uint8Array inputs', () => {
    const binary = new Uint8Array([0, 255, 128, 64]);
    const encoded = Base64UrlEncoder.encode(binary);
    const decodedBuf = Base64UrlEncoder.decodeToBuffer(encoded);
    expect(new Uint8Array(decodedBuf)).toEqual(binary);
  });
});
