import { describe, it, expect } from 'vitest';
import { SorobanTtlExtensionGuard } from '../src/utils/soroban_ttl_extension_guard.js';

describe('SorobanTtlExtensionGuard', () => {
  it('determines whether TTL extension is needed', () => {
    expect(SorobanTtlExtensionGuard.needsExtension(1000, 1100, 200)).toBe(true);
    expect(SorobanTtlExtensionGuard.needsExtension(1000, 1500, 200)).toBe(false);
  });
});
