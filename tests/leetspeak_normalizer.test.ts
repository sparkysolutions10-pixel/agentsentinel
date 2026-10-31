import { describe, it, expect } from 'vitest';
import { LeetspeakNormalizer } from '../src/utils/leetspeak_normalizer.js';

describe('LeetspeakNormalizer', () => {
  it('normalizes leetspeak keywords to plain English', () => {
    expect(LeetspeakNormalizer.normalize('p4ssw0rd')).toBe('password');
    expect(LeetspeakNormalizer.normalize('$3cr3t')).toBe('secret');
    expect(LeetspeakNormalizer.normalize('d0wnl04d')).toBe('download');
  });

  it('preserves normal text unchanged', () => {
    expect(LeetspeakNormalizer.normalize('regular english text')).toBe('regular english text');
  });
});
