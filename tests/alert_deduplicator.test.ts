import { describe, it, expect } from 'vitest';
import { AlertDeduplicator } from '../src/utils/alert_deduplicator.js';

describe('AlertDeduplicator', () => {
  it('suppresses duplicate alerts within cooldown window', () => {
    const dedup = new AlertDeduplicator(1000);
    expect(dedup.shouldFire('ssrf_attempt', 1000)).toBe(true);
    expect(dedup.shouldFire('ssrf_attempt', 1500)).toBe(false);
    expect(dedup.shouldFire('ssrf_attempt', 2200)).toBe(true);
  });
});
