import { describe, it, expect } from 'vitest';
import { AtomicWriteHelper } from '../src/utils/atomic_write_helper.js';

describe('AtomicWriteHelper', () => {
  it('generates sibling staging path in same directory', () => {
    const staging = AtomicWriteHelper.getStagingPath('/data/config.json');
    expect(staging).toMatch(/[\\/]data[\\/]\.config\.json\.[0-9a-f]{12}\.tmp$/);
  });

  it('detects staging paths accurately', () => {
    expect(AtomicWriteHelper.isStagingPath('.data.json.123abc456def.tmp')).toBe(true);
    expect(AtomicWriteHelper.isStagingPath('data.json')).toBe(false);
  });
});
