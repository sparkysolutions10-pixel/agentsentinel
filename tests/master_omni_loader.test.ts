import { describe, it, expect } from 'vitest';
import { MasterOmniLoader } from '../src/utils/master_omni_loader.js';

describe('MasterOmniLoader', () => {
  it('loads and verifies all 100 enterprise modules from Sprint 3', () => {
    const res = MasterOmniLoader.loadAll();
    expect(res.loadedCount).toBe(100);
    expect(res.verified).toBe(true);
  });
});
