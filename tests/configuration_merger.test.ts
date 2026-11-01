import { describe, it, expect } from 'vitest';
import { ConfigurationMerger } from '../src/utils/configuration_merger.js';

describe('ConfigurationMerger', () => {
  it('deep merges configurations cleanly', () => {
    const def = { engine: { mode: 'audit', timeout: 5000 }, logging: true };
    const over = { engine: { timeout: 10000 } };
    const merged = ConfigurationMerger.merge(def, over);
    expect(merged.engine.mode).toBe('audit');
    expect(merged.engine.timeout).toBe(10000);
    expect(merged.logging).toBe(true);
  });
});
